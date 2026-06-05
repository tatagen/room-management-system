# ホテル客室オペレーション管理システム

> 客室清掃の進捗・インシデント報告をリアルタイム管理するWebアプリ

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FF6C37?style=flat-square&logo=firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)

---

## 解決する課題

ホテルの清掃スタッフとマネージャーの連携を改善します。「どの部屋がいつ清掃完了するか」「現場でトラブルが発生した際の報告と対応」を、電話や口頭確認なしにリアルタイムで把握できるようにします。

---

## 機能

### マネージャー向け
- 全客室の清掃状況ダッシュボード（リアルタイム更新）
- スタッフへの客室割り当て
- インシデント・修理依頼レポートの確認と対応

### 清掃スタッフ向け
- 担当客室の確認・ステータス更新（未着手 / 清掃中 / 完了）
- インシデント報告（写真添付対応）
- リアルタイム作業進捗の共有

---

## 技術的なポイント

- **Firebase Auth** によるロールベースアクセス制御（マネージャー / スタッフで画面を切り替え）
- **Firebase Firestore** のリアルタイムリスナーで、ページリロード不要の即時更新を実現
- **Firebase Storage** で写真付きインシデント報告を管理
- **React 19 + motion/react** によるスムーズなアニメーションとUX
- **Tailwind CSS v4** でモバイル（スタッフ）とデスクトップ（マネージャー）両方に最適化したレスポンシブUI

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19 / TypeScript / Vite 6 |
| スタイリング | Tailwind CSS v4 / motion/react |
| データベース | Firebase Firestore |
| ストレージ | Firebase Storage（写真保存） |
| 認証 | Firebase Auth |
| UIアイコン | lucide-react |

---

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に Firebase の設定を追加
npm run dev
```

環境変数の詳細は `.env.example` を参照してください。
