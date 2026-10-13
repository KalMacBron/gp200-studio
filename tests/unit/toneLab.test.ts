import { describe,it,expect } from 'vitest';
import { bankSlot, editTone, generateBluesTone, generationPrompt, GATE_DEFAULTS, importTone, unresolvedControls, validateTone } from '@/core/toneLab/tones';
const draft=()=>generateBluesTone('BLUES_CORE_CLN','01A','warm');
describe('Tone Lab manifest and paired drafts',()=>{
  it('generates independent profiles, gate defaults and required output routes',()=>{
    for(const character of ['warm','balanced','bright'] as const){
      const pair=generateBluesTone('BLUES_CORE_CLN','16D',character);
      expect(pair.profiles.map(p=>p.bank)).toEqual(['16D','32D']);
      expect(pair.chain).toEqual(['NR','PRE','WAH','DST','AMP','CAB','EQ','MOD','DLY','RVB']);
      expect(pair.profiles[0].blocks.NR.parameters).toEqual(GATE_DEFAULTS);
      expect(pair.profiles[0].blocks.CAB.enabled).toBe(false);expect(pair.profiles[1].blocks.CAB.enabled).toBe(true);
      expect(pair.profiles[0].blocks).not.toBe(pair.profiles[1].blocks);
      expect(unresolvedControls(pair)).toEqual(expect.arrayContaining(['LIVE AMP: AMP / BRIGHT','USB/DAW: RVB / TRAIL']));
    }
  });
  it('round-trips existing Patch Lab JSON and normalizes reversed profiles',()=>{
    const pair=draft();pair.profiles.reverse();
    expect(importTone(JSON.stringify(pair)).profiles.map(p=>p.kind)).toEqual(['LIVE AMP','USB/DAW']);
  });
  it.each([
    (p:ReturnType<typeof draft>)=>{p.firmware='1.9.0' as '1.8.0';},
    (p:ReturnType<typeof draft>)=>{p.manifestSHA256='other';},
    (p:ReturnType<typeof draft>)=>{p.chain.reverse();},
    (p:ReturnType<typeof draft>)=>{p.profiles[1].bank='18A';},
    (p:ReturnType<typeof draft>)=>{p.profiles[1].kind='LIVE AMP';},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.CAB.enabled=true;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.AMP.enabled=false;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.AMP.model='SnapTone';},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.AMP.parameters.BRIGHT=1;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.NR.parameters.ATTACK_MS=0;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.NR.parameters.HYSTERESIS_DB=-11;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.AMP.parameters.GAIN=NaN;},
    (p:ReturnType<typeof draft>)=>{p.profiles[1].blocks.CAB.parameters.HI_CUT_HZ=1999;},
    (p:ReturnType<typeof draft>)=>{p.profiles[0].blocks.PRE.enabled=true;},
    (p:ReturnType<typeof draft>)=>{delete p.profiles[0].blocks.DLY;},
  ])('rejects invalid imported settings (%#)',change=>{const pair=draft();change(pair);expect(()=>validateTone(pair)).toThrow();});
  it('edits one profile without changing the other or accepting invalid values',()=>{
    const pair=draft();const edited=editTone(pair,'LIVE AMP','AMP','TREBLE',65);
    expect(edited.profiles[0].blocks.AMP.parameters.TREBLE).toBe(65);
    expect(edited.profiles[1].blocks.AMP.parameters.TREBLE).toBe(40);
    expect(pair.profiles[0].blocks.AMP.parameters.TREBLE).toBe(40);
    expect(()=>editTone(pair,'LIVE AMP','AMP','TREBLE',101)).toThrow();
  });
  it('requires supported banks, printable names and bounded valid JSON',()=>{
    for(const label of ['00A','65A','01E','1.5A','-1A'])expect(()=>bankSlot(label)).toThrow();
    expect(()=>generateBluesTone('bad🎸','01A','warm')).toThrow();
    expect(()=>generateBluesTone('DRAFT','17A','warm')).toThrow();
    expect(()=>importTone('null')).toThrow();expect(()=>importTone('x'.repeat(250001))).toThrow();
    expect(()=>validateTone({...draft(),sendToUSB:true})).toThrow();
  });
  it('creates a research-first ChatGPT request with the full parameter manifest',()=>{
    const prompt=generationPrompt('B.B. King','The Thrill Is Gone','Warm clean blues','01A');
    expect(prompt).toContain('Research the song and artist using primary sources first');
    expect(prompt).toContain(draft().manifestSHA256);expect(prompt).toContain('No automatic transmission');
    expect(()=>generationPrompt('','song','','01A')).toThrow();
  });
});
