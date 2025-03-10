# Notion Maid

Discord Botがメンションされた際にURLを含むメッセージを検出し、そのURLのコンテンツを要約してNotionのページとして保存するBotです。

## 機能

- Discord上でボットがメンションされると、そのメッセージからURLを検出
- 複数のURLを一度に処理可能
- URLからコンテンツを抽出
- 抽出したコンテンツをGemini AIを使って要約
- 要約された内容をNotionページとして保存
- 複数のサーバーでそれぞれ異なるNotionページIDを設定可能

## セキュリティ対策

このBotはデータベースセキュリティに配慮した設計を採用しています。

- サーバーID（Discord Guild ID）は保存前にハッシュ化されます
- NotionページIDはサーバーIDの平文をキーとして暗号化されて保存されます
- このため、データベースに直接アクセスできる管理者であっても、保存されているNotionページIDを復号化することはできません
- サーバーIDと対応するNotionページIDの関係は、正しいサーバーIDの平文を持つBotが実行する時のみ解読可能です

## 環境のセットアップ

必要なパッケージをインストールします

```shell
npm install
```

## 環境変数の設定

プロジェクトのルートディレクトリに`.env`ファイルを作成し、以下の環境変数を設定します:

```.env
DISCORD_TOKEN=your_discord_bot_token
NOTION_TOKEN=your_notion_integration_token
HASH_SALT=your_hash_salt_for_encryption
GEMINI_API_KEY=your_gemini_api_key
```

- DISCORD_TOKEN: Discord Developer Portalで取得したBot Token
- NOTION_TOKEN: Notionインテグレーションで取得したAPIトークン
- HASH_SALT: 暗号化に使用するソルト（任意の文字列）
- GEMINI_API_KEY: Google AI StudioでのGemini APIキー

## APIキーの取得方法

### 1. Notion APIの取得方法

Notion APIを利用するには、以下の手順でAPIキー（インテグレーショントークン）を取得します。

1. [Notionの開発者向けページ](https://www.notion.so/my-integrations)にアクセスし、Notionアカウントでログインします。
2. 「新しいインテグレーションを作成」し、必要な情報を入力してインテグレーションを作成します。
3. 作成後、表示される「インテグレーショントークン」をコピーして`.env`ファイルの`NOTION_TOKEN`に設定します。
4. Notionデータベースまたはページに作成したインテグレーションを共有（接続）する必要があります。使用したいページを開き、右上の「・・・」メニューから「接続を追加」を選択し、作成したインテグレーションを選択します。

### 2. Gemini APIの取得方法

Gemini APIを利用するには、以下の手順でAPIキーを取得します。

1. [Google AI Studio](https://ai.google.dev/)にアクセスし、Googleアカウントでログインします。
2. 「Get API key」をクリックし、プロジェクトを作成またはプロジェクトを選択します。
3. 「APIキーを作成」をクリックし、表示されるAPIキーをコピーして`.env`ファイルの`GEMINI_API_KEY`に設定します。

### 3. Discord APIの取得方法

Discord APIを利用するには、以下の手順でBotトークンを取得します。

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセスし、Discordアカウントでログインします。
2. 「New Application」をクリックし、アプリケーション名を入力して作成します。
3. 左側のメニューから「Bot」を選択し、「Add Bot」をクリックしてBotを追加します。
4. 「Reset Token」をクリックしてトークンを生成し、表示される「TOKEN」をコピーして`.env`ファイルの`DISCORD_TOKEN`に設定します。
5. 左側のメニューから「OAuth2」→「URL Generator」を選択します。
6. 「Scopes」で「bot」と「applications.commands」を選択します。
7. 「Bot Permissions」でメッセージの送信と読み取りの権限を選択します。
8. 生成されたURLをブラウザで開き、Botを追加したいサーバーを選択します。

## 使い方

1. Botを起動します:

```shell
npm run start
```

2. サーバーごとにNotionページIDを登録します:

```
/register pageid:your_notion_page_id
```

3. DiscordのチャンネルでBotをメンションし、URLを含めたメッセージを送信します:

```
@NotionMaid https://example.com/article
```

複数のURLを一度に送信することもできます:

```
@NotionMaid https://example.com/article1 https://example.com/article2
```

4. Botは自動的にURLのコンテンツを取得し、要約して、Notionページとして保存します。複数のURLが含まれている場合、それぞれを個別に処理して別々のNotionページとして保存します。

5. 必要に応じて、サーバーからNotionページIDの登録を解除できます:

```
/unregister
```

## プロジェクト構造

- `index.js` - Discord Botのメイン実装
- `util/`
  - `crypt.js` - 暗号化機能
  - `db.js` - データベース操作
  - `extractAllUrls.js` - メッセージからURLを抽出
  - `getContentByUrl.js` - URLからコンテンツを抽出
  - `insertPage.js` - Notionページを作成
  - `summarizeText.js` - Gemini AIを使用してテキストを要約
