# MoonWave — Text to Speech with Azure AI

<img width="1178" height="985" alt="image" src="https://github.com/user-attachments/assets/545717d9-babd-4340-a85e-9010fed013ad" />

A polished, single-page web app that turns text into natural, expressive speech using
**Microsoft Azure AI Speech**. It has two screens:

1. **Landing** — a full-bleed cosmic hero with one pill button into the app.
2. **Voice Studio** — type or upload text, pick a voice / language / speaking style,
   tune speed & pitch, and generate audio you can preview and download.

Your Azure key never leaves your machine: it is entered in the in-app **Settings** tab and
stored only in your browser's `localStorage`, then sent directly to Azure when you generate.

## Tech stack

- **React 19** + **Vite** (fast dev server & build)
- **Tailwind CSS v3** (styling)
- **Framer Motion** (entrance, hover, and page-transition motion)
- **lucide-react** (icons)
- **microsoft-cognitiveservices-speech-sdk** (Azure Speech synthesis, runs in the browser)
- **react-router-dom** (Landing ↔ Studio routing)

## Getting started

```bash
npm install      # install dependencies (already done if node_modules exists)
npm run dev      # start the dev server at http://localhost:5173
```

Then open the app, click **Open Voice Studio**, go to **Settings**, and add your
Azure Speech **key** and **region**.

### Production build

```bash
npm run build    # outputs static files to dist/
npm run preview  # preview the production build locally
```

## Getting an Azure Speech key

1. In the [Azure portal](https://portal.azure.com), create a **Speech service** resource
   (the free **F0** tier works for testing).
2. Open the resource → **Keys and Endpoint**.
3. Copy **KEY 1** and the **Location/Region** (e.g. `eastus`).
4. Paste both into the app's **Settings** tab and click **Test connection**.

## How it works

- Speed and pitch are applied via SSML `<prosody>`; speaking styles via
  `<mstts:express-as>` (only when the selected voice supports the style).
- Generated audio is returned as an in-memory blob, so playback and download work without
  a backend. Clips are kept for the current session (object URLs cannot be persisted),
  while a lightweight history (titles, voice, timestamp) is saved across reloads.

## Project structure

```
src/
  components/      Reusable UI (NightSky, Logo, PillButton, Waveform, AudioPlayer)
  studio/          Studio shell (TopBar, Sidebar, DetailsPanel) and panels/
  pages/           Landing.jsx, Studio.jsx
  lib/             azureTts.js, voices.js, useSettings.jsx, useRecent.js, format.js
```

## Notes & next steps

- Document upload currently supports plain-text files (`.txt`, `.md`). `.docx` parsing
  could be added with a library such as `mammoth`.
- For a multi-user or production deployment, move the Azure key behind a small token
  endpoint/proxy instead of storing it client-side.
