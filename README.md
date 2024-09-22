# Unofficial C.ai Tools by Spellbound

## What is this?

**These are a set of tools put together to help save your content from (old) Character.ai.**

  <br>
  <br>

  
<img width="100%" alt="image" src="https://github.com/user-attachments/assets/463618c8-90d0-4457-9087-e664efd2e0a4">

  <br>
  <br>


It's currently in a very early stage and has the following features:

- Download your conversations with or without formatting
  
- Export (public) Character.ai characters
  
- ✨ Get rid of the red banner of doom on old C.ai ✨
  
- Privacy conscious permissions: *Only has access to content on the domain "old.character.ai"*





  <br>
  <br>

Disclaimer: This extension is by the team at [Spellbound](https://tryspellbound.com), and is not affiliated with Character.ai. We have an AI storytelling site, and would love if you checked it out! 

## How do I use it?

Just visit a page on **old** Character.ai with your existing account, and click the toolbar icon to start saving your content.

## Features on the way

- [ ] Support new Character.ai UI
- [ ] Support for non-C.ai interfaces
- [ ] Support exporting multiple chats at once (may be difficult to implement)


## Why not \<insert existing extension>?

Chrome extensions are powerful. We believe there should be a *free* ***open-source*** extension that interfaces with C.ai.


-----

## Boring stuff below

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

### Getting Started (development)

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

### Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.
