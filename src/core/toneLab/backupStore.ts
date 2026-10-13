import { z } from 'zod';
import { verifyPreset,identityReply,unbase64 } from './readProtocol';
const Preset=z.object({slot:z.number().int().min(0).max(255),body:z.string().max(50000),frames:z.array(z.string().max(50000)).max(32),sha256:z.string().regex(/^[a-f0-9]{64}$/),name:z.string().max(16)}).strict();
const Backup=z.object({kind:z.literal('gp200-tone-lab-device-backup'),schemaVersion:z.literal(1),id:z.string().uuid(),date:z.string().datetime(),
  session:z.string().uuid(),input:z.object({id:z.string(),name:z.string()}),output:z.object({id:z.string(),name:z.string()}),
  identityReply:z.string().max(100),firmwareAttestation:z.literal('User checked device screen: 1.8.0'),
  requestedSlots:z.array(z.number().int().min(0).max(255)).min(1).max(256),presets:z.array(Preset).max(256),complete:z.boolean()}).strict();
export type LabBackup=z.infer<typeof Backup>;
export async function verifyBackup(value:unknown):Promise<LabBackup>{
  const b=Backup.parse(value),slots=b.presets.map(p=>p.slot);
  if(!identityReply(unbase64(b.identityReply)))throw new Error('Backup identity frame is invalid');
  if(new Set(slots).size!==slots.length||new Set(b.requestedSlots).size!==b.requestedSlots.length||slots.some((s,i)=>s!==b.requestedSlots[i])||(b.complete&&slots.length!==b.requestedSlots.length))throw new Error('Backup slots or completion marker are inconsistent');
  for(const preset of b.presets)await verifyPreset(preset);return b;
}
export interface BackupStore {save(backup:LabBackup):Promise<void>;load(id:string):Promise<LabBackup>}
export class IndexedBackupStore implements BackupStore {
  private async open():Promise<IDBDatabase>{
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open('gp200-tone-lab-backups',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('backups',{keyPath:'id'}).createIndex('date','date');
      request.onerror=()=>reject(request.error??new Error('Unable to open backup storage'));
      request.onblocked=()=>reject(new Error('Backup storage is blocked by another tab'));
      request.onsuccess=()=>resolve(request.result);
    });
  }
  async save(backup:LabBackup):Promise<void>{
    const validated=await verifyBackup(backup),db=await this.open();
    try{await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction('backups','readwrite');tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('Backup storage transaction aborted'));tx.onerror=()=>reject(tx.error??new Error('Backup storage failed'));tx.objectStore('backups').put(validated);
    });}finally{db.close();}
    const readback=await this.load(validated.id);
    if(JSON.stringify(readback)!==JSON.stringify(validated))throw new Error('Backup storage read-back mismatch');
  }
  async latest():Promise<LabBackup>{
    const db=await this.open();let result:unknown;
    try{result=await new Promise((resolve,reject)=>{
      const tx=db.transaction('backups','readonly'),request=tx.objectStore('backups').index('date').openCursor(null,'prev');
      request.onsuccess=()=>resolve(request.result?.value);request.onerror=()=>reject(request.error);tx.onabort=()=>reject(tx.error);
    });}finally{db.close();}
    if(!result)throw new Error('No saved USB backup in this browser yet.');return verifyBackup(result);
  }
  async load(id:string):Promise<LabBackup>{
    const db=await this.open();let result:unknown;
    try{result=await new Promise((resolve,reject)=>{
      const tx=db.transaction('backups','readonly'),request=tx.objectStore('backups').get(id);
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);tx.onabort=()=>reject(tx.error);
    });}finally{db.close();}return verifyBackup(result);
  }
}
