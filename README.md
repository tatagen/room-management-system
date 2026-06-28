# 🛎️ ホテル客室清掃・インシデント報告 リアルタイム管理システム

客室の清掃状態をリアルタイムで把握し、インシデント（備品不足・故障など）をその場で報告・共有できるホテル向け管理システムです。

---

## ✨ 主な機能

- **客室状態管理** — 清掃中・完了・点検待ちなど客室ごとのステータスをリアルタイム更新
- **インシデント報告** — 備品不足・設備不具合を写真付きで即時報告
- **スタッフ間リアルタイム共有** — Firebase により複数端末が同時に状態を同期
- **進捗ダッシュボード** — フロア別・時間帯別の清掃進捗を一覧表示

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| データ | Firebase Firestore（リアルタイム同期） |
| ビルド | Vite 6 |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/room-management-system.git
cd room-management-system
npm install
# .env.local に Firebase の設定を記入
npm run dev
```

> Firebase プロジェクトの設定が必要です（`.env.example` 参照）。