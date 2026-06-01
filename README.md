# ホテル客室オペレーション管理システム

ホテルの客室清掃状況・スタッフ割り当て・インシデント報告をリアルタイムで管理するWebアプリケーションです。

## 概要

清掃スタッフとマネージャーの連携を効率化するための業務管理ツールです。Firebase Firestoreによるリアルタイム同期で、ページリロード不要の即時情報共有を実現しています。

## 機能

### マネージャー画面
- 全客室の清掃状況ダッシュボード
- スタッフへの客室割り当て
- インシデント・備品紛失レポートの確認

### 清掃スタッフ画面
- 担当客室の確認・ステータス更新
- インシデント報告（写真添付対応）
- リアルタイムの作業進捗共有

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19 / TypeScript / Vite 6 |
| スタイリング | Tailwind CSS v4 / motion/react |
| データベース | Firebase Firestore |
| ストレージ | Firebase Storage（写真保存） |
| 認証 | Firebase Auth |
| UIアイコン | lucide-react |

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に Firebase の設定情報を追加
npm run dev
```

環境変数の詳細は `.env.example` を参照してください。
