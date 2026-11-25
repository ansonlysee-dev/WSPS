# WSPS Firebase Emulator Security Rules Tests

這套測試只在本地 Firebase Firestore Emulator 執行，project ID 是 `wsps-emulator-rules-test`，不會連接正式 Firebase project `wsps---zsyd`。

## 執行測試

```bash
npm install
npm run test:rules
```

`npm run test:rules` 會由 Firebase CLI 啟動本地 Firestore Emulator，執行 9 組測試，完成後自動關閉 Emulator。

## 覆蓋範圍

- 未登入使用者不能讀取或寫入目前的 `wsps/data`。
- 目前單一主資料文件只允許 WRD／管理員寫入；品牌使用者只能讀取。
- 備份只可建立一次，不能覆蓋或刪除，並檢查必要欄位及 `schemaVersion: 2`。
- Audit Log 只可新增，不能修改或刪除，並驗證操作者 UID。
- 未來拆分記錄 `wsps_entries/{entryId}` 的品牌級權限。
- 負數、款數大於件數、不明欄位及錯誤格式均應被拒絕。
- 歷史記錄及使用者角色資料不能由一般使用者刪除。

## 重要限制

現時 WSPS 網站仍使用單一 `wsps/data` 文件，而且尚未正式接入 Firebase Authentication。因此，`firestore.rules` 是待驗證的安全 Rules 草稿，不會自動部署，也不會取代正式環境目前的 Rules。

在正式部署前，必須先完成 Firebase Authentication、`users/{uid}` 角色資料、資料拆分遷移方案，以及正式環境的回滾計劃。所有正式 Rules 變更都應先在 Emulator 通過測試，再由管理員另行審批部署。
