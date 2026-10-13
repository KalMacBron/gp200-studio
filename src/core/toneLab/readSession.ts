import { identityQuery, PresetAssembly, SysExStream, capturePreset, hasGPHeader, identityReply, type CapturedPreset } from './readProtocol';
import { readQuery } from './readProtocol';
export interface LabPort extends EventTarget {id:string;name:string|null;manufacturer?:string|null;state:string;open():Promise<unknown>;close():Promise<unknown>}
export interface LabOutput extends LabPort {send(bytes:Uint8Array):void}
export interface LabAccess {sysexEnabled:boolean;inputs:Map<string,LabPort>;outputs:Map<string,LabOutput>}
export async function requestReadAccess():Promise<LabAccess>{
  const nav=navigator as unknown as {requestMIDIAccess?:(options:{sysex:boolean})=>Promise<LabAccess>};
  if(!nav.requestMIDIAccess)throw new Error('USB backup needs Chrome or Edge with Web MIDI support.');
  const access=await nav.requestMIDIAccess({sysex:true});if(!access.sysexEnabled)throw new Error('MIDI SysEx permission is required for preset reads.');return access;
}
export function uniqueGP200Pair(access:LabAccess):{input:LabPort;output:LabOutput}{
  const matches=(p:LabPort)=>p.state==='connected'&&/^GP[- ]?200$/i.test(p.name?.trim()??'');
  const ins=[...access.inputs.values()].filter(matches),outs=[...access.outputs.values()].filter(matches);
  if(ins.length!==1||outs.length!==1)throw new Error('Connect exactly one GP-200 input and output. Multiple or ambiguous devices are refused.');
  if((ins[0].manufacturer??'')!==(outs[0].manufacturer??''))throw new Error('Input/output manufacturers differ.');
  return {input:ins[0],output:outs[0]};
}
interface Pending {consume:(frame:Uint8Array)=>boolean;resolve:()=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>;started:number}
export class ReadOnlySession {
  readonly id=crypto.randomUUID();
  identity=new Uint8Array();
  readonly diagnostics:Uint8Array[]=[];
  private stream=new SysExStream();
  private pending:Pending|undefined;
  private closed=false;
  private ready=false;
  private connecting=false;
  private readonly message=(event:Event)=>{
    if(!this.pending||this.closed)return;
    const e=event as Event&{data?:Uint8Array};if(!(e.data instanceof Uint8Array))return;
    if(event.timeStamp>0&&event.timeStamp<this.pending.started)return;
    try{for(const frame of this.stream.feed(e.data)){
      if(!this.pending)break;if(!hasGPHeader(frame))continue;
      if(this.diagnostics.length>=32)throw new Error('Reply flood exceeded limit');this.diagnostics.push(frame.slice());
      if(this.pending.consume(frame)){const p=this.pending;this.pending=undefined;clearTimeout(p.timer);p.resolve();}
    }}catch(e){this.invalidate(e instanceof Error?e:new Error('Invalid MIDI response'));}
  };
  private readonly stateChange=()=>{if(this.input.state!=='connected'||this.output.state!=='connected')this.invalidate(new Error('GP-200 disconnected; reconnect explicitly.'));};
  readonly input:LabPort;readonly output:LabOutput;private timeoutMs:number;private onClosed?: (message:string)=>void;
  constructor(input:LabPort,output:LabOutput,timeoutMs=4000,onClosed?:(message:string)=>void){
    this.input=input;this.output=output;this.timeoutMs=timeoutMs;this.onClosed=onClosed;
    this.input.addEventListener('midimessage',this.message);this.input.addEventListener('statechange',this.stateChange);this.output.addEventListener('statechange',this.stateChange);
  }
  get connected():boolean{return this.ready&&!this.closed&&this.input.state==='connected'&&this.output.state==='connected';}
  async connect():Promise<void>{
    if(this.closed||this.ready||this.pending||this.connecting)throw new Error('Start a fresh connection.');
    this.connecting=true;
    try{await this.input.open();if(this.closed)throw new Error('Connection cancelled.');await this.output.open();
      if(this.closed)throw new Error('Connection cancelled.');
      await this.query(identityQuery(),frame=>{if(!identityReply(frame))throw new Error('Unrecognized GP-200 identity reply');this.identity=frame.slice();return true;});this.ready=true;
    }catch(e){this.invalidate(e instanceof Error?e:new Error('USB connection failed'));throw e;}finally{this.connecting=false;}
  }
  close():void {this.invalidate(new Error('Disconnected; reconnect explicitly.'));}
  private invalidate(error:Error):void {
    const wasClosed=this.closed;this.closed=true;this.ready=false;if(!wasClosed)this.onClosed?.(error.message);const p=this.pending;this.pending=undefined;if(p){clearTimeout(p.timer);p.reject(error);}
    this.input.removeEventListener('midimessage',this.message);this.input.removeEventListener('statechange',this.stateChange);this.output.removeEventListener('statechange',this.stateChange);
    void this.input.close().catch(()=>{});void this.output.close().catch(()=>{});
  }
  private query(bytes:Uint8Array,consume:Pending['consume']):Promise<void>{
    if(this.closed||this.pending)throw new Error('Connection closed or a read is already running.');
    // A second barrier: only the two exact vetted read request shapes can reach send().
    const expectedIdentity=identityQuery();
    const isIdentity=bytes.length===expectedIdentity.length&&bytes.every((b,i)=>b===expectedIdentity[i]);
    const slot=(bytes[25]<<4)|bytes[26];const expected=readQuery(slot);
    const isRead=bytes.length===expected.length&&bytes.every((b,i)=>b===expected[i]);
    if(!isIdentity&&!isRead)throw new Error('Read-only transport rejected a non-query command.');
    this.diagnostics.length=0;this.stream=new SysExStream();
    return new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>this.invalidate(new Error('Read timed out; reconnect explicitly. No automatic retry.')),this.timeoutMs);
      this.pending={consume,resolve,reject,timer,started:performance.now()};
      try{if(this.input.state!=='connected'||this.output.state!=='connected')throw new Error('Device disconnected');this.output.send(bytes.slice());}
      catch(e){this.invalidate(e instanceof Error?e:new Error('Read request failed'));}
    });
  }
  async read(slot:number):Promise<CapturedPreset>{
    if(!this.connected)throw new Error('Identify the GP-200 first.');
    const assembly=new PresetAssembly(slot);let body:Uint8Array|undefined;
    await this.query(readQuery(slot),frame=>{body=assembly.accept(frame);return body!==undefined;});
    return capturePreset(slot,body!,assembly.frames);
  }
}
