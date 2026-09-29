# 美容サロンLINE bot (line-bot-salon)

LINE公式アカウント上で動く、美容サロン向けのFAQ自動応答bot。Claude AI(Anthropic API)による質問応答と、オーナーが自分で運用できる管理画面(FAQ/メニュー管理・お知らせ配信・会話ログ閲覧)をセットで提供します。

## 公開URL

- **本番URL:** https://line-bot-salon-pink.vercel.app
- **管理画面:** https://line-bot-salon-pink.vercel.app/admin/login (パスワード保護)

## 主な機能

**お客様向け(LINE bot)**
- LINEでメッセージを送ると、登録済みのFAQ・メニュー/料金情報をもとにClaude AIが自動で回答
- 質問をカテゴリ分類した上で回答を生成する2段階構成
- 確信度(高/中/低)を判定し、低い場合はその場で保留にせず、オーナーへ自動でエスカレーション通知
- スタンプや無関係な内容には過剰反応せず、適切にハンドリング

**オーナー向け(管理画面 `/admin`)**
- パスワードによるログイン保護、スマホでの操作を想定したUI(44px以上のタップ領域)
- FAQの追加・編集・削除
- メニュー・料金の追加・編集・削除(bot回答にそのまま反映)
- 会話ログの閲覧(要確認のみで絞り込み可能)
- 友だち全員への一斉お知らせ配信(送信前に確認ダイアログ)

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router, Server Actions) |
| 言語 | TypeScript / React 19 |
| スタイリング | Tailwind CSS 4 |
| DB | Supabase (PostgreSQL) |
| LINE連携 | LINE Messaging API (`@line/bot-sdk`) |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`, tool use による構造化出力) |
| ホスティング | Vercel |

## スクリーンショット

> 準備中: 管理画面(FAQ一覧・メニュー一覧・会話ログ・お知らせ配信)のスクリーンショットをここに追加予定。

## セットアップ(ローカル開発)

```bash
git clone <このリポジトリのURL>
cd line-bot-salon
npm install
cp .env.example .env.local  # 値を埋める(下記参照)
npm run dev
```

`http://localhost:3000` で起動します。LINEのWebhookをローカルで受けるにはngrokなどでトンネリングし、LINE DevelopersのWebhook URLを一時的にそちらへ向けてください。

### 環境変数(`.env.example` 参照)

| 変数名 | 内容 |
| --- | --- |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINEチャネルアクセストークン |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonキー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service roleキー(サーバー専用) |
| `ANTHROPIC_API_KEY` | Anthropic APIキー |
| `OWNER_LINE_USER_ID` | エスカレーション通知先のオーナーLINEユーザーID |
| `ADMIN_PASSWORD` | 管理画面(`/admin`)のログインパスワード |

## ディレクトリ構成(抜粋)

```
src/
  app/
    api/line/webhook/   # LINE Webhookハンドラ(bot本体のロジック)
    admin/              # 管理画面(FAQ / メニュー / 会話ログ / お知らせ)
  lib/
    claude.ts           # Claude APIによる分類・回答生成
    faq.ts / menus.ts   # FAQ・メニューデータ取得
    auth.ts             # 管理画面の簡易認証
    lineBroadcast.ts    # 一斉配信
    notifyOwner.ts       # オーナーへのエスカレーション通知
  middleware.ts          # /admin配下の認証ガード
supabase/migrations/      # DBスキーマ(faq / menus / conversations)
```

## デプロイ

Vercelにデプロイ後、LINE Developersコンソールの「Messaging API設定」→「Webhook設定」で、本番URLの `/api/line/webhook` をWebhook URLとして登録してください(例: `https://line-bot-salon-pink.vercel.app/api/line/webhook`)。環境変数はVercelの Settings → Environment Variables に登録します。
