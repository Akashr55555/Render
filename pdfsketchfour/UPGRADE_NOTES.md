# PDFSketch upgrade notes

This ZIP contains the PDFSketch source with the competitive/security/UX improvements applied in the current upgrade pass.

Important production configuration:

- Set `CORS_ORIGINS` to the exact production frontend origins.
- Configure all `VITE_FIREBASE_*` values from the real Firebase project.
- Configure `GEMINI_API_KEY` only on the server/runtime secret store.
- Configure a real payment provider and verified webhooks before enabling premium entitlements.
- Run `npm install`, `npm run lint`, and `npm run build` in the deployment environment before release.
