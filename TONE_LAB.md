# GP200 Studio — Patch Lab fork

Development fork: [KalMacBron/gp200-studio](https://github.com/KalMacBron/gp200-studio). Forked from [kabir0st/gp200-studio](https://github.com/kabir0st/gp200-studio), pinned at `7d534c290aed969a32ab5a7857dc1a5f6d817be3`, branch `tone-lab`. Upstream code, assets, attribution and GPL-3.0-only license retained. No change has been pushed to upstream. The local Git remote `upstream` points to the original repository. The GitHub fork was created in the user’s signed-in browser. Tone Lab changes are on the `tone-lab` branch.

## Use it

Open the local server in Chrome or Edge. **Generate Tone** is available on the start screen and above the editor, on desktop and mobile.

- **Clean blues recipe:** generate a B.B. King-inspired Blues Core Clean draft, choose warm/balanced/bright, patch name and LIVE bank. Always produces LIVE AMP and USB/DAW, with matching bank letters and a 16-bank separation.
- **Generate with ChatGPT:** enter any artist/song and brief, copy the research request into ChatGPT, and paste the returned JSON object. The request includes the full parameter manifest and supported numeric bounds. If clipboard permission is unavailable, the request can be selected and copied manually.
- Review both profiles and edit the supported numeric controls. Invalid imports/edits show an error and retain the last valid draft. Export saves one paired JSON file compatible with the native Patch Lab draft importer.

This MVP has one local recipe. It does not call an AI service, analyse audio or access a ChatGPT account. General song-based generation happens in the user's ChatGPT conversation, with research and structured JSON import. No API key is stored or requested.

## Manifest and draft limitations

`src/core/toneLab/manifest.ts` contains the extracted parameter authority from FINAL_PROMPT v12.1-KT100, synced under the v12.3 filename. Source SHA-256: `ffe5143d52d7348918475543a47ac2608f1b4a1783c92b21aadca3c2909cbdbb`. Synced source files are unchanged. Gate 3 ranges and starter defaults are the user's verified supplemental values.

The required chain is NR > PRE > WAH > DST > AMP > CAB > EQ > MOD > DLY > RVB. LIVE AMP has AMP on and CAB off for Katana Power Amp In; USB/DAW has both on. Gate 3 is the recipe default and preset volume is 50. Controls with ambiguous/unverified ranges remain rejected. Missing active controls (currently Dark Twin BRIGHT and Room TRAIL) are listed explicitly. Obtain manual rows/screenshots before using them.

Tone JSON is a draft, not `.prst` or a hardware encoding. The panel has no MIDI dependency, never replaces Studio's loaded preset, and never invokes its send/push/upload handlers. The inherited Studio connection and device-writing features are separate and remain experimental; this fork does not certify them. The native Patch Lab upload lock remains in place.

## Recipe research

[Dan Daley's producer interview/account in MIX](https://www.mixonline.com/recording/classic-tracks-bb-kings-thrill-gone-365491) describes B.B. King's guitar through a Fender Twin Reverb and minimal studio ambience on The Thrill Is Gone. Selecting Dark Twin and a restrained Room reverb is an adaptation for this draft; none of the numeric settings are asserted to be original recording settings. The warm/balanced/bright variants change only treble. Listening and output calibration are still required.

## Development

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
npm test
npm run build
```

Node 24 was used on this host. The prerender script calls the installed Vite through the running Node executable, so build does not depend on a global `npx`. No deployment, Cloudflare change or device write is part of this implementation.
