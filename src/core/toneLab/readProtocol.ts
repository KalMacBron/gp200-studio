// Read-only wire protocol ported from the hardware-tested native Patch Lab reader.
export const GP_HEADER=Object.freeze([0xf0,0x21,0x25,0x7e,0x47,0x50,0x2d,0x32]);
export function identityQuery():Uint8Array{return new Uint8Array([...GP_HEADER,0x11,4,0,0,0,0,1,2,0,0,0,0,0,0xf7]);}
export const IDENTITY_QUERY=identityQuery();
export function readQuery(slot:number):Uint8Array {
  if(!Number.isInteger(slot)||slot<0||slot>255)throw new Error('Preset slot must be 0–255');
  const b=new Uint8Array(46);b.set([...GP_HEADER,0x11,0x10]);b[18]=4;b[22]=1;b[30]=1;b[34]=4;
  for(const at of [25,37,41]){b[at]=slot>>4;b[at+1]=slot&15;}b[45]=0xf7;return b;
}
export function decodeNibbles(b:Uint8Array):Uint8Array {
  if(b.length%2||b.some(x=>x>15))throw new Error('Invalid nibble payload');
  return Uint8Array.from({length:b.length/2},(_,i)=>(b[2*i]<<4)|b[2*i+1]);
}
export function hasGPHeader(b:Uint8Array):boolean{return GP_HEADER.every((n,i)=>b[i]===n);}
export class SysExStream {
  private pending:number[]=[];
  feed(bytes:Uint8Array):Uint8Array[]{
    const messages:Uint8Array[]=[];
    for(const b of bytes){
      if(b>=0xf8)continue;
      if(b===0xf0){if(this.pending.length){this.pending=[];throw new Error('Nested SysEx start');}this.pending=[b];}
      else if(this.pending.length){
        if(b===0xf7){this.pending.push(b);messages.push(new Uint8Array(this.pending));this.pending=[];}
        else if(b>=0x80){this.pending=[];throw new Error('MIDI status inside SysEx');}
        else this.pending.push(b);
        if(this.pending.length>16384){this.pending=[];throw new Error('SysEx exceeds bound');}
      }
    }return messages;
  }
}
export class PresetAssembly {
  readonly frames:Uint8Array[]=[];
  private total:number|undefined;
  private pieces=new Map<number,Uint8Array>();
  readonly slot:number;
  constructor(slot:number){readQuery(slot);this.slot=slot;}
  accept(frame:Uint8Array):Uint8Array|undefined {
    if(frame.length<14||!hasGPHeader(frame)||frame[8]!==0x12||frame.at(-1)!==0xf7||frame.subarray(9,13).some(b=>b>127))throw new Error('Unexpected preset envelope');
    const total=frame[9]+128*frame[10],offset=frame[11]+128*frame[12],part=decodeNibbles(frame.subarray(13,-1));
    if(![1176,1184].includes(total)||!part.length||part.length>185||offset+part.length>total||(this.total!==undefined&&this.total!==total))throw new Error('Inconsistent preset chunk');
    for(const [start,old] of this.pieces)if(offset<start+old.length&&start<offset+part.length)throw new Error('Duplicate or overlapping preset chunk');
    if(this.frames.length>=32)throw new Error('Preset reply exceeded frame limit');
    this.total=total;this.pieces.set(offset,part);this.frames.push(frame.slice());
    const body=new Uint8Array(total);let position=0;
    for(const [start,part] of [...this.pieces].sort((a,b)=>a[0]-b[0])){if(start!==position)return;body.set(part,start);position+=part.length;}
    if(position!==total)return;
    if(body[0]!==0||body[1]!==0||body[2]!==4||body[3]!==0)throw new Error(`Unexpected preset record header: ${[...body.slice(0,8)].map(n=>n.toString(16).padStart(2,'0')).join(' ')}; reconnect before another attempt`);
    const received=body[6]+256*body[7];if(received!==this.slot)throw new Error(`Preset response slot mismatch: requested slot ${this.slot}, received ${received}; reconnect before another attempt`);
    return body;
  }
}
export function identityReply(frame:Uint8Array):boolean {
  return frame.length===30&&hasGPHeader(frame)&&frame[8]===0x12&&frame[9]===8&&frame[10]===0&&frame[11]===0&&frame[12]===0&&frame.at(-1)===0xf7&&decodeNibbles(frame.subarray(13,-1)).length===8;
}
export async function sha256(bytes:Uint8Array):Promise<string>{
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export function base64(bytes:Uint8Array):string{return btoa(String.fromCharCode(...bytes));}
export function unbase64(s:string):Uint8Array {if(s.length>50000)throw new Error('Oversized backup field');return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
export interface CapturedPreset {slot:number;body:string;frames:string[];sha256:string;name:string}
export async function capturePreset(slot:number,body:Uint8Array,frames:Uint8Array[]):Promise<CapturedPreset>{
  const preset={slot,body:base64(body),frames:frames.map(base64),sha256:await sha256(body),name:String.fromCharCode(...body.subarray(28,44)).split('\0')[0]};
  await verifyPreset(preset);return preset;
}
export async function verifyPreset(p:CapturedPreset):Promise<void>{
  if(p.frames.length>32)throw new Error('Too many backup frames');
  const assembly=new PresetAssembly(p.slot);let body:Uint8Array|undefined;
  for(const f of p.frames)body=assembly.accept(unbase64(f))??body;
  if(!body||base64(body)!==p.body||await sha256(body)!==p.sha256)throw new Error('Backup wire/body/hash verification failed');
}
