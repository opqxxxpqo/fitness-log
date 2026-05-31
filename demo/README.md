# 健身记录 v2 · Design Demo

像素瑞士风健身记录 App 的 web 设计 demo — 4 屏完整还原 ACN1~ACN4 设计稿，加一个 Overview 门面页。

参考 [london-component-operator-demo](https://github.com/opqxxxpqo/london-component-operator-demo) 的结构：Vite + React + Tailwind + React Router，手机壳锁 430px 宽，桌面端居中显示。

## 路由

| Path | 屏 | 对应设计 |
|------|----|---------|
| `/overview` | INFO  | demo 门面：色板/字体/路由清单 |
| `/today`    | TODAY | ACN1 |
| `/work`     | WORK  | 训练库（自创，沿用设计语言）|
| `/stats`    | STATS | ACN3 |
| `/me`       | ME    | ACN4 |
| `/workout`  | —     | ACN2 训练中（隐藏底部 nav）|

## 开发

```bash
npm install
npm run dev          # → http://localhost:5173
```

## 构建

```bash
npm run build        # 产物在 dist/
npm run preview      # 本地预览 dist
```

## 部署到 GitHub Pages

仓库地址若是 `username.github.io/fit-demo`，build 时设环境：

```bash
VITE_BASE=/fit-demo/ npm run build
```

主路由用 `HashRouter`，所以不需要 server-side rewrites，丢到 Pages 直接能用。

## 设计 token

全部在 `tailwind.config.js`：
- `bg #F2F0EC` / `surface #E7E4DE` / `ink #0A0A0A` / `accent #FF3B1F`
- `font-mono` JetBrains Mono / `font-doto` Doto / `font-sans` Noto Sans SC
- 全局零圆角（`@layer base { * { border-radius: 0 } }` 由 Tailwind config 强制）

## 文件结构

```
demo/
  index.html
  package.json
  tailwind.config.js
  vite.config.js
  postcss.config.js
  src/
    main.jsx
    App.jsx                  # 路由 + 手机壳
    index.css
    components/
      StatusBar.jsx          # 09:30 LTE 87% 状态条
      AppHeader.jsx          # 各页顶部 // kicker + 大标题
      BottomNav.jsx          # 5 个 Tab（INFO + 4 主屏）
      ui.jsx                 # Mono / Doto / Tag / SectionLabel / CTA ...
    data/mockData.js         # 假数据
    pages/
      Overview.jsx
      Today.jsx              # ACN1
      Work.jsx               # 训练库 CRUD
      Stats.jsx              # ACN3
      Me.jsx                 # ACN4
      Workout.jsx            # ACN2
```
