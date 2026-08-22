# PDFSketch — Production Deployment

PDFSketch is a comprehensive, client-and-server PDF processing platform with 30+ tools (Merge, Split, Compress, OCR, Convert, Protect, Sign, and AI translation).

---

## 🚀 One-Click Deploy to Render

### Method 1: Using Render Blueprint (Recommended)
1. Push this repository to your **GitHub** account.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Click **Apply**.

---

### Method 2: Manual Web Service on Render
1. In [Render Dashboard](https://dashboard.render.com), click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `pdfsketch`
   - **Language / Runtime**: `Node`
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `22` (or set `NODE_VERSION=22.14.0` in Environment Variables)
   - **Health Check Path**: `/api/health`
4. (Optional) Under **Environment Variables**, configure any secrets from `.env.example`:
   - `GEMINI_API_KEY` (for AI PDF translation)
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET` (for payments)
   - `VITE_FIREBASE_*` (for user authentication)

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Run development server with Hot Reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 Environment Variables Reference

See `.env.example` for the full list of configuration options. All tools run in offline mode even without external API keys configured.
