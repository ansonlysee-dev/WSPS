# WSPS — Washing Sample Projection System

洗水样板产能预测系统：各品牌按业务週（週六至週五）填预计款数 / 件数和实际完成数，系统对照产能上限显示风险，并提供週度明细、完成率趋势、修改记录、月度摘要和匯出。

- 开发与维护：Anson（`ansonlysee-dev`）
- 线上网址：https://ansonlysee-dev.github.io/WSPS/
- 结构：单一 `index.html`，数据存于 Firebase Firestore，`main` 由 GitHub Pages 自动发布

## 本机打开

```bash
git clone https://github.com/ansonlysee-dev/WSPS.git
cd WSPS
python3 -m http.server 8000   # 浏览器打开 http://localhost:8000
```

> ⚠️ 本机打开连接的是**正式** Firebase 数据库，所做的修改所有同事都会看到。

## 参与

发现问题或有改进想法，请看 [CONTRIBUTING.md](CONTRIBUTING.md)。
