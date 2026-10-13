import { presetChecksum } from '@/core/toneLab/presetExport';
// Synthetic layout fixture with deliberately nonzero opaque bytes. This is
// file-format regression coverage, not evidence of device write support.
export function toneTemplateFixture(){
  const b=new Uint8Array(1224).fill(0xa5),v=new DataView(b.buffer);
  const text=(at:number,s:string)=>b.set([...s].map(c=>c.charCodeAt(0)),at);
  text(0,'TSRP');text(16,'2-PG');text(40,'MRAP');v.setUint32(32,40,true);v.setUint32(44,1172,true);
  v.setUint16(48,2,true);v.setUint16(50,88,true);v.setUint16(52,0,true);
  v.setUint16(140,8,true);v.setUint16(142,16,true);v.setUint16(144,0,true);b.set([0,1,2,3,4,5,6,7,8,9,10],148);
  for(let i=0;i<11;i++){const at=160+i*72;v.setUint16(at,20,true);v.setUint16(at+2,68,true);b[at+4]=i;b[at+5]=1;v.setUint16(at+6,15,true);}
  for(const [i,id] of [[4,33],[3,0x07000004],[5,0x0a000012],[9,0x0c000000]])v.setUint32(160+i*72+8,id,true);
  v.setFloat32(160+3*72+12+5*4,1,true);v.setFloat32(160+9*72+12+3*4,0,true);
  for(const [start,count,type,size] of [[952,9,12,12],[1096,3,16,4],[1120,8,15,8]])for(let i=0;i<count;i++){const at=start+i*(size+4);v.setUint16(at,type,true);v.setUint16(at+2,size,true);}
  v.setUint16(1222,presetChecksum(b),false);return b;
}
