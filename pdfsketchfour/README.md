# PDFSketch — Production Deployment

This is the production deployment source for PDFSketch.

## Build

```text
npm install
npm run build
npm start
```

Node.js 20+ is required.

## Required environment variables

Configure the real deployment secrets/values through the platform's secure environment/secret store. Do not commit a populated `.env` file.

Required Firebase web variables:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Server-side integrations may additionally require the variables documented in `.env.example`, including Stripe and Gemini configuration.

## Security

- Firebase configuration fails closed when required values are missing.
- CORS rejects origins outside the configured allowlist.
- Explicit CORS methods and allowed headers are configured.
- Security response headers include X-Frame-Options and Cross-Origin policies.
- Never place real API keys, Stripe secrets, Firebase service-account credentials, or populated `.env` files in source control.
