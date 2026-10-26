# KindCart v2

This version connects the static GitHub Pages frontend to Supabase for real email authentication and database-backed wish submissions.

## Before uploading
1. Run `security-admin.sql` in the Supabase SQL Editor.
2. Keep Email authentication enabled and keep the GitHub Pages Site URL / Redirect URL configured.
3. Upload `index.html`, `styles.css`, `app.js`, and `admin.html` to the root of the GitHub repository, replacing the old versions.
4. Create your first account from the live KindCart site and confirm its email.
5. Only after the account exists, promote that specific account to admin in the SQL Editor. Do not expose a service-role or secret key in these files.

## Not enabled yet
Photo storage and real payments are intentionally not enabled yet. They need Storage policies and a server-side payment/webhook flow respectively.
