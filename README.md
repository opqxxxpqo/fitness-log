# 健身记录

当前工作区包含两个版本：

- `index.html` + `styles.css` + `app.js`：网页原型
- `App.js` + `app.json` + `package.json`：Expo 手机 App

## 手机 App 版已具备

- 本地存储训练数据和打卡记录
- 黑白灰像素风移动端界面
- 首页周进度和打卡日历
- 训练库管理
- 训练项目名称、分类、默认组数、默认次数、默认重量
- 从手机相册选择项目图片
- 开始训练后的计时
- 记录组数、次数、重量
- 自定义组间休息倒计时和自由跳过

## 启动方式

先安装依赖：

```bash
npm install
```

然后启动 Expo：

```bash
npm run start
```

常用命令：

```bash
npm run android
npm run ios
```

## 说明

- 本地存储使用 `@react-native-async-storage/async-storage`
- 训练图片选择使用 `expo-image-picker`
- 当前版本优先完成核心训练流程，下一步适合继续补历史详情、统计页和正式应用图标
