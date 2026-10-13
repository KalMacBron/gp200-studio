import { z } from 'zod';
import { toneManifest as manifest } from './manifest';

const Block = z.object({model: z.string().nullable().optional(), enabled: z.boolean(), parameters: z.record(z.string(), z.number().int())}).strict();
const Profile = z.object({kind: z.enum(['LIVE AMP','USB/DAW']), bank: z.string(), blocks: z.record(z.string(), Block)}).strict();
const Pair = z.object({schemaVersion: z.literal(1), firmware: z.literal('1.8.0'), manifestSHA256: z.literal(manifest.hash),
  name: z.string().regex(/^[\x20-\x7e]{1,16}$/, 'Use 1–16 printable ASCII characters'), presetVolume: z.number().int().min(0).max(100),
  chain: z.array(z.string()), profiles: z.array(Profile).length(2)}).strict();
export type TonePair = z.infer<typeof Pair>;
export const GATE_DEFAULTS = {THRESHOLD:20, RATIO:0, ATTACK_MS:1, RELEASE_MS:100, HOLD_MS:0, HYSTERESIS_DB:-3};
export const REFERENCE = {artist:'B.B. King', song:'The Thrill Is Gone',
  url:'https://www.mixonline.com/recording/classic-tracks-bb-kings-thrill-gone-365491',
  note:'Producer Bill Szymczyk’s recording account describes a Fender Twin Reverb and subtle studio ambience. The GP-200 settings below are our design choices, not documented session settings.'};
