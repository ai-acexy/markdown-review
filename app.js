const STORAGE_KEY = "markdown-review-content";

const SAMPLE = `# Markdown Review\n\n这是一个简洁的在线预览页面，支持 **GFM**。\n\n## 支持能力\n\n- 标题 / 引用 / 列表\n- 任务列表\n- 表格\n- 代码块高亮\n\n### 任务列表\n\n- [x] 页面初始化\n- [x] Markdown 渲染\n- [ ] 导出 HTML\n\n### 表格\n\n| Name | Type | Status |\n| --- | --- | --- |\n| marked | Parser | Ready |\n| DOMPurify | Security | Ready |\n\n### Code\n\n\`\`\`js\nfunction sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(1, 2));\n\`\`\`\n`;

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const sampleBtn = document.getElementById("sampleBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

function render(text) {
  const unsafeHtml = marked.parse(text);
  const safeHtml = DOMPurify.sanitize(unsafeHtml, {
    USE_PROFILES: { html: true },
  });
  preview.innerHTML = safeHtml;
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const saveAndRender = debounce((value) => {
  localStorage.setItem(STORAGE_KEY, value);
  render(value);
}, 80);

editor.addEventListener("input", (event) => {
  saveAndRender(event.target.value);
});

sampleBtn.addEventListener("click", () => {
  editor.value = SAMPLE;
  localStorage.setItem(STORAGE_KEY, SAMPLE);
  render(SAMPLE);
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(editor.value);
    copyBtn.textContent = "已复制";
    setTimeout(() => {
      copyBtn.textContent = "复制 Markdown";
    }, 1200);
  } catch {
    copyBtn.textContent = "复制失败";
    setTimeout(() => {
      copyBtn.textContent = "复制 Markdown";
    }, 1200);
  }
});

clearBtn.addEventListener("click", () => {
  editor.value = "";
  localStorage.setItem(STORAGE_KEY, "");
  render("");
  editor.focus();
});

const initial = localStorage.getItem(STORAGE_KEY) || SAMPLE;
editor.value = initial;
render(initial);
