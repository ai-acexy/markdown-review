const STORAGE_KEY = "markdown-review-content";
const THEME_KEY = "markdown-review-theme";
const LAYOUT_MODE_KEY = "markdown-review-layout-mode";
const SPLIT_RATIO_KEY = "markdown-review-split-ratio";
const SPLIT_RATIO_MOBILE_KEY = "markdown-review-split-ratio-mobile";

const SAMPLE = `# Markdown Review\n\n这是一个简洁的在线预览页面，支持 **GFM**。\n\n## 支持能力\n\n- 标题 / 引用 / 列表\n- 任务列表\n- 表格\n- 代码块高亮\n\n### 任务列表\n\n- [x] 页面初始化\n- [x] Markdown 渲染\n- [ ] 导出 HTML\n\n### 表格\n\n| Name | Type | Status |\n| --- | --- | --- |\n| marked | Parser | Ready |\n| DOMPurify | Security | Ready |\n\n### Code\n\n\`\`\`js\nfunction sum(a, b) {\n  return a + b;\n}\n\nconsole.log(sum(1, 2));\n\`\`\`\n`;

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const inputMeta = document.getElementById("inputMeta");
const statusBadge = document.getElementById("statusBadge");
const layout = document.querySelector(".layout");
const splitterControls = document.getElementById("splitterControls");
const themeBtn = document.getElementById("themeBtn");
const sampleBtn = document.getElementById("sampleBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

function applyLayoutMode(mode) {
  const nextMode = ["editor", "split", "preview"].includes(mode) ? mode : "split";
  document.documentElement.setAttribute("data-layout-mode", nextMode);
  layout.setAttribute("data-layout-mode", nextMode);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 960px)").matches;
}

function applySplitRatio(ratio, isMobile) {
  const nextRatio = clamp(ratio, 0.18, 0.82);
  if (isMobile) {
    layout.style.setProperty("--split-ratio-mobile", `${nextRatio * 100}%`);
  } else {
    layout.style.setProperty("--split-ratio", `${nextRatio * 100}%`);
  }
  return nextRatio;
}

const initialLayoutMode = localStorage.getItem(LAYOUT_MODE_KEY) || "split";
applyLayoutMode(initialLayoutMode);

const modeCycle = ["editor", "preview", "split"];

const initialDesktopRatio = Number(localStorage.getItem(SPLIT_RATIO_KEY)) || 0.5;
const initialMobileRatio = Number(localStorage.getItem(SPLIT_RATIO_MOBILE_KEY)) || 0.5;
applySplitRatio(initialDesktopRatio, false);
applySplitRatio(initialMobileRatio, true);

let dragState = null;
let ignoreClickAfterDrag = false;

splitterControls.addEventListener("pointerdown", (event) => {
  const mobile = isMobileViewport();
  const size = mobile ? layout.clientHeight : layout.clientWidth;
  if (!size) {
    return;
  }

  const ratio = Number(
    getComputedStyle(layout).getPropertyValue(mobile ? "--split-ratio-mobile" : "--split-ratio").replace("%", "")
  );
  const startRatio = Number.isFinite(ratio) ? ratio / 100 : 0.5;

  dragState = {
    mobile,
    startPos: mobile ? event.clientY : event.clientX,
    startRatio,
    moved: false,
  };

  splitterControls.setPointerCapture(event.pointerId);
});

splitterControls.addEventListener("pointermove", (event) => {
  if (!dragState) {
    return;
  }
  const size = dragState.mobile ? layout.clientHeight : layout.clientWidth;
  if (!size) {
    return;
  }

  const currentPos = dragState.mobile ? event.clientY : event.clientX;
  const deltaPx = currentPos - dragState.startPos;
  const deltaRatio = (currentPos - dragState.startPos) / size;

  if (Math.abs(deltaPx) > 4 && !dragState.moved) {
    dragState.moved = true;
  }

  if (dragState.moved) {
    const mode = layout.getAttribute("data-layout-mode");
    if (mode !== "split") {
      localStorage.setItem(LAYOUT_MODE_KEY, "split");
      applyLayoutMode("split");
    }
  }

  const nextRatio = applySplitRatio(dragState.startRatio + deltaRatio, dragState.mobile);

  if (dragState.mobile) {
    localStorage.setItem(SPLIT_RATIO_MOBILE_KEY, String(nextRatio));
  } else {
    localStorage.setItem(SPLIT_RATIO_KEY, String(nextRatio));
  }
});

