# 🏨 ホテル客室清掃・インシデント管理システム

ホテルの客室清掃状況とインシデント（トラブル・要対応）をリアルタイムで一元管理するWebアプリです。

🖥️ **[デモを見る](https://room-management-system.pages.dev/)**

---

## ✨ 主な機能

- **客室状態管理** — 空室・清掃中・使用中・使用停止を一覧で管理
- **インシデント記録** — 客室ごとのトラブルや要対応事項を登録・追跡
- **データ自動保存** — ブラウザ内に自動保存（サーバー不要）
- **スタッフ別ダッシュボード** — 担当者ごとの作業進捗を可視化

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| データ | localStorage（サーバー不要） |
| ビルド | Vite 6 |
| デプロイ | Cloudflare Pages |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/room-management-system.git
cd room-management-system
npm install
npm run dev
```