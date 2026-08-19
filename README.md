<div align="center">

# NOVA for Android

**Neural Operative Virtual Assistant**

A voice-driven AI assistant on your phone. Ask it things, point the camera at
something, share text to it from any app.

</div>

---

This repository is the **Android** build. Other platforms live in their own
repositories, each stripped to one target.

## Install on your phone

**No computer needed.** On the phone:

1. Open **[the Releases page](https://github.com/Ace-Haxxed/Nova-Android/releases/latest)**
   in your browser.
2. Tap the `.apk` file to download it.
3. Open the download. Android asks whether to allow installs from your browser —
   allow it, then confirm.

Android will warn that the app is from an unknown source. That is expected: the
build is signed with Android's debug key, which is exactly what makes it
installable without a Play Store account.

Needs **Android 8.0** or newer.

> If the Releases page is empty, no version has been tagged yet. Every push also
> leaves an APK under the [Actions tab](https://github.com/Ace-Haxxed/Nova-Android/actions) —
> open the newest run and download the `nova-apk` artifact. That one needs a
> desktop browser, because GitHub artifacts arrive as a zip.

---

## Give it a model

NOVA needs a language model. On first launch it walks you through picking one;
you can change it later in **Settings → Keys**.

| Backend | Key | Notes |
|---|---|---|
| **Groq** | free | Fastest option by a wide margin. Good default on a phone. |
| **OpenRouter** | free tier | One key, every model. The `:free` models need no credits. |
| **NVIDIA** | free tier | Free credits, no card. Key starts `nvapi-`. |
| **Bytez** | yes | Serverless HuggingFace models. Type any model id. |
| **OpenAI** · **Anthropic** · **Gemini** | yes | The usual. |
| **On-device** | no | `phi-3-mini` or `gemma-2b`, running on the phone itself. |

Get a key from `console.groq.com/keys`, `openrouter.ai/keys` or
`build.nvidia.com`, then paste it in. Pasting validates it against the live API
in the same gesture, so a green tick means the key really worked.

**OpenRouter models are read live.** NOVA fetches the catalogue, keeps the free
models that support tool calling, and picks the largest context window. No model
id is hardcoded, because every id that ever was hardcoded got withdrawn.

---

## What it can do

Ask questions by voice or text · analyse what the camera sees ("what is this?")
· web search · read and summarise any page · timers and reminders ·
notifications · clipboard · long-term memory of your preferences

**Ways in from the rest of the phone**

- **Share to NOVA** from any app
- **Select text → NOVA** in the text selection menu
- **Home screen widget** — a one-tap mic button
- **Quick settings tile** — "Hey NOVA" from the notification shade
- **Deep links** — `nova://chat?message=…`

---

## Privacy

No analytics, no telemetry, no crash reporting. The only traffic NOVA makes is
to the model backend you chose and to pages you ask it to read.

Permissions are requested when first needed, each with a plain explanation.
Conversation history and memory stay in device storage and can be switched off
or wiped from **Settings → Privacy**.

---

## Build it yourself

**Needs:** Node 18+, JDK 21, Android Studio (or just the SDK).

```bash
npm install
npm run android:open     # build, sync, and open in Android Studio
```

Or straight to an APK without opening the IDE:

```bash
npm run cap:sync
cd android && ./gradlew assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

Install it over USB with `adb install -r <that file>`.

CI does exactly this on every push and attaches the result, so a tagged commit
(`git tag v1.0.1 && git push --tags`) is all it takes to publish a new
installable build.

---

## How it fits together

```
src/
  core/          agent loop, LLM clients, memory, tools
  platform/      index.ts picks the tool set at startup
  components/    shared/ · mobile/ · Settings/ · onboarding/ · ui/
  hooks/         useAgent, useVoice, useWakeWord
  store/         zustand: conversation, settings, keys, actions
android/         the Capacitor native project
```

**The agent loop** (`src/core/agent.ts`) is think → act → observe → repeat. The
model streams a reply, tool calls run, results feed back, and it continues until
it answers without calling a tool. Every call is recorded in the action log.

---

NOVA can act on your behalf. Read what it is doing.

---

## Other platforms

| Platform | Repository | Install |
|---|---|---|
| **iOS** | [Nova-Ios](https://github.com/Ace-Haxxed/Nova-Ios) | Xcode with a free Apple ID (7-day cert) |
| **Arch Linux** | [Nova](https://github.com/Ace-Haxxed/Nova-Arch) | `scripts/install-arch.sh`, then `scripts/install.sh` |
| **Debian / Ubuntu** | [Nova-Debian](https://github.com/Ace-Haxxed/Nova-Debian) | `scripts/install-debian.sh`, then `scripts/install.sh` |
| **Fedora** | [Nova-Fedora](https://github.com/Ace-Haxxed/Nova-Fedora) | `scripts/install-fedora.sh`, then `scripts/install.sh` |
| **Windows** | [Nova-Windows](https://github.com/Ace-Haxxed/Nova-Windows) | `scripts\install-windows.ps1`, then build the `.msi` |
| **macOS** | [Nova-Mac](https://github.com/Ace-Haxxed/Nova-Macos) | `scripts/install-mac.sh`, then build the `.dmg` |