function stopDrag(pointerId) {
  if (!dragState) {
    return;
  }
  ignoreClickAfterDrag = dragState.moved;
  dragState = null;
  if (pointerId !== undefined) {
    splitterControls.releasePointerCapture(pointerId);
  }
}

splitterControls.addEventListener("pointerup", (event) => {
  stopDrag(event.pointerId);
});

splitterControls.addEventListener("pointercancel", () => {
  stopDrag();
});

splitterControls.addEventListener("click", () => {
  if (ignoreClickAfterDrag) {
    ignoreClickAfterDrag = false;
    return;
  }
  const current = layout.getAttribute("data-layout-mode") || "split";
  const currentIndex = modeCycle.indexOf(current);
  const nextMode = modeCycle[(currentIndex + 1) % modeCycle.length];
  localStorage.setItem(LAYOUT_MODE_KEY, nextMode);
  applyLayoutMode(nextMode);
});

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "白天模式" : "夜间模式";
}

const initialTheme = localStorage.getItem(THEME_KEY) || "light";
applyTheme(initialTheme);

themeBtn.addEventListener("click", () => {
  const nextTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

function setStatus(text, isError = false, type = getStatusType(text, isError)) {
  statusBadge.textContent = text;
  statusBadge.title = getStatusDescription(text, isError);
  statusBadge.classList.remove("is-error", "is-loading", "is-success", "is-warning");
  if (type) {
    statusBadge.classList.add(type);
  }
}

function getStatusType(text, isError) {
  if (isError) return "is-error";
  if (text === "加载中" || text === "渲染中") return "is-loading";
  if (text === "marked GFM") return "is-success";
  return "";
}

function getStatusDescription(text, isError) {
  if (isError) {
    return "Markdown 渲染失败，请检查浏览器控制台或刷新页面重试。";
  }

  const descriptions = {
    "初始化": "页面正在初始化 Markdown 预览环境。",
    "加载中": "正在加载 Markdown 解析与代码高亮等依赖资源；第三方资源不可用时会尝试本地资源。",
    "marked GFM": "当前使用 marked 解析器与 DOMPurify 安全过滤，支持 GFM 完整语法与代码高亮。",
    "渲染中": "正在解析当前 Markdown 内容并生成预览结果。",
    "空内容": "编辑区为空，暂无可预览内容。",
  };

  return descriptions[text] || "当前 Markdown 预览状态。";
}

const markedHighlightPlugin = window.markedHighlight?.markedHighlight;
if (typeof markedHighlightPlugin === "function") {
  marked.use(
    markedHighlightPlugin({
      langPrefix: "hljs language-",
      emptyLangClass: "hljs",
      highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    })
  );
} else {
  console.warn("marked-highlight plugin not found; code blocks may not be highlighted.");
}

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
  mangle: false,
});

function render(text) {
  inputMeta.textContent = `${text.length} chars`;

  if (!text.trim()) {
    preview.innerHTML = "";
    setStatus("空内容");
    return;
  }

  try {
    setStatus("渲染中");
    const unsafeHtml = marked.parse(text);
    const safeHtml = DOMPurify.sanitize(unsafeHtml, {
      USE_PROFILES: { html: true },
    });
    preview.innerHTML = safeHtml;
    setStatus("marked GFM");
  } catch (error) {
    preview.textContent = error?.message || String(error);
    setStatus("渲染失败", true);
  }
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

editor.addEventListener("keydown", (event) => {
  const isDeleteLineHotkey = (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key === "d";
  if (!isDeleteLineHotkey) {
    return;
  }

  event.preventDefault();

  const value = editor.value;
  const selectionStart = editor.selectionStart;
  const selectionEnd = editor.selectionEnd;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndBase = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndBase === -1 ? value.length : lineEndBase + 1;

  const nextValue = value.slice(0, lineStart) + value.slice(lineEnd);
  editor.value = nextValue;
  editor.selectionStart = lineStart;
  editor.selectionEnd = lineStart;
  localStorage.setItem(STORAGE_KEY, nextValue);
  render(nextValue);
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
