# 健身记录 v2

像素风健身记录 App 的第二代设计 — 全新的瑞士/暖纸质风格视觉系统。

- 技术栈：Expo / React Native
- 数据存储：`@react-native-async-storage/async-storage`
- 设计来源：`ACN1 _ _.html` ~ `ACN4 _ _.html`（Figma 导出，未提交到 git）

## 视觉系统

| Token | 值 | 用途 |
|-------|-----|------|
| `bg`     | `#F2F0EC` | 主背景（暖纸） |
| `surface`| `#E7E4DE` | 次要表面 |
| `ink`    | `#0A0A0A` | 主文字 |
| `accent` | `#FF3B1F` | CTA / 强调 |

- 全局圆角 `0px`（极简 / 瑞士风）
- 字体：`JetBrains Mono`（等宽）/ `Doto`（像素大数字）/ `VT323`

## 页面对应

| Tab | 对应设计 | 文件 |
|-----|---------|------|
| TODAY | ACN1 | `src/screens/Today.js` |
| WORK  | （自创，匹配设计语言）| `src/screens/Work.js` |
| STATS | ACN3 | `src/screens/Stats.js` |
| ME    | ACN4 | `src/screens/Me.js` |
| 训练中 | ACN2 | `src/screens/Workout.js` |

## 当前能力

- 4 个 Tab 完整还原设计稿
- 训练库 CRUD（在 WORK 页新增/编辑/删除项目）
- 训练计时（含暂停/继续）
- 组数 / 重量 / 次数记录
- 组间休息倒计时（预设 + 自定义）
- PR 自动检测
- 本地数据持久化（AsyncStorage）
- 日历视图（按当日 set 数着色训练强度）
- 周容量柱状图
- 累计统计、连续天数、个人目标进度

## 开发命令

```bash
npm install
npx expo start
```

- 按 `a` 打开 Android 模拟器，`i` iOS，`w` 浏览器
- 真机扫描 Expo Go 二维码即可

## 构建 Android APK

沿用原版 EAS 工作流，按需补 `eas.json`：

```bash
npx eas-cli build -p android --profile preview
```

## 项目结构

```
App.js                       # 根组件 + Tab 切换
AppEntry.js                  # 入口
src/
  theme.js                   # 颜色/字体/间距 token
  storage.js                 # AsyncStorage + 数据派生
  components.js              # SectionLabel / Mono / Doto / CTA / Chip ...
  components/
    ScreenHeader.js          # 各 Tab 顶部的统一日期/周次头
  screens/
    Today.js                 # ACN1
    Work.js                  # 训练库 CRUD
    Stats.js                 # ACN3
    Me.js                    # ACN4
    Workout.js               # ACN2 训练进行中
assets/
  fonts/                     # 字体 (JetBrains Mono, Doto, VT323)
  icon.png                   # 占位图标（建议替换）
```

## 与原版差异

- 视觉完全重置，原黑白像素风 → 暖纸质 + 红橙强调
- 数据结构兼容性：v1 的 `library` / `history` 字段保持原义
- 训练日志结构略简化：`{ exerciseId, name, group, sets: [{weight, reps, isPR}], durationSec }`

## 已知 TODO

- `assets/icon.png` 是 Expo 默认占位，需要换成项目自己的图标
- ME 页"同步 Healthkit"、"+ 备注" 等是 placeholder，未接通
- 训练完成后没有正式的"小结弹窗"
