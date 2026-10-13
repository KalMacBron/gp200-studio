import { beforeEach,describe,it,expect,vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { IDBFactory } from 'fake-indexeddb';
import { IndexedBackupStore,type LabBackup } from '@/core/toneLab/backupStore';
import { GP_HEADER,base64,capturePreset } from '@/core/toneLab/readProtocol';
vi.stubGlobal('crypto',webcrypto);
beforeEach(()=>{vi.stubGlobal('indexedDB',new IDBFactory());});
async function fixture():Promise<LabBackup>{
  const body=new Uint8Array(1176);body.set([0,0,4,0,1,0,0,0]);
  const frames=Array.from({length:7},(_,i)=>{const off=i*183;return new Uint8Array([...GP_HEADER,0x12,0x18,9,off&127,off>>7,...[...body.subarray(off,off+183)].flatMap(n=>[n>>4,n&15]),0xf7]);});
  return {kind:'gp200-tone-lab-device-backup',schemaVersion:1,id:crypto.randomUUID(),date:new Date().toISOString(),session:crypto.randomUUID(),input:{id:'i',name:'GP-200'},output:{id:'o',name:'GP-200'},identityReply:base64(new Uint8Array([...GP_HEADER,0x12,8,0,0,0,...new Array(16).fill(0),0xf7])),firmwareAttestation:'User checked device screen: 1.8.0',requestedSlots:[0,64],presets:[await capturePreset(0,body,frames)],complete:false};
}
describe('durable browser backup store',()=>{
  it('commits and re-reads exact raw captures, including partial backups across store instances',async()=>{
    const backup=await fixture();await new IndexedBackupStore().save(backup);
    const recovered=await new IndexedBackupStore().latest();expect(recovered).toEqual(backup);expect(recovered.complete).toBe(false);
    backup.presets=[];expect((await new IndexedBackupStore().load(recovered.id)).presets).toHaveLength(1);
  });
  it('refuses damaged backups before writing',async()=>{
    const backup=await fixture();backup.presets[0].sha256='0'.repeat(64);await expect(new IndexedBackupStore().save(backup)).rejects.toThrow('verification failed');
    await expect(new IndexedBackupStore().latest()).rejects.toThrow('No saved');
  });
  it('reports storage refusal instead of claiming a backup was saved',async()=>{
    const backup=await fixture();vi.stubGlobal('indexedDB',{open:()=>{throw new Error('Storage unavailable');}});
    await expect(new IndexedBackupStore().save(backup)).rejects.toThrow('Storage unavailable');
  });
  it('detects a storage read-back mismatch',async()=>{
    const backup=await fixture(),store=new IndexedBackupStore();vi.spyOn(store,'load').mockResolvedValue({...backup,date:'2000-01-01T00:00:00.000Z'});
    await expect(store.save(backup)).rejects.toThrow('read-back mismatch');
  });
});
