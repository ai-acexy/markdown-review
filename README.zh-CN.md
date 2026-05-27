# markdown-review

我创建了这个简洁的 Markdown 在线预览项目，采用 GitHub 风格渲染。

## 环境信息

- 创作代理：Codex
- 使用模型：GPT-5（Codex coding agent runtime）
- 运行环境：Codex CLI

## 在线地址

- 使用地址：[https://markdown.acexy.cn](https://markdown.acexy.cn)

## 功能

- 我实现了输入时实时预览
- 我集成了 GFM 解析（`marked`）
- 我增加了 HTML 安全清洗（`DOMPurify`）
- 我启用了代码语法高亮（`highlight.js` + `marked-highlight`）
- 我设计了 CDN 优先加载，失败自动回退本地资源
- 我增加了本地存储持久化
- 我提供了示例内容 / 清空 / 复制 Markdown 操作
- 我增加了白天/黑夜主题切换（默认白天）
- 我让页面在桌面端与移动端都能自适应

## 快速开始

1. 直接在浏览器中打开 `index.html`。
2. 在左侧编辑区输入 Markdown。
3. 在右侧预览区查看渲染结果。

## 项目结构

- `index.html`：页面骨架与 UI 结构
- `bootstrap.js`：CDN 优先 + 本地回退的资源加载器
- `style.css`：布局与视觉样式
- `app.js`：Markdown 渲染与交互逻辑
- `public/vendor`：离线/回退使用的本地依赖资源

## 说明

- 我将本项目实现为纯静态前端方案。
- 无需构建工具，也无需安装依赖即可运行。
