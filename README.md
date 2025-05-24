# 📝 シンプルタスク管理アプリ

Node.js + Expressで作られたシンプルなタスク管理Webアプリケーションです。

## 🚀 セットアップ

1. 依存関係をインストール:
```bash
npm install
```

2. アプリケーションを起動:
```bash
npm start
```

3. ブラウザで http://localhost:3000 にアクセス

## 🌟 機能

- ✅ タスクの追加・削除・完了切り替え
- 🔍 フィルター機能（すべて・未完了・完了済み）
- 📊 タスク統計表示
- 🧹 完了済みタスク一括削除
- 📱 レスポンシブデザイン

## 🏗️ 技術構成

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript (ES6)
- **API**: RESTful endpoints
- **Storage**: メモリ内（再起動で初期化）

## 📁 プロジェクト構造

```
claude-project/
├── app.js              # Express サーバー
├── package.json        # プロジェクト設定
├── public/            # 静的ファイル
│   ├── index.html     # メインHTML
│   ├── style.css      # スタイルシート
│   └── script.js      # フロントエンドJS
└── README.md          # このファイル
```

## 🔌 API エンドポイント

- `GET /api/tasks` - 全タスク取得
- `POST /api/tasks` - 新規タスク作成
- `PUT /api/tasks/:id` - タスク更新
- `DELETE /api/tasks/:id` - タスク削除
