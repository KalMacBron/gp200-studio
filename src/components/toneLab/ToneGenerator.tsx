import { useState } from 'react';
import { controlRange, editTone, generateBluesTone, generationPrompt, importTone, REFERENCE, unresolvedControls, type TonePair } from '@/core/toneLab/tones';
import './toneLab.css';

export function ToneGenerator(){
  const [open,setOpen]=useState(false);
  const [mode,setMode]=useState<'recipe'|'chatgpt'>('recipe');
  const [name,setName]=useState('BLUES_CORE_CLN');
  const [bank,setBank]=useState('01A');
  const [character,setCharacter]=useState<'warm'|'balanced'|'bright'>('warm');
  const [artist,setArtist]=useState<string>(REFERENCE.artist);
  const [song,setSong]=useState<string>(REFERENCE.song);
  const [brief,setBrief]=useState('Warm, full clean blues tone for a Fender Stratocaster neck pickup.');
  const [json,setJson]=useState('');
  const [prompt,setPrompt]=useState('');
  const [tone,setTone]=useState<TonePair|null>(null);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const run=(action:()=>void)=>{setError('');setMessage('');try{action();}catch(e){setError(e instanceof Error?e.message:'Unable to validate this tone');}};
  function exportTone(){
    if(!tone)return;
    const blob=new Blob([JSON.stringify(tone,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${tone.name}-pair.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage('Paired tone JSON exported. Both profiles are included.');
  }
  async function copyPrompt(){
    setError('');setMessage('');
    try{const value=generationPrompt(artist,song,brief,bank);setPrompt(value);await navigator.clipboard.writeText(value);setMessage('Request copied. Paste it into ChatGPT, then import its JSON below.');}
    catch(e){setError(e instanceof Error?`${e.message}. If copying is unavailable, select the request text below.`:'Select and copy the request text below.');}
  }
  return <section className="tone-lab" aria-label="Tone Lab">
    <div className="tone-lab-bar">
      <div><span className="tone-lab-tag">PATCH LAB</span><span className="tone-lab-subtitle">GP200 Studio · paired tones</span></div>
      <button className="tone-lab-primary" aria-expanded={open} aria-controls="tone-lab-content" onClick={()=>setOpen(!open)}>{open?'Close Tone Lab':'Generate Tone'} <span aria-hidden="true">{open?'−':'+'}</span></button>
    </div>
    <div id="tone-lab-content" role="region" aria-label="Tone draft workspace" tabIndex={0} hidden={!open} className="tone-lab-content">
      <header className="tone-lab-intro"><div><p className="tone-lab-eyebrow">YOUR NEXT SOUND</p><h1>Generate a tone. Keep both profiles.</h1><p>A clean blues starting point, or a researched draft from ChatGPT. Review every setting before it leaves the lab.</p></div><span className="tone-lab-status">FW 1.8.0 · DRAFT ONLY</span></header>
      <div className="tone-lab-modes" role="group" aria-label="Generation method">
        <button aria-pressed={mode==='recipe'} onClick={()=>setMode('recipe')}>Clean blues recipe</button>
        <button aria-pressed={mode==='chatgpt'} onClick={()=>setMode('chatgpt')}>Generate with ChatGPT</button>
      </div>
      <div className="tone-lab-grid">
        <div className="tone-lab-card">
          {mode==='recipe'?<><h2>Blues Core Clean</h2><p className="tone-lab-muted">Inspired by {REFERENCE.artist} · {REFERENCE.song}. Local recipe; no AI or recording analysis runs in this app.</p>
            <div className="tone-lab-fields"><label>Patch name<input value={name} maxLength={16} onChange={e=>setName(e.target.value)} /></label><label>LIVE bank<input value={bank} onChange={e=>setBank(e.target.value.toUpperCase())} placeholder="01A" /></label>
            <label>Character<select value={character} onChange={e=>setCharacter(e.target.value as typeof character)}><option value="warm">Warm & rounded</option><option value="balanced">Balanced & clear</option><option value="bright">Bright & articulate</option></select></label></div>
            <button className="tone-lab-primary" onClick={()=>run(()=>{setTone(generateBluesTone(name,bank,character));setMessage('Two tone drafts generated. Review and adjust the settings below.');})}>Generate paired draft</button>
            <details className="tone-lab-reference"><summary>Research & design notes</summary><p>{REFERENCE.note}</p><a href={REFERENCE.url} target="_blank" rel="noreferrer">Read the producer’s recording account ↗</a><p>Dark Twin, low gain and gentle room ambience are a practical adaptation for the Strat. Your guitar and output level still need listening checks.</p></details>
          </>:<><h2>Bring a song reference</h2><p className="tone-lab-muted">Copy a research request into your ChatGPT conversation. Paste only the returned JSON object below. No API key or subscription connection is required here.</p>
            <div className="tone-lab-fields"><label>Artist<input value={artist} onChange={e=>setArtist(e.target.value)} /></label><label>Song<input value={song} onChange={e=>setSong(e.target.value)} /></label><label>LIVE bank<input value={bank} onChange={e=>setBank(e.target.value.toUpperCase())} /></label></div>
            <label>Describe your tone<textarea rows={3} value={brief} onChange={e=>setBrief(e.target.value)} /></label>
            <button className="tone-lab-primary" onClick={()=>void copyPrompt()}>Copy ChatGPT request</button>
            {prompt && <details><summary>View request / copy manually</summary><textarea aria-label="ChatGPT request" rows={5} value={prompt} readOnly onFocus={e=>e.target.select()} /></details>}
            <label>Paste tone JSON<textarea rows={6} value={json} onChange={e=>setJson(e.target.value)} placeholder={'{"schemaVersion": 1, …}'} /></label>
            <button onClick={()=>run(()=>{setTone(importTone(json));setMessage('Imported and validated. Review both profiles below.');})}>Validate & import draft</button>
          </>}
          {error && <p className="tone-lab-error" role="alert">{error}</p>}
          {message && <p className="tone-lab-message" role="status">{message}</p>}
        </div>
        <div className="tone-lab-card tone-lab-overview"><h2>One tone, two destinations</h2>
          <div><span>01</span><section><h3>LIVE AMP</h3><p>Katana 100 MkII · Power Amp In</p><p>AMP on · CAB off</p></section></div>
          <div><span>02</span><section><h3>USB / DAW</h3><p>Direct recording · cab-filtered output</p><p>AMP on · CAB on · cab cuts in Hz</p></section></div>
          <p className="tone-lab-chain">NR → PRE → WAH → DST → AMP → CAB → EQ → MOD → DLY → RVB</p>
          <p className="tone-lab-muted">The USB bank is always 16 higher with the same letter. Generating, editing or importing here sends no MIDI and does not change the editor’s loaded preset.</p>
        </div>
      </div>
      {tone && <div className="tone-lab-result">
        <header><div><p className="tone-lab-eyebrow">REVIEW YOUR DRAFT</p><h2>{tone.name}</h2><p>Preset volume {tone.presetVolume} · {tone.profiles.map(p=>p.bank).join(' / ')}</p></div><button className="tone-lab-primary" onClick={exportTone}>Export paired JSON ↓</button></header>
        <div className="tone-lab-grid">{tone.profiles.map(profile=><article className="tone-lab-card" key={profile.kind} aria-label={`${profile.kind} draft`}><header><h3>{profile.kind}</h3><span className="tone-lab-bank">{profile.bank}</span></header>
          {tone.chain.map(block=>{const s=profile.blocks[block];return <details key={block} open={s.enabled} className="tone-lab-block"><summary><strong>{block}</strong><span>{s.model??'Bypassed'}</span><small>{s.enabled?'ON':'OFF'}</small></summary>
            <div className="tone-lab-parameters">{Object.entries(s.parameters).map(([key,value])=>{const r=controlRange(block,s.model!,key)!;return <label key={key}>{key.replaceAll('_',' ')}<input type="number" min={r[0]} max={r[1]} step={1} value={value} onChange={e=>run(()=>setTone(editTone(tone,profile.kind,block,key,e.target.valueAsNumber)))} /></label>;})}</div>
          </details>;})}
        </article>)}</div>
        <div className="tone-lab-draft-note"><strong>Reviewable draft · hardware upload unavailable</strong><p>{unresolvedControls(tone).length?`Unresolved controls: ${unresolvedControls(tone).join('; ')}. Supply a manual row or screenshot before using these controls.`:'The draft passes the available manifest checks; device encoding and upload are not connected to this panel.'}</p><p>JSON exports work with Patch Lab’s draft importer. They are not .prst files. Existing Studio device controls are separate and remain experimental.</p></div>
      </div>}
    </div>
  </section>;
}
