# Design System

> 单一真理来源：`src/theme.js`。本文档解释意图，代码定义值。视觉参考：`ACN1~ACN4 _ _.html`（Figma 导出，已在 .gitignore）。

## Color

策略：**Restrained**（暖纸中性 + 单一红橙强调）。强调色 ≤ 10% 表面。

| Token | Value | 用途 |
|-------|-------|------|
| `bg`        | `#F2F0EC` | 主背景。暖纸质，略偏黄绿（不是冷灰） |
| `surface`   | `#E7E4DE` | 次要表面、被动卡片 |
| `ink`       | `#0A0A0A` | 主文字。**不用 `#000`** |
| `ink2`      | `#1A1A1A` | 副文字 |
| `ink3`      | `#222222` | 三级文字（极少用） |
| `ink55`     | `rgba(10,10,10,0.55)` | 灰文字、说明、坐标轴 |
| `ink35`     | `rgba(10,10,10,0.35)` | 占位、禁用 |
| `ink18`     | `rgba(10,10,10,0.18)` | 描边轻量 |
| `ink12`     | `rgba(10,10,10,0.12)` | 分割线 |
| `ink06`     | `rgba(10,10,10,0.06)` | 按压态背景 |
| `accent`    | `#FF3B1F` | CTA、当前活跃、PR 标记。**不超过 10% 表面** |
| `accentDim` | `rgba(255,59,31,0.12)` | accent 弱化背景（toast/进度未填部分） |
| `white`     | `#FFFFFF` | 仅在 accent 上的反白文字 |

**禁用：** `#000`、`#fff` 直用；纯灰（无暖色调）；任何半透明白叠加（玻璃）。

## Theme

光照场景：**白天健身房 / 室内强光，手套手单手操作，30cm 视距，旁边可能有人能看到屏幕。**
→ 决定：**Light only**。Dark mode 不在本期范围。

## Typography

四个字族：

| Token | Family | 用途 |
|-------|--------|------|
| `body` | 系统默认 sans (San Francisco / Roboto / Noto Sans SC) | 中文正文、按钮中文标签 |
| `mono` | JetBrains Mono | `//` 章节标签、单位、tab 文字、序号 |
| `doto` | Doto (Bold) | 大号像素数字（KPI、计时、重量、次数） |
| `vt`   | VT323 | （备选）状态栏数字、特殊小标 |

**字号阶梯**（紧凑，比例 ≈ 1.2）：`9 / 10 / 11 / 13 / 14 / 16 / 18 / 22 / 26 / 44`

- 中文正文最小 **13px**；数据/单位最小 **11px**
- KPI 大数字 Doto 用 26 或 44，加 `letterSpacing: -1`
- mono 文字加 `letterSpacing: 0.3~1.2` 显得更克制

## Layout

- **零圆角**（`borderRadius: 0`）— 系统级规则
- 容器外边距 `SP(5) = 20px`，内边距 `SP(3) = 12px`
- 分割线一律 1px，颜色 `ink12`
- 卡片有 1px 实线 `ink` 边框（高对比）；列表行用底边分割线（低对比）
- **不嵌套卡片**（skill 共享禁令）
- **不所有东西都套容器**（同上）

## Components

### Interactive states

每个可点击元素必须提供：

- **default**: 正常
- **pressed**: `backgroundColor: ink06` 或 `opacity: 0.7`
- **active/selected**: `backgroundColor: ink` + `color: bg`（深色实底反白）
- **disabled**: `color: ink35`，无边框或边框转 `ink12`
- **loading**: 灰背 + skeleton 条（**不用 spinner**）
- **error**: accent 边框 + accent 文字

### 关键模式

- **`// 章节标题`** mono 11px ink55 letterSpacing 0.5
- **CTA**：`accent` 主按钮（白字深底）或 `outline` 次按钮（线框）
- **List row**：左侧 mono 序号 28px 宽 → 主名（16/600）→ 副说明（mono 11 ink55）→ 右侧动作或 chevron `›`
- **KPI**：`Doto` 大数字（44）+ mono 小标签（11）。三列以 `ink12` 分割
- **Tag chip**：1px ink 边，padding `8 × 3`，mono 11

## Motion

- 状态变化 150~220ms，`ease-out-quart`
- 不动 layout 属性（width/height）
- 计时器数字不做平滑插值，**每秒整跳**（符合像素字体调性）
- `Pressable` 的按压反馈 100ms 内出现

## Iconography

- 不用 emoji
- 用终端字符：`✓ ✗ — ◀ ▶ ← → ↑ ↓ ▸ ›`
- 必要时用 react-native-svg 画 1.5px stroke 单色细线图标

## Anti-patterns（本项目独有）

在 shared 绝对禁令之上：
- 训练 App 老套头像渐变 / 火焰徽章
- "今日训练度"环形进度（用 cell 阵列代替）
- "鼓励文案"（用客观数据描述）
