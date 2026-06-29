# 🏨 ホテル客室清掃・インシデント管理システム

ホテルの客室清掃状況とインシデント（トラブル・要対応）をリアルタイムで一元管理するWebアプリです。

🖥️ **[デモを見る](https://room-management-system.pages.dev/)**

---

## ✨ 主な機能

- **客室状態管理** — 空室・清掃中・使用中・使用停止を一覧で管理
- **インシデント記録** — 客室ごとのトラブルや要対応事項を登録・追跡
- **リアルタイム同期** — Firebase Firestoreによる複数端末リアルタイム共有
- **スタッフ別ダッシュボード** — 担当者ごとの作業進捗を可視化

## 🛠️ 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| データ | Firebase Firestore（リアルタイム同期） |
| ビルド | Vite 6 |
| デプロイ | Cloudflare Pages |

## 🚀 ローカル実行

```bash
git clone https://github.com/tatagen/room-management-system.git
cd room-management-system
cp firebase-applet-config.example.json firebase-applet-config.json
# firebase-applet-config.json にFirebaseプロジェクト情報を入力
npm install
npm run dev
```