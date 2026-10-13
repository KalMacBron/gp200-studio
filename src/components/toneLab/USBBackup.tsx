import { useEffect,useRef,useState } from 'react';
import { bankLabel,bankSlot } from '@/core/toneLab/tones';
import { base64 } from '@/core/toneLab/readProtocol';
import { ReadOnlySession,requestReadAccess,uniqueGP200Pair } from '@/core/toneLab/readSession';
import { IndexedBackupStore,type LabBackup } from '@/core/toneLab/backupStore';
export function USBBackup({liveBank}:{liveBank:string}){
  const session=useRef<ReadOnlySession|null>(null),operation=useRef(0),mounted=useRef(true);
  const [firmware,setFirmware]=useState(false),[exclusive,setExclusive]=useState(false),[busy,setBusy]=useState(false),[online,setOnline]=useState(false);
  const [message,setMessage]=useState('Connect here for identity and preset reads only. No editor-mode, preset-change or write commands are sent.');
  const [backup,setBackup]=useState<LabBackup|null>(null),[error,setError]=useState('');
  const [diagnostic,setDiagnostic]=useState<object|null>(null);
  function recordDiagnostic(reason:string,connection:ReadOnlySession|null){
    if(connection)setDiagnostic({kind:'gp200-tone-lab-read-diagnostic',schemaVersion:1,date:new Date().toISOString(),error:reason,input:connection.input.name,output:connection.output.name,frames:connection.diagnostics.map(base64)});
  }
  // Close the current imperative session, including one created after mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;operation.current++;session.current?.close();};},[]);
  async function connect(){
    if(!firmware||!exclusive||busy)return;const current=++operation.current;setBusy(true);setError('');
    try{const ports=uniqueGP200Pair(await requestReadAccess());if(current!==operation.current)return;
      const connection=new ReadOnlySession(ports.input,ports.output,4000,reason=>{if(mounted.current&&session.current===connection){setOnline(false);setMessage(reason);}});
      session.current=connection;await connection.connect();if(!connection.connected)throw new Error('Device disconnected during identity check.');if(current!==operation.current){connection.close();return;}
      setOnline(true);setMessage(`Identified ${ports.input.name}. Ready to read ${liveBank} and its USB partner.`);
    }catch(e){if(current===operation.current){const reason=e instanceof Error?e.message:'Connection failed';setError(reason);recordDiagnostic(reason,session.current);setOnline(false);session.current?.close();}}
    finally{if(current===operation.current)setBusy(false);}
  }
  function disconnect(){operation.current++;session.current?.close();session.current=null;setOnline(false);setBusy(false);}
  async function read(full:boolean){
    const connection=session.current;if(!connection?.connected||busy||!firmware||!exclusive)return;
    const current=++operation.current;setBusy(true);setError('');
    try{const live=bankSlot(liveBank);if(live>=64)throw new Error('Choose a LIVE bank from 01A–16D.');
      const requestedSlots=full?Array.from({length:256},(_,i)=>i):[live,live+64];
      const record:LabBackup={kind:'gp200-tone-lab-device-backup',schemaVersion:1,id:crypto.randomUUID(),date:new Date().toISOString(),session:connection.id,
        input:{id:connection.input.id,name:connection.input.name??''},output:{id:connection.output.id,name:connection.output.name??''},identityReply:base64(connection.identity),
        firmwareAttestation:'User checked device screen: 1.8.0',requestedSlots,presets:[],complete:false};
      const store=new IndexedBackupStore();await store.save(record); // prove storage works before starting the reads
      if(current!==operation.current)return;setBackup(structuredClone(record));
      for(const slot of requestedSlots){
        if(current!==operation.current)throw new Error('Backup cancelled. Completed presets remain saved.');
        const preset=await connection.read(slot);if(current!==operation.current)throw new Error('Backup cancelled.');
        record.presets.push(preset);await store.save(record);
        if(current!==operation.current)return;setBackup(structuredClone(record));setMessage(`Saved and verified ${record.presets.length}/${requestedSlots.length}: ${bankLabel(slot)} · ${preset.name}`);
      }
      record.complete=true;await store.save(record);if(current!==operation.current)return;setBackup(structuredClone(record));
      setMessage('Backup complete. Original bodies, wire frames and SHA-256 hashes are stored and read back locally. Download a copy below.');
    }catch(e){if(current===operation.current){const reason=e instanceof Error?e.message:'Backup failed';setError(reason);recordDiagnostic(reason,connection);connection.close();setOnline(false);}}
    finally{if(current===operation.current)setBusy(false);}
  }
  async function recover(){
    if(busy)return;const current=++operation.current;setBusy(true);setError('');
    try{const saved=await new IndexedBackupStore().latest();if(current!==operation.current)return;setBackup(saved);setMessage(`Recovered saved backup: ${saved.presets.length}/${saved.requestedSlots.length} presets. No MIDI was sent.`);}
    catch(e){if(current===operation.current)setError(e instanceof Error?e.message:'Unable to recover saved backup');}
    finally{if(current===operation.current)setBusy(false);}
  }
  function downloadDiagnostic(){
    if(!diagnostic)return;const url=URL.createObjectURL(new Blob([JSON.stringify(diagnostic,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='GP200-read-diagnostic.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function download(){
    if(!backup)return;const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=`GP200-${backup.requestedSlots.length===256?'full':backup.requestedSlots.map(bankLabel).join('-')}-${backup.complete?'backup':'partial'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <div className="tone-lab-card" aria-label="Safe USB backup"><h3>USB backup · read only</h3>
    <p>Use Chrome or Edge. Disconnect Studio’s main editor and close the official editor before connecting here. Connect just one GP-200.</p>
    <label><input type="checkbox" checked={firmware} disabled={busy||online} onChange={e=>setFirmware(e.target.checked)}/> I checked the device screen: firmware 1.8.0.</label>
    <label><input type="checkbox" checked={exclusive} disabled={busy||online} onChange={e=>setExclusive(e.target.checked)}/> Other GP-200 editors are disconnected.</label>
    <div className="tone-lab-fields"><button disabled={busy||online||!firmware||!exclusive} onClick={()=>void connect()}>Connect for safe backup</button><button disabled={!online&&!busy} onClick={disconnect}>{busy?'Cancel & disconnect':'Disconnect backup connection'}</button></div>
    <div className="tone-lab-fields"><button disabled={busy||!online} onClick={()=>void read(false)}>Back up {liveBank} + USB partner</button><button disabled={busy||!online} onClick={()=>void read(true)}>Back up all 256 presets</button></div>
    <p role="status">{message}</p>{error&&<p role="alert" className="tone-lab-error">{error} Completed presets remain available; reconnect explicitly.</p>}
    {diagnostic&&<><button disabled={busy} onClick={downloadDiagnostic}>Download read diagnostic ↓</button><details><summary>View read diagnostic</summary><textarea aria-label="Read diagnostic JSON" rows={5} readOnly value={JSON.stringify(diagnostic,null,2)}/></details></>}
    <button disabled={busy} onClick={()=>void recover()}>Recover last saved backup</button>
    {backup&&<button disabled={busy} onClick={download}>Download {backup.complete?'verified backup':'partial backup'} ({backup.presets.length}/{backup.requestedSlots.length}) ↓</button>}
    <p className="tone-lab-muted">Stored in this browser on this local address. Keep a downloaded copy before clearing browser data. Hardware upload remains locked pending save/persistence validation.</p>
  </div>;
}
