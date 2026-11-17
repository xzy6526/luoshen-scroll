# 洛神赋 · 沉浸式数字长卷

以曹植《洛神赋》序文、完整正文与十四幅横卷插图组成的交互阅读网站。

- 网站：https://xzy6526.github.io/luoshen-scroll/
- 全文终章：https://xzy6526.github.io/luoshen-scroll/#full-text
- 版本：3.1.4

## 阅读体验

- 开场展卷与十四景完整原画、原文、译意、简注。
- 分景背景与阅读编排，目录、键盘翻页、近观、全屏赏画。
- 卷后全文页包含檐下字帘、三种檐影与柔边静读；支持静观与系统减少动态。
- 手机优先显示静读全文，可切回字帘互动。

## 本地运行

需要 Node.js 24。

```sh
npm ci
npm run start
```

打开终端显示的本地地址。生产构建：

```sh
npm test
npm run build
npm run preview
```

## GitHub Pages

提交到 main 后，GitHub Actions 会执行校验、构建并部署到 Pages。项目子目录由工作流中的 `--base=/${{ github.event.repository.name }}/` 设置，普通本地构建保留相对路径。

网站源码位于 src，运行图片与遮罩位于 public，正文底本快照位于 docs/source-text.txt。来源与素材说明见 [SOURCES.md](docs/SOURCES.md)。仓库发布可运行源码与网页资源，未包含本地内部工作记录和原始大图归档。

## 验证范围

正文连续性、十四景映射与折面几何使用 Node 测试。页面在隔离 Edge 和手机尺寸模拟中检查；真实手机、Safari、微信浏览器尚未完成实机验收。
