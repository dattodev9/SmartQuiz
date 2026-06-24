# 🧠 Smart Quiz — AI-Powered Quiz Generator

Chrome Extension (Manifest V3) cho phép bạn bôi đen văn bản trên bất kỳ trang web nào, tạo quiz trắc nghiệm và tóm tắt nội dung bằng AI (Google Gemini).

## ✨ Tính năng

- **🎯 Tạo Quiz**: Bôi đen đoạn văn → chuột phải → "Tạo Quiz" → 5 câu trắc nghiệm
- **📝 Tóm tắt**: Bullet points + Flashcards từ đoạn văn đã chọn
- **✅ Chấm điểm**: Highlight đáp án đúng/sai + giải thích chi tiết
- **📚 Lịch sử**: Xem lại và làm lại các quiz đã tạo
- **🌐 Đa ngôn ngữ**: Quiz sinh ra theo ngôn ngữ gốc của văn bản

## 🏗️ Kiến trúc

```
smart-quiz/
├── extension/     # Chrome Extension (React + Vite + CRXJS + TailwindCSS v4)
├── backend/       # Serverless Backend (AWS Lambda + DynamoDB + Gemini AI)
└── shared/        # Shared TypeScript types
```

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js 20+
- Google Gemini API Key ([Lấy tại đây](https://aistudio.google.com/apikey))
- Docker (cho DynamoDB Local, tuỳ chọn)

### Cách 1: Chạy setup script

```bash
# Windows
setup.bat
```

### Cách 2: Cài thủ công

```bash
# 1. Install Extension dependencies
cd extension
npm install

# 2. Install Backend dependencies
cd ../backend
npm install

# 3. Copy và cấu hình .env
cp .env.example .env
# Sửa file .env, thêm GEMINI_API_KEY
```

### Chạy Development

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Extension (Vite dev server)
cd extension
npm run dev
```

### Load Extension vào Chrome

1. Mở `chrome://extensions/`
2. Bật **Developer Mode** (góc phải trên)
3. Click **Load unpacked**
4. Chọn thư mục `extension/dist`
5. Extension sẽ xuất hiện trên toolbar

## 📖 Cách sử dụng

1. Mở bất kỳ trang web nào
2. **Bôi đen** đoạn văn bản muốn học
3. **Chuột phải** → chọn `🧠 Smart Quiz` → `🧠 Tạo Quiz từ đoạn này`
4. **Side Panel** sẽ mở bên phải với quiz
5. Chọn đáp án → Nộp bài → Xem điểm + giải thích

## 🔧 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Extension UI | React 18, TypeScript, TailwindCSS v4 |
| Build Tool | Vite + CRXJS Plugin |
| Extension APIs | Manifest V3, Side Panel, Context Menus |
| Backend | Node.js, TypeScript, Serverless Framework |
| AI Engine | Google Gemini 2.0 Flash |
| Database | Amazon DynamoDB |
| Validation | Zod |

## 📁 Cấu trúc chi tiết

### Extension
- `src/background/` — Service Worker: context menus, API calls, storage
- `src/content/` — Content Script: text extraction & cleaning
- `src/sidepanel/` — React UI: Quiz, Summary, History views
- `src/lib/` — Utilities: API client, messaging, storage wrappers

### Backend
- `src/handlers/` — Lambda functions: generateQuiz, generateSummary, getHistory
- `src/services/` — Business logic: AI, content processing, DynamoDB
- `src/middleware/` — Rate limiter, request validator, error handler
- `src/prompts/` — AI prompt templates (quiz + summary)

## 🔐 Bảo mật

- ✅ API Key không bao giờ lưu trên client
- ✅ Mọi AI request đều qua Backend proxy
- ✅ Rate limiting: 10 requests/phút/user
- ✅ Request validation với Zod
- ✅ Tuân thủ Manifest V3 CSP

## 📜 License

MIT
