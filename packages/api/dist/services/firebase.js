import admin from 'firebase-admin';
let app = null;
export function firebaseInit() {
    if (app)
        return app;
    // Initialize using Application Default Credentials or env-provided credentials
    // If running in Docker/production, set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path
    // or provide base64 JSON via FIREBASE_SERVICE_ACCOUNT env var
    const saBase64 = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!admin.apps.length) {
        if (saBase64) {
            const json = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf-8'));
            app = admin.initializeApp({ credential: admin.credential.cert(json) });
        }
        else {
            app = admin.initializeApp();
        }
    }
    else {
        app = admin.app();
    }
    return app;
}
export function firestore() {
    if (!app)
        firebaseInit();
    return admin.firestore();
}
