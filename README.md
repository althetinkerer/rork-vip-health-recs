# VIP Health Recs

A comprehensive **personal health management mobile app** built with React Native and Expo. VIP Health Recs gives users a single place to track appointments, medications, health records, referrals, and insurance — all securely tied to their Supabase account.

---

## ✨ Features

### 🔐 Authentication & Onboarding
- Phone-number login with country code selector
- **7-Step ADA Health History intake wizard** (Patient Info → Dental History → Medical Conditions → Allergies → Medications → Women's Health → Review & Consent)
- Progress bar and avatar displayed throughout the intake flow

### 🏠 Dashboard
- Quick-stat tiles: Blood Pressure, Heart Rate, Sleep, Steps
- Upcoming appointments at a glance
- Medication low-stock alerts
- Pending referral notifications
- Recent health records summary

### 📅 Appointments
- Filterable appointment list (upcoming / past)
- Detailed appointment view
- Create new appointments (in-person or virtual)
- Provider selection with **My Dentists** and **Near Me** tabs

### 📁 Health Records
- Searchable records list with category filters
- Detail view with document download
- Document upload via camera scan or file picker

### 💊 Medications
- Stock-level progress bars with low-stock alerts
- Detail view with refill and discontinue actions
- Prescription history and Rx ledger
- Add new medications

### 🔄 Referrals
- Medical ↔ Dental referral workflow
- 5-step create wizard
- Status timeline (Pending → Accepted / Declined)
- Accept and decline actions for incoming referrals
- Message provider with auto-attached patient records

### 🔔 Reminders
- Configurable daily oral health reminders (brushing, flossing)
- Editable morning and afternoon reminder times

### 🛡️ Insurance
- Upload insurance card via camera scan
- Simulated OCR pipeline to extract policy info
- Active policy displayed on dashboard
- Proactive prompt to upload insurance before scheduling

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) ~54 |
| Routing | [Expo Router](https://expo.github.io/router/) v6 (file-based) |
| Backend / Auth | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) v5 |
| Data Fetching | [TanStack React Query](https://tanstack.com/query) v5 |
| UI / Icons | [@expo/vector-icons](https://icons.expo.fyi/), [Lucide React Native](https://lucide.dev/) |
| Language | TypeScript |
| Package Manager | [Bun](https://bun.sh/) |

---

## 📁 Project Structure

```
rork-vip-health-recs/
├── expo/                    # Main Expo app
│   ├── app/
│   │   ├── (tabs)/          # Bottom-tab screens
│   │   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   ├── records/
│   │   │   ├── medications/
│   │   │   ├── referrals/
│   │   │   ├── ledger/
│   │   │   └── profile/
│   │   ├── auth.tsx         # Phone login screen
│   │   ├── onboarding.tsx   # 7-step health history intake
│   │   ├── reminders.tsx    # Reminder configuration
│   │   ├── message-provider.tsx
│   │   ├── refills.tsx
│   │   └── upload/
│   ├── components/          # Shared UI components
│   ├── context/             # React context providers
│   ├── constants/           # Colors, theme, config
│   ├── lib/                 # Supabase client, utilities
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Seed / mock data
│   └── mocks/               # Mock services
├── database.sql             # Supabase schema + RLS policies
├── android/                 # Android native project
└── PLAN.md                  # Original feature spec
```

---

## 🗄️ Database Schema

All tables use **Row Level Security (RLS)** — users can only access their own data.

| Table | Description |
|---|---|
| `appointments` | Scheduled visits with providers |
| `health_records` | Clinical documents and records |
| `medications` | Active and past prescriptions |
| `providers` | Doctors and dentists |
| `referrals` | Medical-to-dental and dental-to-medical referrals |
| `health_histories` | ADA intake form submissions (stored as JSONB) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (package manager)
- [Expo Go](https://expo.dev/go) app on your device, or an iOS/Android simulator
- A [Supabase](https://supabase.com/) project

### 1. Clone the repo

```bash
git clone https://github.com/althetinkerer/rork-vip-health-recs.git
cd rork-vip-health-recs/expo
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the `expo/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database

Run `database.sql` in the Supabase SQL editor to create all tables and RLS policies.

### 5. Start the development server

```bash
bun start
```

Then scan the QR code with Expo Go or press `i` for iOS simulator / `a` for Android.

---

## 🎨 Design

- **Color palette**: Primary blue `#1E6BB8`, secondary blue `#4A8FD3`, light neutral gray backgrounds
- **Style**: Clean "banking app" aesthetic — white cards, subtle shadows, clear typography
- **Animations**: Animated stat tiles, button press effects, smooth page transitions
- **Orientation**: Portrait-only (iOS & Android)

---

## 📄 License

Private project — all rights reserved.
