# 🛡️ Poodiest - Admin Panel

The admin application for Poodiest is a management dashboard built with **React 19**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Admin Authentication**: Google-only Firebase sign-in, restricted by the backend to the configured admin email.
- **Recipe Management & Moderation**: View and remove recipes across the platform.
- **User Oversight**: View registered user details and activity.

---

## 📁 Project Structure

```text
admin/
├── src/
│   ├── api/axios.js                  # Admin Axios instance
│   ├── components/ProtectedRoute.jsx # Protected-route guard
│   ├── context/
│   │   ├── AuthContext.js            # Auth context declaration
│   │   ├── AuthContext.jsx           # Auth provider implementation
│   │   └── useAuth.js                # Auth context hook
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   └── Login.jsx
│   ├── App.jsx                       # App wrapper
│   ├── index.css                    # Tailwind entry point
│   └── main.jsx                     # Entry point and routes
├── index.html
├── vite.config.js
├── .env                       # Environment variables
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `admin/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Use the same Firebase project as the public frontend. Enable Google as the
only sign-in provider in Firebase Authentication, add the admin app's local
and deployed domains to its authorized domains, and configure the backend
`ADMIN_EMAIL` with the same Google account that should have admin access. The
admin app reads `ADMIN_EMAIL` from this file for an early sign-in check; the
backend must also enforce the same value because client-side settings are not a
security boundary.

The admin API provides paginated post and user lists, permanent post and account
removal, and approval or denial of re-entry requests. Removing an account
deletes its database user record and related content while retaining a minimal
Firebase UID/email access-control record needed to block future sign-ins or
accept an admin-reviewed re-entry request.

---

## 🏃 Running the Admin Panel

```bash
# Start dev server
npm run dev

# Build for production
npm run build
```
