Twitter フォロー分析アプリ プロトタイプ3
====

### 概要

Twitterのフォロー状況を分析し、「両思い」「片思い」「フォローされている」の3種類に分類します。(クライアント/サーバ型)

### 使い方

以下の環境変数を設定します。

- TWITTER_ACCESS_TOKEN_KEY
- TWITTER_ACCESS_TOKEN_SECRET
- TWITTER_CONSUMER_KEY
- TWITTER_CONSUMER_SECRET

コマンドラインから

$ node dist/server/main.js

で起動し、ブラウザで以下のURLにアクセスします。

http://localhost:3000/

コマンドライン引数

`--create-stub`

Twitter APIのレスポンスをあとで再利用できるように保存します。

`--use-stub`

Twitter APIからデータを取得する代わりに`--create-stub`で保存したデータを使用します。
