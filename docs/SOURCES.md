# 内容与素材来源

## 原文

曹植《洛神赋》为古代公有领域作品。本项目以[维基文库固定版本7908816](https://zh.wikisource.org/w/index.php?title=洛神賦&oldid=7908816&variant=zh-hans)为底本，序文与正文快照在source-text.txt，运行数据位于src/content.mjs。仅将末句源字“𬴂”统一显示为“騑”，不混合其他版本。译意、简注、章节名和赏析为本项目阅读辅助。

## 插图与环境

十四幅完整插图、封面与环境材质由项目提供，运行WebP保留原画比例。本仓库发布网站运行资源，未附带原始高分辨率归档。三版檐影由内置ImageGen生成，保存为public/dynasty/roof-ink.png、roof-silk.png、roof-mist.png；旧参考檐图在同目录roof.png。

## 组件与视觉参考

- 用户提供的uiX Scroll Mask方案用于旧版开场；Ink Dynasty提示词启发卷后檐下字帘，实际字帘为本项目实现。
- [React Bits](https://reactbits.dev/)的Gradual Blur公开说明与实现启发静读底层的渐进柔边，本项目用局部CSS实现；没有把正文放入模糊或遮罩。
- [Three.js](https://threejs.org/)用于卷轴与折面；React与Vite用于页面及构建。

外部依赖与素材的权利依各自权利人的许可，本仓库未为第三方素材授予额外使用许可。
