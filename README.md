# Heaven's Bite Bakery — WhatsApp Order Extractor

A Proof of Concept (POC) web application that converts WhatsApp bakery conversations into structured order records using AI.

Built for **Heaven's Bite Bakery**, a home-based bakery that receives most orders via WhatsApp.

![Stack](https://img.shields.io/badge/React-18-61DAFB)
![Stack](https://img.shields.io/badge/FastAPI-Python-009688)
![Stack](https://img.shields.io/badge/AI-Gemini%20%2F%20OpenAI-4285F4)

## Problem

During busy periods, the bakery owner manually reads WhatsApp chats and writes down order details. This POC automates that process.

## Solution

1. Export a WhatsApp chat as `.txt` (or upload screenshots / paste text)
2. AI extracts structured order fields
3. Results display in a clean UI with bakery statistics

### Extracted Fields

- Customer Name
- Phone Number
- Ordered Items & Quantities
- Delivery Address
- Delivery Time
- Special Instructions
- Order Date

### Explicitly Out of Scope

Payment tracking · Delivery tracking · Inventory · Dashboards · Reminders

## Project Structure

```
OKC2/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # Application entry point
│   │   ├── config.py        # Environment settings
│   │   ├── database.py      # SQLAlchemy async setup
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic (parser, AI, orders)
│   │   └── routers/         # API route handlers
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # UI components
│   │   └── types/           # TypeScript interfaces
│   └── package.json
├── samples/                 # Sample WhatsApp exports & expected outputs
├── docs/                    # API, database, and AI prompt docs
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier works) **or** OpenAI API key

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `.env` and add your API key:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
```

Start the API server:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### 3. Try a Sample Order

1. Click **Chat Export** tab
2. Upload `samples/chat_export_sarah_khan.txt`
3. View extracted order details and updated statistics

### Optional: Pre-load demo statistics (no AI needed)

```bash
cd backend
python seed_demo.py
```

This seeds 3 sample orders so the statistics panel is populated before your live demo.

## Demo Without AI (UI Only)

The frontend shows a warning if no API key is configured. For full demo, configure Gemini (recommended for students — free tier available).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/orders/extract/text` | Extract from `.txt` export |
| POST | `/api/orders/extract/images` | Extract from screenshots |
| POST | `/api/orders/extract/raw` | Extract from pasted text |
| GET | `/api/orders` | List saved orders |
| GET | `/api/orders/statistics` | Bakery statistics |
| GET | `/api/orders/{id}` | Get order by ID |

See [docs/API.md](docs/API.md) for full documentation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (async via aiosqlite) |
| AI | Google Gemini 2.0 Flash (default) or OpenAI GPT-4o-mini |
| Vision | Same AI provider for screenshot extraction |

## Database

Single `orders` table with JSON-encoded line items. See [docs/DATABASE.md](docs/DATABASE.md).

## AI Prompt

Documented in [docs/AI_PROMPT.md](docs/AI_PROMPT.md). Source: `backend/app/services/ai_extractor.py`.

## Sample Data

| File | Description |
|------|-------------|
| `samples/chat_export_sarah_khan.txt` | Delivery order with allergy notes |
| `samples/chat_export_james_obrien.txt` | Pickup order with item change |
| `samples/chat_export_priya_sharma.txt` | Large custom baby shower order |
| `samples/sample_outputs.json` | Expected extraction results |

## Student Demo Tips

1. Show WhatsApp export steps (chat → ⋮ → Export chat → Without media)
2. Upload sample file live and explain each extracted field
3. Upload a second sample to populate statistics (most ordered items chart)
4. Mention future extensions: payments, delivery tracking, inventory (out of scope)
5. Show `/docs` for API documentation during technical Q&A

## License

MIT — Free for educational and demonstration use.
