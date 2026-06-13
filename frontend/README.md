# 🧠 AI Knowledge Assistant — Frontend

A sleek, modern web app for uploading PDFs and chatting with an AI that answers questions based on your documents. **No backend server needed** — it talks directly to n8n webhooks.

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🚀 Quick Start

### 1. Set your Webhook URLs

Open **`app.js`** and update the two variables at the very top of the file:

```js
const UPLOAD_WEBHOOK_URL = "https://your-n8n-instance.app.n8n.cloud/form/...";
const CHAT_WEBHOOK_URL   = "https://your-n8n-instance.app.n8n.cloud/webhook/...";
```

| Variable              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `UPLOAD_WEBHOOK_URL`  | n8n **Form Trigger** URL for PDF ingestion      |
| `CHAT_WEBHOOK_URL`    | n8n **Chat Trigger / Webhook** URL for the AI agent |

### 2. Open in Browser

Simply open `index.html` in your browser — no build step required!

**Option A — Direct open:**
```
Double-click index.html
```

**Option B — Local server (recommended for CORS):**
```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
frontend/
├── index.html    ← Main HTML page
├── style.css     ← Complete design system (dark theme, responsive)
├── app.js        ← All application logic + webhook URL config
└── README.md     ← You're reading this
```

---

## ✨ Features

| Feature                   | Details                                              |
| ------------------------- | ---------------------------------------------------- |
| **PDF Upload**            | Drag-and-drop or click-to-browse, PDF-only validation |
| **Upload Progress**       | Simulated progress bar with status messages           |
| **ChatGPT-style Chat**    | Message bubbles, typing indicator, auto-scroll        |
| **Session Memory**        | Unique `sessionId` per tab for n8n memory context     |
| **Responsive Design**     | Sidebar on desktop, bottom tabs on mobile             |
| **Dark Glassmorphism UI** | Premium dark theme with gradient accents              |
| **Toast Notifications**   | Non-intrusive success/error feedback                  |
| **Error Handling**        | Friendly messages when n8n is slow or unreachable     |

---

## ⚠️ CORS Note

If you open `index.html` directly via `file://`, the browser may block API calls due to CORS. Use a local HTTP server (see Quick Start above) or configure CORS headers in your n8n instance.

---

## 🔧 How It Works

1. **Upload** — sends a `multipart/form-data` POST with field name `file` to the n8n Form Trigger.
2. **Chat** — sends `{ "chatInput": "...", "sessionId": "..." }` as JSON POST to the n8n Chat Webhook.
3. **Session** — a random UUID is generated once per tab (`crypto.randomUUID()`). All chat messages in that tab share the same session so n8n's memory node keeps context.

---

## 👨‍💻 Author — Yash Thakur

Made with ❤️
