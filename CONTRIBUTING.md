# 参与 WSPS

WSPS 由 **Anson**（`ansonlysee-dev`）开发和主导维护。**改不改、怎么改、什么时候上线，都由 Anson 决定。**
Jeff（`liewkiatfei`）和其他同事作为协助者，通过 Issue 和 Pull Request 提出问题和改进，由 Anson 审核后决定是否合并。

## 协助者怎么提

| 想做的事 | 怎么提 |
|---|---|
| 发现问题、显示错误（render issue） | 开 **Issue**：写清楚哪个页面、什么身份、看到什么、预期是什么，附截图 |
| 想加新功能、改设计 | 先开 **Issue** 说明想法，等 Anson 同意方向后再写代码 |
| 已经写好的修正 / 功能 | 开 **Pull Request**，交给 Anson 审核 |

## 协助者开 PR 的规矩

1. **不直接改 `main`。** `main` 推送后由 GitHub Pages 自动发布，就是同事每天在用的线上系统。协助者的改动一律从 Fork 或分支开 PR，**由 Anson 合并**。
2. **一个 PR 只做一件事**，方便 Anson 审核，也方便出问题时单独撤回。
3. **不破坏现有数据。** 会改动数据结构（`wsps/data`）的 PR，要写清楚旧数据怎么迁移、失败怎么还原。
4. **本机测试不碰正式库。** `index.html` 里的 Firebase 配置指向正式项目；本机打开就会读写正式数据。没有测试库时，只看界面、不输入。
5. 按 PR 模板填写（`.github/pull_request_template.md`）。`APP_VERSION` 由 Anson 在合并时决定，协助者不用改。

## Anson 审核时

合并、要求修改、或直接关闭，都可以。不合适的 PR 关掉即可，不需要解释太多。
