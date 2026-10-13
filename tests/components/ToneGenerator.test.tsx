import { afterEach,describe,it,expect,vi } from 'vitest';
import { cleanup,fireEvent,render,screen,within } from '@testing-library/react';
import { ToneGenerator } from '@/components/toneLab/ToneGenerator';
import { toneTemplateFixture } from '../helpers/toneTemplate';
import { generateBluesTone } from '@/core/toneLab/tones';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('Generate Tone panel',()=>{
  it('generates, edits and exports both drafts without network or MIDI access',()=>{
    const fetch=vi.fn(),midi=vi.fn();vi.stubGlobal('fetch',fetch);Object.defineProperty(navigator,'requestMIDIAccess',{value:midi,configurable:true});
    const blob=vi.fn(()=> 'blob:pair');vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:blob,revokeObjectURL:vi.fn()}));
    const download=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
    render(<ToneGenerator/>);fireEvent.click(screen.getByRole('button',{name:/Generate Tone/}));
    fireEvent.click(screen.getByRole('button',{name:'Generate paired draft'}));
    const live=within(screen.getByRole('article',{name:'LIVE AMP draft'}));
    expect(live.getByText('01A')).toBeVisible();expect(screen.getByText('17A')).toBeVisible();
    fireEvent.change(live.getByLabelText('TREBLE'),{target:{value:'60'}});
    expect(live.getByLabelText('TREBLE')).toHaveValue(60);
    fireEvent.change(live.getByLabelText('TREBLE'),{target:{value:'101'}});
    expect(screen.getByRole('alert')).toHaveTextContent('expected 0 to 100');expect(live.getByLabelText('TREBLE')).toHaveValue(60);
    fireEvent.click(screen.getByRole('button',{name:/Export paired JSON/}));
    expect(blob.mock.calls[0][0]).toBeInstanceOf(Blob);expect(download).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();expect(midi).not.toHaveBeenCalled();
  });
  it('validates pasted ChatGPT JSON and keeps the previous draft when import fails',()=>{
    render(<ToneGenerator/>);fireEvent.click(screen.getByRole('button',{name:/Generate Tone/}));fireEvent.click(screen.getByRole('button',{name:'Generate with ChatGPT'}));
    fireEvent.change(screen.getByLabelText('Paste tone JSON'),{target:{value:JSON.stringify(generateBluesTone('IMPORTED','02B','balanced'))}});
    fireEvent.click(screen.getByRole('button',{name:'Validate & import draft'}));expect(screen.getByRole('heading',{name:'IMPORTED'})).toBeVisible();
    fireEvent.change(screen.getByLabelText('Paste tone JSON'),{target:{value:'{"sendToUSB":true}'}});fireEvent.click(screen.getByRole('button',{name:'Validate & import draft'}));
    expect(screen.getByRole('alert')).toBeVisible();expect(screen.getByRole('heading',{name:'IMPORTED'})).toBeVisible();
  });
  it('requires a compatible reviewed template before downloading either preset, with no MIDI access',async()=>{
    const midi=vi.fn();Object.defineProperty(navigator,'requestMIDIAccess',{value:midi,configurable:true});
    vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn(()=> 'blob:preset'),revokeObjectURL:vi.fn()}));
    const download=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
    render(<ToneGenerator/>);fireEvent.click(screen.getByRole('button',{name:/Generate Tone/}));fireEvent.click(screen.getByRole('button',{name:'Generate paired draft'}));
    expect(screen.queryByRole('button',{name:/Export 01A/})).toBeNull();
    const file=new File([toneTemplateFixture().buffer],'official-template.prst');
    Object.defineProperty(file,'arrayBuffer',{value:async()=>toneTemplateFixture().buffer});
    fireEvent.change(screen.getByLabelText('Official preset template'),{target:{files:[file]}});
    const live=await screen.findByRole('button',{name:/Export 01A/});expect(live).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox',{name:/I exported this template/}));expect(live).toBeEnabled();fireEvent.click(live);
    fireEvent.click(screen.getByRole('button',{name:/Export 17A/}));expect(download).toHaveBeenCalledTimes(2);expect(midi).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Official preset template'),{target:{files:[new File(['bad'],'broken.prst')]}});
    expect(await screen.findByRole('alert')).toHaveTextContent('1224-byte');expect(screen.queryByRole('button',{name:/Export 01A/})).toBeNull();
  });

});
