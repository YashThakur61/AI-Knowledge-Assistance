# 🤖 PDF AI Chatbot using n8n

An AI-powered chatbot that answers questions from any uploaded PDF file.
Upload a PDF, ask questions, and get accurate answers powered by Pinecone, Cohere, and Groq.

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [n8n](https://n8n.io) | Workflow automation |
| [Pinecone](https://pinecone.io) | Vector database |
| [Cohere](https://cohere.com) | Embeddings (embed-english-v3.0) |
| [Groq](https://groq.com) | LLM (llama-3.3-70b-versatile) |

## 📁 Project Structure

```
pdf-ai-chatbot/
├── ingestion-workflow.json   
├── agent-workflow.json       
└── README.md                 
```

## ⚙️ How It Works

### Workflow 1 — PDF Ingestion
```
Form Upload → Delete Old Vectors → Extract PDF → Embed with Cohere → Store in Pinecone
```

### Workflow 2 — AI Agent Chat
```
Chat Message → AI Agent → Groq LLM → Search Pinecone → Answer
```

## 🚀 Setup Guide

### Step 1 — Create Pinecone Index
1. Go to [pinecone.io](https://pinecone.io) and login
2. Click Indexes → Create Index
3. Set Name: `pdfindex`, Dimensions: `1024`, Metric: `cosine`
4. Copy your API key and Host URL

### Step 2 — Get API Keys
| Service | Where |
|---------|-------|
| Pinecone | Dashboard → API Keys |
| Cohere | dashboard.cohere.com → API Keys |
| Groq | console.groq.com → API Keys |

### Step 3 — Import Workflows into n8n
1. Open n8n
2. Click Add Workflow → three dots → Import from file
3. Import `ingestion-workflow.json`
4. Repeat for `agent-workflow.json`

### Step 4 — Set Up Credentials in n8n
1. Go to Settings → Credentials
2. Add credentials for Pinecone, Cohere and Groq

### Step 5 — Update HTTP Delete Node
In ingestion workflow, click Delete Old Vectors node and update:
- URL: `https://YOUR-INDEX-HOST-URL/vectors/delete`
- Api-Key header: Your Pinecone API key

### Step 6 — Test
1. Run ingestion workflow and upload a PDF
2. Check Pinecone dashboard — vector count should be more than 0
3. Open agent workflow and ask a question about your PDF 🎉

## 💡 Features
- ✅ Upload any PDF via web form
- ✅ Auto deletes old PDF vectors before inserting new ones
- ✅ Answers only from your uploaded PDF
- ✅ Remembers conversation context
- ✅ Fast responses using Groq LLM

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent uses own knowledge | Update system prompt to force vector store use |
| Binary file error | Make sure form field name matches Extract node |
| 404 Pinecone error | Check index name matches in both workflows |
| Authorization failed | Check API key is correct |
| Failed to call function | Switch Groq model to llama-3.3-70b-versatile |

## ⚠️ Important Notes
- Always start a new chat session after uploading a new PDF
- Both workflows must use the same Pinecone index name
- Cohere embed-english-v3.0 requires 1024 dimensions in Pinecone

## 👨‍💻 Author
Made with ❤️ using n8n

## 📄 License
MIT License