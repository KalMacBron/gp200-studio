import { bankSlot, validateTone, type TonePair } from './tones';

// File-only mappings corroborated by upstream PRSTDecoder/effectParams.
// This module has no device transport and does not build USB frames.
const physical: Record<string, number> = {PRE:0, WAH:1, DST:2, AMP:3, NR:4, CAB:5, EQ:6, MOD:7, DLY:8, RVB:9};
const mappings: Record<string, {model:string; id:number; params:Record<string,number>}> = {
  NR:{model:'Gate 3',id:33,params:{THRESHOLD:0,RATIO:1,ATTACK_MS:2,RELEASE_MS:3,HOLD_MS:4,HYSTERESIS_DB:5}},
  AMP:{model:'Dark Twin',id:0x07000004,params:{GAIN:0,VOLUME:1,BASS:2,MIDDLE:3,TREBLE:4}},
  CAB:{model:'Dark Twin',id:0x0a000012,params:{VOLUME:1,LOW_CUT_HZ:5,HI_CUT_HZ:6}},
  RVB:{model:'Room',id:0x0c000000,params:{MIX:0,PRE_DELAY:1,DECAY:2}},
};
const checksumOffset=1222;
export function presetChecksum(bytes:Uint8Array):number {
  let sum=0;for(let i=0;i<checksumOffset;i++)sum=(sum+bytes[i])&0xffff;return sum;
}
export function validateTemplate(bytes:Uint8Array):void {
  if(bytes.length!==1224)throw new Error('Use a full 1224-byte GP-200 .prst export; backup JSON and factory files are not supported here.');
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ascii=(at:number,n:number)=>String.fromCharCode(...bytes.subarray(at,at+n));
  if(ascii(0,4)!=='TSRP'||ascii(16,4)!=='2-PG'||ascii(40,4)!=='MRAP'||v.getUint32(32,true)!==40||v.getUint32(44,true)!==1172)
    throw new Error('Unsupported GP-200 preset header.');
  if(v.getUint16(checksumOffset,false)!==presetChecksum(bytes))throw new Error('Template checksum failed; export it again from the official editor.');
  if(v.getUint16(48,true)!==2||v.getUint16(50,true)!==88||v.getUint16(140,true)!==8||v.getUint16(142,true)!==16)
    throw new Error('Unsupported preset metadata or routing record.');
  if(v.getUint16(52,true)>255||v.getUint16(144,true)!==v.getUint16(52,true))throw new Error('Ambiguous template slot fields; export a fresh preset with matching slot fields.');
  if(new Set(bytes.subarray(148,159)).size!==11||bytes.subarray(148,159).some(n=>n>10))throw new Error('Invalid template effect order.');
  for(const [start,count,type,size] of [[952,9,12,12],[1096,3,16,4],[1120,8,15,8]]){
    for(let i=0;i<count;i++){const at=start+i*(size+4);
      if(v.getUint16(at,true)!==type||v.getUint16(at+2,true)!==size)throw new Error('Unsupported expression or controller record.');
    }
  }
  for(let i=0;i<11;i++){
    const at=160+i*72;
    if(v.getUint16(at,true)!==20||v.getUint16(at+2,true)!==68||bytes[at+4]!==i||bytes[at+5]>1||v.getUint16(at+6,true)!==15)
      throw new Error(`Unsupported effect record ${i}.`);
  }
}
export function exportPresetPair(value:TonePair, template:Uint8Array):{filename:string;bytes:Uint8Array;inherited:string[]}[] {
  const pair=validateTone(value);validateTemplate(template);
  return pair.profiles.map(profile=>{
    const bytes=new Uint8Array(template),v=new DataView(bytes.buffer),inherited:string[]=[];
    for(const block of pair.chain){
      const setting=profile.blocks[block],at=160+physical[block]*72;
      if(setting.model!=null){
        const map=mappings[block];
        if(!map||map.model!==setting.model)throw new Error(`${block}/${setting.model}: preset-file mapping is not yet verified.`);
        if(v.getUint32(at+8,true)!==map.id)throw new Error(`Template needs ${block}: ${setting.model}. Select that model in the official editor, save and export a new template.`);
        for(const key of Object.keys(map.params))if(!Object.hasOwn(setting.parameters,key))throw new Error(`${block}/${key}: complete this control before preset export.`);
        for(const [key,n] of Object.entries(setting.parameters)){
          const index=map.params[key];if(index===undefined)throw new Error(`${block}/${key}: preset-file mapping is not yet verified.`);
          v.setFloat32(at+12+index*4,n,true);
        }
        // Unknown switches retain the matching model's exact existing bytes.
        if(block==='AMP')inherited.push('Dark Twin BRIGHT retained from template');
        if(block==='RVB')inherited.push('Room TRAIL retained from template');
      }
      bytes[at+5]=setting.enabled?1:0;
    }
    const slot=bankSlot(profile.bank);v.setUint16(52,slot,true);v.setUint16(144,slot,true);
    v.setUint16(56,pair.presetVolume,true);bytes.fill(0,68,84);
    for(let i=0;i<pair.name.length;i++)bytes[68+i]=pair.name.charCodeAt(i);
    bytes.set([...pair.chain.map(b=>physical[b]),10],148);
    v.setUint16(checksumOffset,presetChecksum(bytes),false);
    validateTemplate(bytes);
    return {filename:`${pair.name}-${profile.bank}-${profile.kind==='LIVE AMP'?'LIVE':'USB'}.prst`,bytes,inherited};
  });
}
