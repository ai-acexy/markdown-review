const ASSET_TIMEOUT_MS = 2500;

const ASSETS = {
  css: [
    {
      name: "github-markdown-css",
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css",
      local: "./public/vendor/styles/github-markdown.min.css",
    },
    {
      name: "highlight-style",
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css",
      local: "./public/vendor/styles/highlight-github.min.css",
    },
  ],
  js: [
    {
      name: "dompurify",
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.2.6/purify.min.js",
      local: "./public/vendor/dompurify.min.js",
    },
    {
      name: "marked",
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.12/marked.min.js",
      local: "./public/vendor/marked.min.js",
    },
    {
      name: "highlight",
      cdn: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js",
      local: "./public/vendor/highlight.min.js",
    },
  ],
};

function loadStyle(href, timeoutMs) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    const timer = setTimeout(() => {
      link.remove();
      reject(new Error(`Style load timeout: ${href}`));
    }, timeoutMs);

    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    link.onerror = () => {
      clearTimeout(timer);
      link.remove();
      reject(new Error(`Style load failed: ${href}`));
    };

    document.head.appendChild(link);
  });
}

function loadScript(src, timeoutMs) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      script.remove();
      reject(new Error(`Script load timeout: ${src}`));
    }, timeoutMs);

    script.src = src;
    script.async = false;
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      reject(new Error(`Script load failed: ${src}`));
    };

    document.body.appendChild(script);
  });
}

async function loadWithFallback(asset, loader) {
  try {
    await loader(asset.cdn, ASSET_TIMEOUT_MS);
    return "cdn";
  } catch {
    await loader(asset.local, ASSET_TIMEOUT_MS);
    console.warn(`[fallback] ${asset.name} loaded from local`);
    return "local";
  }
}

async function bootstrap() {
  for (const cssAsset of ASSETS.css) {
    await loadWithFallback(cssAsset, loadStyle);
  }

  for (const jsAsset of ASSETS.js) {
    await loadWithFallback(jsAsset, loadScript);
  }

  await loadScript("./app.js", ASSET_TIMEOUT_MS);
}

bootstrap().catch((error) => {
  console.error("Asset bootstrap failed:", error);
});
