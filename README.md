# Bonzo → Monday.com Lead Sync (Node.js)

Beginner-friendly Express app that listens for Bonzo event hooks and syncs only **Appt Scheduled** leads into Monday.com.

## What this app does

1. Receives Bonzo webhook events at `POST /webhooks/bonzo`
2. Reads lead info (name, email, phone, prospect id, stage)
3. Ignores any lead whose stage is not exactly `Appt Scheduled`
4. For `Appt Scheduled` leads, it syncs to Monday using this order:
   - Match existing item by **Bonzo Prospect ID**
   - If not found, match by **Email**
   - If still not found, create a **new** item
5. If found, it updates the existing item status to **App Scheduled**

---

## Project structure

```txt
.
├── src
│   ├── app.js
│   ├── config
│   │   └── index.js
│   ├── routes
│   │   └── bonzoWebhook.js
│   ├── services
│   │   └── mondayService.js
│   └── utils
│       ├── leadMapper.js
│       └── logger.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## Monday board setup (important)

Create a board in Monday with these columns (or similar):

- Name (main item name)
- Email (email column)
- Phone (phone/text column)
- Bonzo Prospect ID (text column)
- Status (status column)

Then grab each column ID from Monday and put it in `.env`.

---

## Where to paste Monday API token

Open `.env` and paste your token here:

```env
MONDAY_API_TOKEN=your_real_token_here
```

Also set your board ID and column IDs in the same `.env` file.

---

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Edit `.env`

Set all values:

```env
MONDAY_API_TOKEN=
MONDAY_BOARD_ID=
MONDAY_NAME_COLUMN_ID=name
MONDAY_EMAIL_COLUMN_ID=email
MONDAY_PHONE_COLUMN_ID=phone
MONDAY_PROSPECT_ID_COLUMN_ID=bonzo_prospect_id
MONDAY_STATUS_COLUMN_ID=status
BONZO_WEBHOOK_SECRET=
PORT=3000
```

### 3) Start app

```bash
npm run dev
```

or

```bash
npm start
```

### 4) Test health endpoint

```bash
curl http://localhost:3000/health
```

---

## Webhook endpoint

- URL path: `/webhooks/bonzo`
- Method: `POST`
- Header (optional if enabled): `x-bonzo-secret`

Example test request:

```bash
curl -X POST http://localhost:3000/webhooks/bonzo \
  -H "Content-Type: application/json" \
  -H "x-bonzo-secret: replace_with_shared_secret" \
  -d '{
    "prospect": {
      "id": "12345",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "555-555-5555",
      "pipeline_stage": "Appt Scheduled"
    }
  }'
```

---

## Deploy to Render

1. Push this project to GitHub.
2. In Render, click **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Use these settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in Render dashboard (`Environment` tab):
   - `MONDAY_API_TOKEN`
   - `MONDAY_BOARD_ID`
   - `MONDAY_NAME_COLUMN_ID`
   - `MONDAY_EMAIL_COLUMN_ID`
   - `MONDAY_PHONE_COLUMN_ID`
   - `MONDAY_PROSPECT_ID_COLUMN_ID`
   - `MONDAY_STATUS_COLUMN_ID`
   - `BONZO_WEBHOOK_SECRET` (optional but recommended)
   - `PORT` (optional on Render)
6. Deploy.
7. Copy Render URL and set Bonzo webhook URL to:
   - `https://YOUR-RENDER-APP.onrender.com/webhooks/bonzo`

---

## Notes

- Stage check is intentionally strict: only exact `Appt Scheduled` triggers sync.
- Status written to Monday is `App Scheduled` per requested output.
- Matching logic prevents duplicate leads by checking Prospect ID first, then email.
