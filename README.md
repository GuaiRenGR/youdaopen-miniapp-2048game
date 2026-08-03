# 有道屏 2048 小游戏

一款基于 Falcon IoT 小程序框架开发的横屏 2048 游戏，针对窄屏智能设备进行了紧凑布局和触控操作优化。

## 运行效果

- 设计基准：`1048 × 240`
- 测试设备：A7P
- 测试分辨率：`1024 × 240`
- 页面会通过 Falcon `viewport` 机制按设备宽度等比缩放

## 功能

- 标准 4 × 4 2048 合并规则
- 分数与移动步数统计
- 当前最大数字与目标进度展示
- 棋盘触摸滑动操作
- 屏幕方向键操作
- Web 预览支持键盘方向键
- 达到 2048 后可继续挑战
- 无可移动方块时显示结算并支持重新开始

## 操作方式

在棋盘区域向上、下、左、右滑动，或点击页面右侧方向键移动数字。Web 预览中也可以使用键盘方向键操作。

相同数字在移动方向上相邻时会合并，每次有效移动后随机生成一个 `2` 或 `4`。合成 `2048` 即达成目标。

## 开发环境

- Node.js
- npm
- `aiot-vue-cli`
- Falcon UI `^2.0.2`

依赖安装：

```bash
npm install
```

## 构建与预览

启动预览：

```bash
npm run start
```

构建 Web 版本：

```bash
npm run build:web
```

构建设备调试包：

```bash
npm run build
```

构建设备 Release 包：

```bash
npm run build:prod
```

Windows PowerShell 如果因执行策略无法运行 `npm.ps1`，可以将上述命令中的 `npm` 替换为 `npm.cmd`。

## 项目结构

```text
src/
├── app.js                       # 应用入口及设计视口配置
├── app.json                     # 页面与全局样式配置
├── game-logic.js                # 棋盘移动、合并和状态判断
└── pages/
    └── index/
        └── index.vue            # 游戏页面、触摸交互与视觉样式
docs/                            # Falcon IoT 小程序框架文档
api-mock/                        # JSAPI 模拟数据
```

## 验证

项目已通过以下检查：

- 2048 核心逻辑定向用例
- `npm run build:web` Web 构建
- A7P 设备 `1024 × 240` 分辨率测试

## 技术说明

页面使用 Falcon 文档推荐的 `px + viewport` 适配方案，应用在 `app.js` 中设置 `1048` 设计视口。界面仅使用框架支持的基础 `div`、`text`、Flexbox、触摸事件和 CSS 动画能力，便于同时运行在设备端与 Web 预览环境。
