# 健身记录

像素风本地健身记录 App。

这个项目从一个网页原型逐步迭代成了可安装的 Expo Android 应用，核心目标是让用户在手机上快速记录训练、查看历史、管理项目，并长期保留本地数据。

## 当前版本

- 版本号：`1.2.0`
- Android `versionCode`：`3`
- 技术栈：`Expo` / `React Native`
- 数据存储：`@react-native-async-storage/async-storage`

## 当前能力

- 本地保存训练数据
- 首页打卡与月历视图
- 日历短按切换训练强度颜色
- 日历长按查看当天训练历史
- 训练库管理
- 新增与编辑训练项目
- 训练项目图片设置
- 开始训练后的计时
- 记录组数、次数、重量
- 组间休息倒计时与跳过
- 每个训练项目的进步曲线
- Android 可安装 APK 构建
- 升级版本后保留已有本地数据

## 版本更新

### `1.0.0`

第一版完成了产品基础形态：

- 建立手机 App 基础结构
- 实现黑白灰像素风界面
- 完成训练库、训练计时、组数记录、重量记录
- 支持项目图片
- 支持本地数据持久化
- 导出首个可安装 APK

### `1.1.0`

第二版重点加强“记录与回顾”：

- 日历支持训练强度颜色标记
- 日历长按查看当天历史训练内容
- 日历颜色支持三段切换：原色 -> 绿色 -> 红色 -> 原色
- 增加训练项目成长曲线
- 显示重量与组数的折线趋势
- 升级数据结构并兼容旧用户数据
- 更新应用图标

### `1.2.0`

第三版重点优化交互和图标表现：

- 更换为新的 App 图标
- 为安卓自适应图标增加安全边距，避免裁切
- 训练库按钮从“开始”改为“编辑”
- 用户可重新编辑训练项目内容
- 删除训练项目前增加确认弹窗，减少误触

## 项目结构

- [mobile-app.js](D:/创作/codex/2/mobile-app.js)：Expo 手机 App 主逻辑
- [app.json](D:/创作/codex/2/app.json)：Expo 配置、版本号、图标配置
- [eas.json](D:/创作/codex/2/eas.json)：EAS 云构建配置
- [assets/icon2.png](D:/创作/codex/2/assets/icon2.png)：当前应用主图标
- [assets/icon2-adaptive.png](D:/创作/codex/2/assets/icon2-adaptive.png)：安卓自适应图标前景图

## 本地开发

安装依赖：

```bash
npm install
```

启动 Expo：

```bash
npx expo start --port 8083
```

常用命令：

```bash
npm run android
npm run ios
```

## 构建

Android APK 使用 EAS 云构建：

```bash
npx eas-cli build -p android --profile preview
```

## 说明

- 目前数据保存在本地，不依赖云端账号系统。
- 当前版本优先保证记录流程和版本升级兼容。
- 后续适合继续扩展 SQLite、本地导出备份、统计页、动作 PR 记录等能力。
