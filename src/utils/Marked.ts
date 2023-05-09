import { marked } from "marked";
import highlightjs from "highlight.js";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const renderer = new marked.Renderer();

renderer.link = (href, title, text) => {
  return `<a href="${href}" title="${title ?? "Link"}">${text}</a>`;
};

renderer.image = (href: string, title: string, text: string) => {
  return `<img alt="image" src="${href}" alt="${text}" title="${title}" onerror=${
    useActiveUserStore().userPreferences?.appearance.theme === "light"
      ? 'this.src="/fallbackImageLight.svg";'
      : 'this.src="/fallbackImageDark.svg";'
  } 
  onclick="window.postMessage({type: 'openImage', src: '${href}'})"
  />`
    .split("\n")
    .join("");
};

renderer.hr = () => {
  return '<div class="hr"></div>';
};

renderer.paragraph = (text) => {
  const lines = text.split("\n");

  const paragraphs = lines.map((line) => `<p>${line}</p>`);

  return paragraphs.join("");
};

const walkTokens = async (token: any) => {
  if (token.type === "link") {
    const { href, title, text } = token;

    if (!href) return;

    try {
      const tmp = href.split("/");
      const title = tmp[tmp.length - 1].split(".")[0];

      const imgs = ["jpeg", "jpg", "png", "gif", "webp"];

      let img = false;
      imgs.forEach((ext) => {
        if (href.endsWith(ext)) {
          token.type = "image";
          token.title = title;

          img = true;
        }
      });

      const vids = ["mp4", "webm"];

      let vid = false;
      vids.forEach((ext) => {
        if (href.endsWith(ext)) {
          token.type = "html";
          token.text = `<video controls><source src="${href}" type="video/${ext}"></video>`;
          token.title = title;

          vid = true;
        }
      });

      const auds = ["mp3", "wav", "flac", "opus"];

      let aud = false;
      auds.forEach((ext) => {
        if (href.endsWith(ext)) {
          token.type = "html";
          token.text = `
          <audio controls>
            <source src="${href}" type="audio/${ext}">
          </audio>`
            .split("\n")
            .join("");
          token.title = title;

          aud = true;
        }
      });

      if (href.split("/").pop().split(".").length > 1 && !img && !vid && !aud) {
        token.type = "html";
        token.text = `
          <div class="file">
            <a class="name no-txt-overflow" href="${href}" title="${title}">${title}</a>
            <a class="icon" href="${href}" title="${title}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>
            </a>
          </div>
        `
          .split("\n")
          .join("");
        token.title = title;
      }

      return;
    } catch (err) {
      return;
    }
  }
};

marked.setOptions({
  highlight: (code, language) => {
    const validLanguage = highlightjs.getLanguage(language)
      ? language
      : "plaintext";
    return highlightjs.highlight(code, { language: validLanguage }).value;
  },
  renderer: renderer,
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  smartypants: false,
  headerIds: false,
});

marked.use({ walkTokens });
