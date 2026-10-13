import { GP_HEADER } from './readProtocol';
import { validateTemplate } from './presetExport';
/** Offline reconstruction from the official 1.8.0 arm64 editor.
 * Never imported by a device transport. Explicit reserved bytes prevent a
 * guessed value silently becoming a production default.
 */
export function framePayload(payload:Uint8Array,command:0x11|0x12):Uint8Array[]{
  if(!payload.length||payload.length>=16384||![0x11,0x12].includes(command))throw new Error('Unsupported payload length');
  return Array.from({length:Math.ceil(payload.length/183)},(_,i)=>{
    const off=i*183,raw=payload.subarray(off,off+183);
    return new Uint8Array([...GP_HEADER,command,payload.length&127,payload.length>>7,off&127,off>>7,...[...raw].flatMap(b=>[b>>4,b&15]),0xf7]);
  });
}
export function offlineUploadCandidate(file:Uint8Array,slot:number,reservedBytes:readonly [number,number]):{status:'offline-only';unresolved:string[];payload:Uint8Array;frames:Uint8Array[]}{
  validateTemplate(file);
  if(![0,64].includes(slot)||new DataView(file.buffer,file.byteOffset,file.byteLength).getUint16(52,true)!==slot)throw new Error('Only matching approved scratch slots 01A/17A are permitted.');
  if(reservedBytes.length!==2||reservedBytes.some(n=>!Number.isInteger(n)||n<0||n>255))throw new Error('Specify both unresolved reserved bytes explicitly.');
  const payload=new Uint8Array(1184);
  // 0x10010e6fc: type-0 selector, type-1 destination, then serialized records.
  payload.set([0,0,4,0,1,0,slot,0,1,0,4,0,slot,0,...reservedBytes]);payload.set(file.subarray(48,1216),16);
  return {status:'offline-only',unresolved:['Prefix bytes 14–15 have no initialization visible in the official sender.','Flash persistence and whether a separate save operation is required need hardware evidence.'],payload,frames:framePayload(payload,0x12)};
}
