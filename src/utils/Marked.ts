import { marked } from "marked";
import highlightjs from "highlight.js";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

const renderer = new marked.Renderer();

renderer.link = (href, title, text) => {
  return `<a href="${href}" title="${title ?? "Link"}">${text}</a>`;
};

renderer.image = (href: string, title: string, text: string) => {
  return `<img src="${href}" alt="${text}" title="${title}" onerror=${
    useActiveUserStore().userPreferences?.appearance.theme === "light"
      ? 'this.src="/fallbackImageLight.svg";'
      : 'this.src="/fallbackImageDark.svg";'
  } onload=${"this.style.height='auto'"} />`;
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
      const allowedContent = ["jpeg", "jpg", "png", "gif", "webp"];

      let img = false;
      allowedContent.forEach((ext) => {
        if (href.endsWith(ext)) {
          token.type = "image";
          token.title = token.title || "Image";

          img = true;
        }
      });
      if (!img) throw "no img";
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
