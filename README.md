# Collaborative Candidate Notes

A **real-time candidate feedback app** built for the Algohire Full-Stack Developer Hackathon.
It enables recruiters and hiring managers to collaborate on candidate notes, tag colleagues with `@username`, and get real-time notifications.

---

## 🚀 Tech Stack

* **Next.js 15 (App Router)** – frontend + backend routes
* **NextAuth (Credentials Provider)** – authentication
* **Prisma ORM + PostgreSQL** – database
* **Pusher Channels** – real-time messaging
* **Tailwind CSS** – modern responsive UI
* **TypeScript** – type safety

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/collaborative-candidate-notes.git
cd collaborative-candidate-notes
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a **.env.local** file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Pusher
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="ap2" # or your region
```

### 4. Setup the database

Run Prisma migrations to generate tables:

```bash
# Local dev (creates migrations)
npx prisma migrate dev

# Production deploy (applies existing migrations)
npx prisma migrate deploy
```

(Optional) Seed dummy users/candidates:

```bash
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 📖 Usage Guide

1. **Sign Up & Login**

   * Create an account with **name, email, password**.
   * Login securely; unauthenticated users are redirected.

2. **Dashboard**

   * View a list of candidates.
   * Add dummy candidates (name + email).

3. **Candidate Notes**

   * Click a candidate → opens a **real-time notes room**.
   * Post messages with `@username` to tag colleagues.
   * Messages instantly broadcast to all viewers.

4. **Notifications**

   * If you are tagged, you receive:

     * A toast / badge notification.
     * A persistent entry in the **Notifications card** on the dashboard.
   * Click a notification → jumps directly to the tagged message.

---

## 🔒 Security

* All routes protected with NextAuth.
* Only authenticated users can view/write notes.
* Inputs are sanitized to prevent XSS/injection.

---

