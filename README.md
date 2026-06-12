# Heaven's Bite Bakery — WhatsApp Order Extractor

An AI-powered web application that converts WhatsApp bakery conversations into structured order records automatically.

Built as a Proof of Concept (POC) for Heaven's Bite Bakery, a home-based bakery that receives customer orders primarily through WhatsApp.

---

## Problem Statement

Small bakery owners often manage orders manually through WhatsApp chats. During peak periods, extracting customer details, item quantities, delivery information, and special instructions becomes time-consuming and error-prone.

---

## Solution

This application automatically converts WhatsApp conversations into structured bakery orders using AI.

Users can:

* Upload exported WhatsApp chat files (.txt)
* Upload WhatsApp screenshot images
* Paste raw conversation text

The system extracts relevant order information and stores it in a structured format while generating business statistics.

---

## Features

### AI-Powered Order Extraction

Extracts:

* Customer Name
* Phone Number
* Ordered Items
* Item Quantities
* Delivery Address
* Delivery Time
* Special Instructions
* Order Date

### Multiple Input Methods

* WhatsApp Chat Export (.txt)
* Screenshot Upload
* Direct Text Paste

### Bakery Dashboard

* Total Orders
* Total Items Sold
* Unique Customers
* Most Ordered Products
* Recent Order History

### Order Management

* Automatic order storage
* Historical order tracking
* Statistics generation

---

## Live Demo

Frontend:

https://heavens-bite-order-parser.vercel.app

Backend API:

https://heavens-bite-order-parser.onrender.com/docs

---

## Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Lucide Icons

### Backend

* FastAPI
* SQLAlchemy
* Pydantic

### Database

* SQLite

### AI Layer

* Google Gemini 2.0 Flash

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## System Architecture

WhatsApp Chat / Screenshot

↓

React Frontend

↓

FastAPI Backend

↓

Gemini AI Extraction

↓

Structured Order JSON

↓

SQLite Database

↓

Statistics Dashboard

---

## API Endpoints

| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | /health                    | Health Check                 |
| POST   | /api/orders/extract/text   | Extract from WhatsApp Export |
| POST   | /api/orders/extract/images | Extract from Screenshots     |
| POST   | /api/orders/extract/raw    | Extract from Pasted Text     |
| GET    | /api/orders                | List Orders                  |
| GET    | /api/orders/statistics     | Statistics Dashboard         |
| GET    | /api/orders/{id}           | Get Order Details            |

Interactive API Documentation:

https://heavens-bite-order-parser.onrender.com/docs

---

## Project Structure

```text
backend/
├── app/
│   ├── routers/
│   ├── services/
│   ├── schemas/
│   ├── models/
│   ├── database.py
│   ├── config.py
│   └── main.py

frontend/
├── src/
│   ├── components/
│   ├── api/
│   ├── types/
│   └── App.tsx
```

---

## Example Workflow

1. Export a WhatsApp conversation.
2. Upload the .txt file.
3. AI processes the conversation.
4. Order details are extracted automatically.
5. Order is saved to the database.
6. Dashboard statistics update instantly.

---

## Future Scope

The following features are intentionally out of scope for this POC but could be added in future versions:

* Payment Tracking
* Delivery Tracking
* Inventory Management
* Customer Notifications
* WhatsApp Business Integration
* Analytics Dashboard
* Automated Invoicing

---

## Author

Nisarg Parashar

Built as part of the OKCredit Internship POC submission.

---

## License

MIT License
