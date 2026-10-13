import { describe,it,expect,vi,afterEach } from 'vitest';
import { webcrypto } from 'node:crypto';
import { GP_HEADER,IDENTITY_QUERY,PresetAssembly,SysExStream,base64,capturePreset,readQuery,verifyPreset } from '@/core/toneLab/readProtocol';
import { ReadOnlySession,uniqueGP200Pair,type LabAccess,type LabOutput } from '@/core/toneLab/readSession';
import { verifyBackup } from '@/core/toneLab/backupStore';
vi.stubGlobal('crypto',webcrypto);
afterEach(()=>{vi.useRealTimers();});
function frames(body:Uint8Array){return Array.from({length:Math.ceil(body.length/183)},(_,i)=>{
  const offset=i*183,part=body.subarray(offset,offset+183);
  return new Uint8Array([...GP_HEADER,0x12,body.length&127,body.length>>7,offset&127,offset>>7,...[...part].flatMap(b=>[b>>4,b&15]),0xf7]);
});}
function body(slot=0){const b=new Uint8Array(1176);b.set([0,0,4,0,1,0,slot,0]);b.set([84,69,83,84],28);return b;}
const identity=new Uint8Array([...GP_HEADER,0x12,8,0,0,0,...new Array(16).fill(0),0xf7]);
class Port extends EventTarget implements LabOutput {
  id=crypto.randomUUID();name='GP-200';manufacturer='Valeton';state='connected';sent:Uint8Array[]=[];
  respond:((bytes:Uint8Array)=>void)|undefined;
  async open(){}async close(){}
  send(bytes:Uint8Array){this.sent.push(bytes.slice());this.respond?.(bytes);}
  receive(bytes:Uint8Array){const event=new Event('midimessage');Object.defineProperty(event,'data',{value:bytes});this.dispatchEvent(event);}
}
function device(){const input=new Port(),output=new Port();output.respond=b=>{
  if(b.length===IDENTITY_QUERY.length)input.receive(identity);
  else for(const frame of frames(body((b[25]<<4)|b[26])))input.receive(frame);
};return {input,output,session:new ReadOnlySession(input,output,20)};}
describe('read-only protocol and connection',()=>{
  it('matches the independently verified native request bytes',()=>{
    const q=readQuery(64);expect(q.length).toBe(46);expect([...q.slice(0,10)]).toEqual([...GP_HEADER,0x11,0x10]);
    expect([...q.slice(18,23)]).toEqual([4,0,0,0,1]);for(const at of [25,37,41])expect([...q.slice(at,at+2)]).toEqual([4,0]);expect(q[45]).toBe(0xf7);
    for(const n of [-1,256,0.5,NaN])expect(()=>readQuery(n)).toThrow();
  });
  it('assembles out-of-order chunks and verifies exact raw body/frame/hash agreement',async()=>{
    const b=body(64),parts=frames(b),assembly=new PresetAssembly(64);let result:Uint8Array|undefined;
    for(const p of parts.reverse())result=assembly.accept(p)??result;expect(result).toEqual(b);
    const p=await capturePreset(64,result!,parts);expect(p.sha256).toHaveLength(64);await verifyPreset(p);
    await expect(verifyPreset({...p,sha256:'0'.repeat(64)})).rejects.toThrow('verification failed');
    await expect(verifyPreset({...p,body:base64(body(0))})).rejects.toThrow('verification failed');
  });
  it('rejects duplicate, overlapping, malformed, mismatched-slot and changing-length responses',()=>{
    const f=frames(body()),a=new PresetAssembly(0);a.accept(f[0]);expect(()=>a.accept(f[0])).toThrow('overlapping');
    const overlap=f[1].slice();overlap[11]=1;overlap[12]=0;expect(()=>a.accept(overlap)).toThrow('overlapping');
    const nibble=f[1].slice();nibble[13]=16;expect(()=>new PresetAssembly(0).accept(nibble)).toThrow('nibble');
    const length=f[1].slice();length[9]+=8;expect(()=>a.accept(length)).toThrow('Inconsistent');
    const wrong=new PresetAssembly(64);expect(()=>{for(const p of f)wrong.accept(p);}).toThrow('slot mismatch');
  });
  it('bounds split SysEx and permits interleaved realtime events',()=>{
    const stream=new SysExStream();expect(stream.feed(identity.slice(0,10))).toEqual([]);
    expect(stream.feed(new Uint8Array([0xf8,...identity.slice(10)]))).toEqual([identity]);
    expect(()=>new SysExStream().feed(new Uint8Array([0xf0,0,0xf0]))).toThrow('Nested');
    expect(()=>new SysExStream().feed(new Uint8Array([0xf0,0x90]))).toThrow('status');
    expect(()=>new SysExStream().feed(new Uint8Array([0xf0,...new Array(16385).fill(0)]))).toThrow('bound');
  });
  it('sends only one identity query and requested reads; never selects or writes a preset',async()=>{
    const d=device();await d.session.connect();const preset=await d.session.read(64);expect(preset.slot).toBe(64);
    expect(d.output.sent).toEqual([IDENTITY_QUERY,readQuery(64)]);expect(d.session.connected).toBe(true);d.session.close();
    await expect(d.session.read(0)).rejects.toThrow('Identify');expect(d.output.sent).toHaveLength(2);
  });
  it('uses a fresh identity request even if an external consumer changes the exported sample',async()=>{
    const original=IDENTITY_QUERY.slice();IDENTITY_QUERY[8]=0x12;const d=device();
    try{await d.session.connect();expect(d.output.sent[0]).toEqual(original);expect(d.output.sent[0][8]).toBe(0x11);}
    finally{IDENTITY_QUERY.set(original);d.session.close();}
  });
  it('invalidates a timeout, rejects late replies and never retries automatically',async()=>{
    vi.useFakeTimers();const d=device();await d.session.connect();d.output.respond=undefined;
    const pending=d.session.read(0);const check=expect(pending).rejects.toThrow('timed out');await vi.advanceTimersByTimeAsync(21);await check;
    for(const f of frames(body()))d.input.receive(f);expect(d.session.connected).toBe(false);
    await expect(d.session.read(0)).rejects.toThrow('Identify');expect(d.output.sent).toHaveLength(2);d.session.close();
  });
  it('invalidates malformed replies and device removal during an active read',async()=>{
    const d=device();await d.session.connect();d.output.respond=()=>d.input.receive(identity);
    await expect(d.session.read(0)).rejects.toThrow('Inconsistent');expect(d.session.connected).toBe(false);
    const other=device();await other.session.connect();other.output.respond=()=>{other.input.state='disconnected';other.input.dispatchEvent(new Event('statechange'));};
    await expect(other.session.read(0)).rejects.toThrow('disconnected');expect(other.session.connected).toBe(false);
  });
  it('refuses concurrent reads without disturbing the first read',async()=>{
    const d=device();await d.session.connect();d.output.respond=undefined;const first=d.session.read(0);
    await expect(d.session.read(64)).rejects.toThrow('already running');for(const f of frames(body()))d.input.receive(f);
    expect((await first).slot).toBe(0);expect(d.output.sent).toHaveLength(2);d.session.close();
  });
  it('refuses ambiguous device pairs and mismatched manufacturers',()=>{
    const input=new Port(),output=new Port(),access:LabAccess={sysexEnabled:true,inputs:new Map([[input.id,input]]),outputs:new Map([[output.id,output]])};
    expect(uniqueGP200Pair(access)).toEqual({input,output});const second=new Port();access.inputs.set(second.id,second);expect(()=>uniqueGP200Pair(access)).toThrow('exactly one');
    access.inputs.delete(second.id);output.manufacturer='Other';expect(()=>uniqueGP200Pair(access)).toThrow('manufacturers');
  });
  it('verifies backup order, completion and all raw captures',async()=>{
    const d=device();await d.session.connect();const p=await d.session.read(0);d.session.close();
    const b={kind:'gp200-tone-lab-device-backup',schemaVersion:1,id:crypto.randomUUID(),date:new Date().toISOString(),session:crypto.randomUUID(),input:{id:'i',name:'GP-200'},output:{id:'o',name:'GP-200'},identityReply:base64(identity),firmwareAttestation:'User checked device screen: 1.8.0',requestedSlots:[0,64],presets:[p],complete:false};
    await verifyBackup(b);await expect(verifyBackup({...b,complete:true})).rejects.toThrow('inconsistent');
    await expect(verifyBackup({...b,presets:[p,p]})).rejects.toThrow('inconsistent');await expect(verifyBackup({...b,requestedSlots:[64,0]})).rejects.toThrow('inconsistent');
  });
});