const gateRanges: Record<string, [number,number]> = {THRESHOLD:[0,100],RATIO:[0,100],ATTACK_MS:[1,500],RELEASE_MS:[10,10000],HOLD_MS:[0,1000],HYSTERESIS_DB:[-10,0]};
const continuous = new Set('GAIN GAIN_1 GAIN_2 VOLUME MASTER INPUT BASS MIDDLE TREBLE PRESENCE TONE TONE_1 TONE_2 TONE_CUT THRESHOLD RATIO SUSTAIN ATTACK RELEASE BLEND CLIPPING SHAPE BODY TOP SENS DEPTH RATE LOW HIGH Q MIX OCT_1 OCT_2 DRY WET LOW_VOLUME HIGH_VOLUME POSITION FREQ FINE SATURATION LOW_CUT HIGH_CUT HI_CUT FUZZ FILTER VOICE GATE TIME FEEDBACK PRE_DELAY DECAY LOW_DAMP HI_DAMP HIGH_DAMP MOD LOW_END HIGH_END'.split(' '));
export function controls(block: string, model: string): string[] | undefined {
  if(block==='CAB') return manifest.cabs.includes(model) && !model.includes('~') ? ['VOLUME','LOW_CUT_HZ','HI_CUT_HZ'] : undefined;
  if(!Object.hasOwn(manifest.maps,block) || !Object.hasOwn(manifest.maps[block],model)) return undefined;
  const keys=manifest.maps[block][model]; return keys.length ? keys : undefined;
}
export function controlRange(block: string, model: string, key: string): [number,number] | undefined {
  if(!controls(block,model)?.includes(key)) return undefined;
  if(block==='NR' && model==='Gate 3') return gateRanges[key];
  if(block==='EQ') { const r=manifest.eq[model]?.[key]; return r ? [r[0],r[1]] : undefined; }
  if(block==='CAB' && key==='LOW_CUT_HZ') return [0,2000];
  if(block==='CAB' && key==='HI_CUT_HZ') return [2000,20000];
  return continuous.has(key) ? [0,100] : undefined;
}
export function bankSlot(label: string): number {
  if(!/^(0?[1-9]|[1-5][0-9]|6[0-4])[ABCD]$/.test(label)) throw new Error('Use a bank such as 01A');
  return (Number(label.slice(0,-1))-1)*4+'ABCD'.indexOf(label.slice(-1));
}
export function bankLabel(slot: number): string { return String(Math.floor(slot/4)+1).padStart(2,'0')+'ABCD'[slot%4]; }
export function validateTone(value: unknown): TonePair {
  const pair=Pair.parse(value);
  if(JSON.stringify(pair.chain)!==JSON.stringify(manifest.chain)) throw new Error('Required chain order changed');
  const live=pair.profiles.find(p=>p.kind==='LIVE AMP'),usb=pair.profiles.find(p=>p.kind==='USB/DAW');
  if(!live || !usb) throw new Error('Both LIVE AMP and USB/DAW profiles are required');
  const slot=bankSlot(live.bank);
  if(slot>=64 || bankSlot(usb.bank)!==slot+64) throw new Error('Use paired banks 01A–16D / 17A–32D');
  for(const profile of pair.profiles){
    if(Object.keys(profile.blocks).length!==10 || manifest.chain.some(b=>!Object.hasOwn(profile.blocks,b))) throw new Error('Exactly ten manifest blocks are required');
    if(!profile.blocks.AMP.enabled || profile.blocks.CAB.enabled!==(profile.kind==='USB/DAW')) throw new Error('AMP/CAB routing is incorrect');
    for(const [block,setting] of Object.entries(profile.blocks)){
      if(setting.model==null){ if(setting.enabled || Object.keys(setting.parameters).length) throw new Error(`${block}: choose a verified model`); continue; }
      if(!controls(block,setting.model)) throw new Error(`${block}/${setting.model}: missing manifest row; supply a manual row or screenshot`);
      for(const [key,value] of Object.entries(setting.parameters)){
        const range=controlRange(block,setting.model,key);
        if(!range) throw new Error(`${block}/${key}: unverified control or range; supply a manual row or screenshot`);
        if(value<range[0] || value>range[1]) throw new Error(`${block}/${key}: expected ${range[0]} to ${range[1]}`);
      }
    }
  }
  return {...pair,profiles:[live,usb]};
}
export function importTone(text: string): TonePair {
  if(text.length>250_000) throw new Error('Tone JSON exceeds 250 KB');
  return validateTone(JSON.parse(text));
}
export function unresolvedControls(pair: TonePair): string[] {
  return pair.profiles.flatMap(p=>Object.entries(p.blocks).flatMap(([block,s])=>s.enabled && s.model
    ? (controls(block,s.model)??[]).filter(k=>!Object.hasOwn(s.parameters,k)).map(k=>`${p.kind}: ${block} / ${k}`) : []));
}
export function generateBluesTone(name: string, bank: string, character: 'warm'|'balanced'|'bright'): TonePair {
  const slot=bankSlot(bank);
  const blocks: TonePair['profiles'][number]['blocks']=Object.fromEntries(manifest.chain.map(b=>[b,{enabled:false,parameters:{}}]));
  blocks.NR={model:'Gate 3',enabled:true,parameters:{...GATE_DEFAULTS}};
  blocks.AMP={model:'Dark Twin',enabled:true,parameters:{GAIN:20,VOLUME:50,BASS:45,MIDDLE:55,TREBLE:character==='warm'?40:character==='bright'?55:45}};
  blocks.CAB={model:'Dark Twin',enabled:false,parameters:{VOLUME:50,LOW_CUT_HZ:80,HI_CUT_HZ:6500}};
  blocks.RVB={model:'Room',enabled:true,parameters:{MIX:10,PRE_DELAY:10,DECAY:20}};
  const usb=structuredClone(blocks);usb.CAB.enabled=true;
  return validateTone({schemaVersion:1,firmware:'1.8.0',manifestSHA256:manifest.hash,name,presetVolume:50,chain:[...manifest.chain],
    profiles:[{kind:'LIVE AMP',bank:bankLabel(slot),blocks},{kind:'USB/DAW',bank:bankLabel(slot+64),blocks:usb}]});
}
export function editTone(pair: TonePair, kind: string, block: string, key: string, value: number): TonePair {
  const copy=structuredClone(pair);const profile=copy.profiles.find(p=>p.kind===kind);
  if(!profile || !Object.hasOwn(profile.blocks,block)) throw new Error('Unknown profile or block');
  profile.blocks[block].parameters[key]=value;return validateTone(copy);
}
export function generationPrompt(artist: string, song: string, brief: string, bank: string): string {
  if(!artist.trim() || !song.trim()) throw new Error('Enter an artist and song reference');
  const template=generateBluesTone('TONE_DRAFT',bank,'balanced');
  return `Build a GP-200 FW 1.8.0 tone draft for ${artist.trim()} — ${song.trim()}. Request: ${brief.trim() || 'Warm, articulate clean tone for a Fender Strat neck pickup.'}
Research the song and artist using primary sources first; explain the research and design choices separately from the JSON. Do not claim to access local USB.
Return a JSON object with exactly the schema below, two profiles, and the same manifest SHA-256. LIVE AMP uses the Katana Power Amp In (AMP on/CAB off); USB/DAW uses AMP/CAB on. Keep the chain and bank pairing. Preset volume defaults to 50. Default NR is Gate 3. Use only the manifest models and controls; only use the supported numeric ranges listed below. Omit unresolved controls and identify them separately; request a manual row/screenshot rather than guessing. Partial drafts cannot be uploaded.
Schema example (replace the tone choices): ${JSON.stringify(template)}
Authoritative parameter manifest: ${JSON.stringify(manifest)}
Supported numeric ranges: ${JSON.stringify(Object.fromEntries(Object.entries(manifest.maps).map(([b,models])=>[b,Object.fromEntries(Object.entries(models).filter(([,keys])=>keys.length).map(([m,keys])=>[m,Object.fromEntries(keys.flatMap(k=>{const r=controlRange(b,m,k);return r?[[k,r]]:[];}))]))])))}
CAB bounds: VOLUME 0–100, LOW_CUT_HZ 0–2000, HI_CUT_HZ 2000–20000. No automatic transmission or permission to write is implied.`;
}
