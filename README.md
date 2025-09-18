# 故事播放器（Netlify 直发版）

一个纯静态网页应用，播放 `/audio/` 下的 MP3 音频；音频列表由 `/data/stories.json` 维护。部署在 Netlify，即可全站 CDN 加速。

## 快速开始

1. 把你的 MP3 放进 `audio/` 目录（例如 `demo-1.mp3`、`demo-2.mp3`）。
2. 编辑 `data/stories.json`，填上文件名与标题等信息。
3. 推送到 GitHub。
4. Netlify 后台 **Add new site → Import from Git**，选择该仓库；无需 Build 命令、发布目录留空（站点根目录）。

上线地址示例：`https://your-site.netlify.app/`  
音频直链示例：`https://your-site.netlify.app/audio/demo-1.mp3`

## JSON 清单格式

```
[
  { "title": "小兔子找家", "artist": "睡前故事", "cover": "assets/cover-default.svg", "file": "demo-1.mp3" },
  { "title": "海的女儿", "artist": "格林系列", "cover": "assets/cover-default.svg", "file": "demo-2.mp3" }
]
```

- `file` 支持相对路径（放在 `/audio/`）或完整 URL（如放在 OSS/COS/CDN）。
- 如需分组/专辑，可自行扩展 JSON 字段，并在 `app.js` 的 `renderPlaylist()` 中按需分组展示。

## 自定义

- 封面图：替换 `assets/cover-default.svg`，或在 `stories.json` 针对每条指定 `cover`。  
- 主题样式：修改 `styles.css`。  
- 首次自动播放哪一条：在 `init()` 里调整。

## 常见问题

- **音频不播放**：检查浏览器是否因未用户交互而拦截自动播放；点击播放键即可。  
- **文件 404**：确认 Netlify 发布包含 `audio/`；相对路径区分大小写。  
- **国内访问速度**：默认使用 Netlify CDN；若仍慢，可把大文件迁移到阿里云 OSS/腾讯云 COS，然后在 JSON 中填写它们的外链。

—— 生成时间：2025-09-18 09:34:29
