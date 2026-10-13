import { afterEach,beforeEach,describe,it,expect,vi } from 'vitest';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import { USBBackup } from '@/components/toneLab/USBBackup';
import { IndexedBackupStore } from '@/core/toneLab/backupStore';
import { GP_HEADER,IDENTITY_QUERY,readQuery } from '@/core/toneLab/readProtocol';
import type { LabOutput } from '@/core/toneLab/readSession';
class Port extends EventTarget implements LabOutput {
  id=crypto.randomUUID();name='GP-200';manufacturer='Valeton';state='connected';sent:Uint8Array[]=[];
  respond:((b:Uint8Array)=>void)|undefined;
  async open(){}async close(){}
  send(b:Uint8Array){this.sent.push(b.slice());this.respond?.(b);}
  receive(b:Uint8Array){const e=new Event('midimessage');Object.defineProperty(e,'data',{value:b});this.dispatchEvent(e);}
}
function setup(){
  const input=new Port(),output=new Port();output.respond=b=>{
    if(b.length===IDENTITY_QUERY.length)input.receive(new Uint8Array([...GP_HEADER,0x12,8,0,0,0,...new Array(16).fill(0),0xf7]));
    else reply((b[25]<<4)|b[26]);
  };
  function reply(slot:number){
    const body=new Uint8Array(1176);body.set([0,0,4,0,1,0,slot,0]);
    for(let off=0;off<body.length;off+=183)input.receive(new Uint8Array([...GP_HEADER,0x12,0x18,9,off&127,off>>7,...[...body.subarray(off,off+183)].flatMap(b=>[b>>4,b&15]),0xf7]));
  }
  const access=vi.fn(async()=>({sysexEnabled:true,inputs:new Map([[input.id,input]]),outputs:new Map([[output.id,output]])}));
  Object.defineProperty(navigator,'requestMIDIAccess',{value:access,configurable:true});
  return {input,output,access,reply};
}
async function connect(){
  fireEvent.click(screen.getByRole('checkbox',{name:/device screen/}));fireEvent.click(screen.getByRole('checkbox',{name:/Other GP-200/}));
  fireEvent.click(screen.getByRole('button',{name:'Connect for safe backup'}));await waitFor(()=>expect(screen.getByRole('button',{name:/Back up 01A/})).toBeEnabled());
}
beforeEach(()=>{vi.stubGlobal('crypto',webcrypto);vi.stubGlobal('indexedDB',new IDBFactory());});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('safe USB backup panel',()=>{
  it('does not request MIDI until explicit connection and backs up the pair with no other commands',async()=>{
    const d=setup();render(<USBBackup liveBank="01A"/>);expect(d.access).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Connect for safe backup'})).toBeDisabled();
    await connect();expect(d.output.sent).toEqual([IDENTITY_QUERY]);
    fireEvent.click(screen.getByRole('button',{name:/Back up 01A/}));await screen.findByRole('button',{name:/Download verified backup \(2\/2\)/});
    expect(d.output.sent).toEqual([IDENTITY_QUERY,readQuery(0),readQuery(64)]);const saved=await new IndexedBackupStore().latest();expect(saved.complete).toBe(true);expect(saved.presets.map(p=>p.slot)).toEqual([0,64]);
  });
  it('recovers a stored backup after reopening the panel without asking for MIDI',async()=>{
    const d=setup();const view=render(<USBBackup liveBank="01A"/>);await connect();fireEvent.click(screen.getByRole('button',{name:/Back up 01A/}));await screen.findByRole('button',{name:/Download verified backup/});
    view.unmount();d.access.mockClear();render(<USBBackup liveBank="01A"/>);fireEvent.click(screen.getByRole('button',{name:'Recover last saved backup'}));
    await screen.findByRole('button',{name:/Download verified backup \(2\/2\)/});expect(d.access).not.toHaveBeenCalled();expect(d.output.sent).toHaveLength(3);
  });
  it('retains the completed first preset on a wrong-slot response, then requires reconnection',async()=>{
    const d=setup();render(<USBBackup liveBank="01A"/>);await connect();d.output.respond=()=>d.reply(0);
    fireEvent.click(screen.getByRole('button',{name:/Back up 01A/}));expect(await screen.findByRole('alert')).toHaveTextContent('slot mismatch');
    await screen.findByRole('button',{name:/Download partial backup \(1\/2\)/});expect(screen.getByRole('button',{name:/Back up 01A/})).toBeDisabled();expect(d.output.sent).toHaveLength(3);
    expect((await new IndexedBackupStore().latest()).presets).toHaveLength(1);
  });
  it('does not request presets if backup storage fails',async()=>{
    const d=setup();render(<USBBackup liveBank="01A"/>);await connect();vi.spyOn(IndexedBackupStore.prototype,'save').mockRejectedValue(new Error('Storage full'));
    fireEvent.click(screen.getByRole('button',{name:/Back up 01A/}));expect(await screen.findByRole('alert')).toHaveTextContent('Storage full');expect(d.output.sent).toEqual([IDENTITY_QUERY]);
  });
  it('cancels an in-flight read, keeps the partial backup, and does not resume',async()=>{
    const d=setup();render(<USBBackup liveBank="01A"/>);await connect();d.output.respond=b=>{if(b[25]===0)d.reply(0);};
    fireEvent.click(screen.getByRole('button',{name:/Back up 01A/}));await waitFor(()=>expect(d.output.sent).toHaveLength(3));
    fireEvent.click(screen.getByRole('button',{name:'Cancel & disconnect'}));await screen.findByRole('button',{name:/Download partial backup \(1\/2\)/});
    expect(screen.getByRole('button',{name:/Back up 01A/})).toBeDisabled();expect((await new IndexedBackupStore().latest()).presets).toHaveLength(1);
  });
});
