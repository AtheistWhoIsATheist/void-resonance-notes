# Philovoid for Obsidian

Philovoid is a mobile-compatible, vault-native AI philosopher. It retrieves relevant Markdown locally, adds the active note, and asks an OpenAI-compatible chat-completions endpoint to critique and develop the writing.

## Install

### Build from this repository

```bash
cd plugins/philovoid
npm install
npm run build
```

Copy `manifest.json`, `main.js`, and `styles.css` into:

```text
<your-vault>/.obsidian/plugins/philovoid/
```

Restart Obsidian, enable **Philovoid** under **Community plugins**, and enter an API key in **Settings → Philovoid**. For iPhone/iPad, ensure the plugin folder is synchronized into the mobile vault, then reload the app and enable the plugin there.

## Use

- Tap the brain-circuit ribbon icon or run **Philovoid: Open AI Philosopher**.
- Press `Cmd/Ctrl + Enter` to send.
- Select prose and run **Critique selected passage**.
- Run **Map arguments in active note** or **Socratic examination of active note**.

Philovoid sends only the active note and locally selected excerpts needed for an inquiry. The configured provider still receives those excerpts, so do not use a provider whose privacy terms are unsuitable for your work. The original Markdown remains canonical; Philovoid does not edit or upload the vault in bulk.
