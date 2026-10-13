import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { exportPresetPair,presetChecksum,validateTemplate } from '@/core/toneLab/presetExport';
import { generateBluesTone } from '@/core/toneLab/tones';

import { toneTemplateFixture as fixture } from '../helpers/toneTemplate';

function repair(b:Uint8Array){new DataView(b.buffer).setUint16(1222,presetChecksum(b),false);return b;}
describe('Tone Lab preset file export',()=>{
  it('creates both paired files, with exact requested controls, routing and checksums',()=>{
    const pair=generateBluesTone('BLUES_CORE_CLN','02B','warm'),base=fixture(),original=base.slice();
    const files=exportPresetPair(pair,base);expect(base).toEqual(original);expect(files).toHaveLength(2);
    for(const [i,file] of files.entries()){
      validateTemplate(file.bytes);const v=new DataView(file.bytes.buffer);
      expect(v.getUint16(52,true)).toBe(i===0?5:69);expect(v.getUint16(144,true)).toBe(i===0?5:69);
      expect(v.getUint16(56,true)).toBe(50);expect(file.bytes[160+5*72+5]).toBe(i);
      expect([...file.bytes.subarray(148,159)]).toEqual([4,0,1,2,3,5,6,7,8,9,10]);
      expect(v.getFloat32(160+4*72+12+3*4,true)).toBe(100);
      expect(v.getFloat32(160+3*72+12+4*4,true)).toBe(40);
      expect(v.getFloat32(160+5*72+12+6*4,true)).toBe(6500);
      expect(v.getFloat32(160+9*72+12+2*4,true)).toBe(20);
      expect(v.getFloat32(160+3*72+12+5*4,true)).toBe(1);expect(v.getFloat32(160+9*72+12+3*4,true)).toBe(0);
      expect(file.filename).toContain(i===0?'02B-LIVE':'18B-USB');
    }
  });
  it('changes only the approved file offsets, preserving every opaque byte',()=>{
    const base=fixture(),file=exportPresetPair(generateBluesTone('TEST','01A','bright'),base)[1].bytes;
    const allowed=new Set<number>();const range=(at:number,n:number)=>{for(let j=0;j<n;j++)allowed.add(at+j);};
    for(const [at,n] of [[52,2],[144,2],[56,2],[68,16],[148,11],[1222,2]])range(at,n);
    for(let i=0;i<10;i++)range(160+i*72+5,1);
    for(const [i,params] of [[4,[0,1,2,3,4,5]],[3,[0,1,2,3,4]],[5,[1,5,6]],[9,[0,1,2]]] as const)
      for(const p of params)range(160+i*72+12+p*4,4);
    for(let i=0;i<base.length;i++)if(!allowed.has(i))expect(file[i],`byte ${i}`).toBe(base[i]);
  });
  it.each([
    ['truncated',(b:Uint8Array)=>b.slice(0,1176)],
    ['bad checksum',(b:Uint8Array)=>{b[100]^=1;return b;}],
    ['bad pointer',(b:Uint8Array)=>{b[32]=0;return repair(b);}],
    ['ambiguous slot',(b:Uint8Array)=>{b[144]=1;return repair(b);}],
    ['duplicate block',(b:Uint8Array)=>{b[160+72+4]=0;return repair(b);}],
    ['bad order',(b:Uint8Array)=>{b[148]=1;return repair(b);}],
    ['bad tail',(b:Uint8Array)=>{b[1120]=0;return repair(b);}],
    ['wrong model',(b:Uint8Array)=>{b[160+9*72+8]=2;return repair(b);}],
  ])('rejects %s without altering the source',(_name,mutate)=>{
    const base=mutate(fixture()),original=base.slice();expect(()=>exportPresetPair(generateBluesTone('TEST','01A','warm'),base)).toThrow();expect(base).toEqual(original);
  });
  it('rejects partial mapped controls and unsupported model mappings',()=>{
    const pair=generateBluesTone('TEST','01A','warm');delete pair.profiles[0].blocks.AMP.parameters.GAIN;
    expect(()=>exportPresetPair(pair,fixture())).toThrow('complete this control');
    const other=generateBluesTone('TEST','01A','warm');other.profiles[0].blocks.RVB.model='Amp Spring';
    other.profiles[0].blocks.RVB.parameters={};expect(()=>exportPresetPair(other,fixture())).toThrow('mapping is not yet verified');
  });
  it('checks the legacy sample checksum and rejects its broken MRAP pointer',()=>{
    const b=new Uint8Array(readFileSync('web-export.prst'));
    expect(new DataView(b.buffer,b.byteOffset,b.byteLength).getUint16(1222,false)).toBe(presetChecksum(b));
    expect(new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(32,true)).toBe(0);
    expect(()=>validateTemplate(b)).toThrow('Unsupported GP-200 preset header');
  });
});
