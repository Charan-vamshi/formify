# ⚡ Smart Form X
> A secure, intelligent form platform designed to replace the chaos of unmonitored links with strict access control, automated deadlines, and verified identity.

[![Live App](https://img.shields.io/badge/Live_App-Render-success?style=for-the-badge&logo=render)](https://formify-y9mb.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Auth](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google)](https://cloud.google.com)

---

## 📦 Quick Specs & Architecture (At a Glance)

| Component | Technology | What It Does |
| :--- | :--- | :--- |
| **Live Deployment** | [Render Cloud](https://formify-y9mb.onrender.com) | Auto-deploying 24/7 production server |
| **Database & Storage** | [Supabase](https://supabase.com) (PostgreSQL) | Relational database with pooled connections & SSL |
| **Backend API** | Node.js + Express.js | Secure REST endpoints, role guards & session manager |
| **Authentication** | Google OAuth 2.0 (Passport.js) | Verified student, admin & owner login |
| **Frontend UI** | Vanilla JS (HTML5, Modern CSS3) | Lightweight, zero-framework, lightning-fast UI |

---

## 🎯 Why We Built This (The Real Problems We Solved)

Standard form tools (like Google Forms) work for basic polls, but fail in real college, workplace, and organizational settings:

```
┌─────────────────────────────────┐      ┌──────────────────────────────────┐
│     The Common Form Problems    │  ──► │       Smart Form X Solution      │
├─────────────────────────────────┤      ├──────────────────────────────────┤
│ 1. The "WhatsApp Leak"          │  ──► │ 🔒 Whitelist & Blacklist Filters │
│ 2. The "Midnight Alarm"         │  ──► │ ⏳ Auto-Expiring Form Links      │
│ 3. Anonymous Spam / Fake Emails │  ──► │ 🔑 Strict Google OAuth Sign-in   │
│ 4. Multiple / Duplicate Answers │  ──► │ 🚫 Strict "One-Time" Submissions │
│ 5. Sunlight Unreadability       │  ──► │ ☀️ Smart Day/Night Theme Engine   │
└─────────────────────────────────┘      └──────────────────────────────────┘
```

* **The WhatsApp Leak**: When a form link gets shared in group chats, unauthorized people jump in and fill it out. Smart Form X stops this by checking an approved email whitelist before even rendering the questions.
* **The Midnight Alarm**: Admins usually have to stay awake until 11:59 PM to toggle a form closed. With our schedule engine, the link closes itself down to the exact second.
* **Fake Submissions**: Anyone can type `asdf@gmail.com` in a text box. Here, students must log in with real Google accounts, so every answer belongs to a verified person.
* **Sunlight Usability**: Trying to fill a dark form while standing outside under direct morning sunlight is frustrating. Smart Form X automatically detects daylight hours and switches to a readable, soft off-white theme.

---

## 🚶 Step-by-Step System Tour

### Step 1: The Front Door & Google Authentication (`/`)
* **What happens**: Visitors see a clean landing page with one primary button: **Access System**.
* **The Smart Routing Algorithm**:
  * If an **Owner** logs in &rarr; routed to the **Owner Console**.
  * If an **Admin** logs in &rarr; routed to the **Admin Workspace**.
  * If a **Student** visits with a shared form link &rarr; routed directly to that specific form.
  * If an unrecognized user tries to log in &rarr; blocked with a friendly security prompt.

---

### Step 2: The Owner Console (`/owner.html`)
> The control room for system ownership.

* **Delegate Access**: Owners can authorize new administrators simply by typing their Gmail address.
* **Instant Revocation**: Revoke any admin's privileges with a single click.
* **Multiple Owner Support**: Multiple owners can manage the same platform concurrently with real-time database sync.
* **Dynamic Role Guard**: The backend inspects the active Google session on every single request—typing another person's email into the URL bar gets immediately rejected.

---

### Step 3: The Admin Workspace (`/admin.html`)
> A modern two-part dashboard built for speed and clarity.

#### 1. Form Studio (Builder)
* Build forms with **8 dynamic question components**:
  * Short Text, Long Text (Textarea), Email, Numeric, Date Picker, Multiple Choice (Radio), Checkboxes, and Dropdowns.
* Add, remove, and dynamically renumber options and questions on the fly.
* Mark individual fields as required or optional.

#### 2. Access Control & Whitelist Engine
* **Whitelist Mode**: Upload a `.csv` or `.txt` file of allowed student emails. Only students on this list can view or submit.
* **Blacklist Mode**: Upload a list of barred emails to explicitly deny access.
* **Public Mode**: Toggle off whitelist to allow open responses for general surveys.

#### 3. Automatic Expiry Schedule
* Pick an optional **Date & Time deadline**.
* When the clock runs out, the server and client automatically shut down submissions.

#### 4. Active Forms Directory
* Displays all forms created by the admin with live metric badges:
  * Status: `● Live` or `○ Draft`
  * Access: `🔒 Whitelist` or `🌐 Public`
  * Deadline: `⏳ Closes [Date & Time]` or `♾️ No deadline`
  * Total Submissions counter.
* Quick actions: **Copy Shareable Link**, **Go Live**, **View Submissions**, or **Delete Form**.

---

### Step 4: The Student Experience (`/form.html`)
> Simple, distraction-free, and crystal clear.

* **Identity Check**: Automatically verifies the student's logged-in Gmail against both the whitelist and blacklist.
* **Deadline Awareness**: Shows a clean badge: `📅 Deadline: [Date & Time]` right below the form title.
* **Duplicate Prevention**: If the student has already submitted, the page immediately displays: *"✅ You have already submitted this form."* and blocks multiple attempts.
* **Mobile-First Layout**: Fully responsive card design with smooth focus transitions on inputs.

---

### Step 5: Responses & Analytics (`/responses.html`)
> Real-time submission data with zero clutter.

* **Quick Metric Cards**: Total Submissions, Matching Filter Results, and Unique Participants.
* **Powerful Search & Filter**:
  * Filter live by student email.
  * Filter by submission date range (From &rarr; To).
  * Sort by Newest, Oldest, or Email (A-Z / Z-A).
* **One-Click CSV Export**: Downloads a clean spreadsheet with question titles as columns and formatted answers as rows.

---

### Step 6: Smart Theme Engine (Day & Night)
* **Automatic Time Sensor**:
  * **6:00 AM – 6:00 PM**: Switches automatically to a soft, warm off-white theme (`#f4f4f5`) designed for bright sunlight visibility.
  * **6:00 PM – 6:00 AM**: Switches automatically to the sleek, deep zinc dark theme (`#09090b`).
* **Fixed Floating Manual Toggle**:
  * A small floating ☀️ / 🌙 button fixed in the bottom-right corner across all pages.
  * Allows manual switching at any time and saves your preference in `localStorage`.

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

```sql
Users (UserID, Email, Role, CreatedAt)
  ├── Forms (FormID, AdminID, FormTitle, FormStructure, RequireWhitelist, ExpiresAt, IsLive, CreatedAt)
  │     ├── Whitelists (WhitelistID, FormID, StudentEmail)
  │     ├── Blacklists (BlacklistID, FormID, StudentEmail)
  │     └── Submissions (SubmissionID, FormID, StudentEmail, ResponseData, SubmittedAt)
```

* **`Users`**: Stores Owner and Admin accounts with strict role separation.
* **`Forms`**: Stores complete form schemas as JSON, expiry timestamps, and visibility flags.
* **`Whitelists` / `Blacklists`**: Fast index-backed tables for instant email authorization.
* **`Submissions`**: Stores student responses as structured JSON records with unique email per form constraints.

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Charan-vamshi/formify.git
cd formify
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
PORT=3000
DB_HOST=your-supabase-host.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.your-project-ref
DB_PASSWORD=your-database-password
DB_NAME=postgres
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Run the server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Principles
* **Server-Side Verification**: Client URLs cannot be spoofed — the backend queries PostgreSQL on every request to confirm session identity.
* **Prepared SQL Statements**: All database operations use parameterized queries (`$1, $2, ...`) preventing SQL injection.
* **Session Cookie Protection**: OAuth user state is held in encrypted HTTP sessions.

---

<p align="center">
  Crafted with care for <b>Smart Form X</b> • 2026
</p>
