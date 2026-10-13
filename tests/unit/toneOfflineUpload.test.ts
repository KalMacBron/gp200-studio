import { describe,it,expect } from 'vitest';
import { offlineUploadCandidate,framePayload } from '@/core/toneLab/offlineUpload';
import { decodeNibbles } from '@/core/toneLab/readProtocol';
import { exportPresetPair } from '@/core/toneLab/presetExport';
import { generateBluesTone } from '@/core/toneLab/tones';
import { toneTemplateFixture } from '../helpers/toneTemplate';
import { SysExCodec } from '@/core/SysExCodec';
describe('official-editor offline upload reconstruction',()=>{
  it('frames LENGTH rather than destination, with fixed byte expectations for both approved banks',()=>{
    const files=exportPresetPair(generateBluesTone('TEST','01A','warm'),toneTemplateFixture());
    for(const [i,file] of files.entries()){
      const slot=i*64,candidate=offlineUploadCandidate(file.bytes,slot,[0,0]);expect(candidate.status).toBe('offline-only');expect(candidate.unresolved).toHaveLength(2);
      expect([...candidate.payload.slice(0,16)]).toEqual([0,0,4,0,1,0,slot,0,1,0,4,0,slot,0,0,0]);
      expect(candidate.payload.slice(16)).toEqual(file.bytes.slice(48,1216));expect(candidate.frames).toHaveLength(7);
      expect([...candidate.frames[0].slice(8,13)]).toEqual([0x12,0x20,0x09,0,0]);
      expect([...candidate.frames[6].slice(8,13)]).toEqual([0x12,0x20,0x09,0x4a,0x08]);
      const rebuilt=new Uint8Array(1184);for(const frame of candidate.frames){const off=frame[11]+128*frame[12];rebuilt.set(decodeNibbles(frame.subarray(13,-1)),off);}
      expect(rebuilt).toEqual(candidate.payload);
    }
  });
  it('rejects other destinations, mismatched file slots and omitted/invalid reserved fields',()=>{
    const file=exportPresetPair(generateBluesTone('TEST','01A','warm'),toneTemplateFixture())[0].bytes;
    for(const slot of [1,65,127,128,255,64])expect(()=>offlineUploadCandidate(file,slot,[0,0])).toThrow('approved');
    expect(()=>offlineUploadCandidate(file,0,[NaN,0])).toThrow('reserved');
    expect(()=>offlineUploadCandidate(file,0,[] as unknown as [number,number])).toThrow('reserved');
    for(const p of [new Uint8Array(),new Uint8Array(16384)])expect(()=>framePayload(p,0x12)).toThrow('length');
  });
  it('permanently retires the legacy flash builder regardless of local experiment flags',()=>{
    localStorage.setItem('gp200.pushCommit','1');
    for(const slot of [0,64,255])expect(()=>SysExCodec.buildUploadChunks(new Uint8Array(1184),slot)).toThrow('locked');
    localStorage.removeItem('gp200.pushCommit');
  });
});
