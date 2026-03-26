# Rebuild VIP Health Recs App from Scratch

Your project files were lost, so we need to rebuild the entire app. Here's the full plan:

## What will be rebuilt

**Features:**
- Phone number login screen with country code selector and formatted input
- ADA Health History intake form (7-step wizard) with avatar image at the top and progress bar
- Dashboard with health stat tiles (BP, Heart Rate, Sleep, Steps), upcoming appointments, medication alerts, referral notifications
- Appointments tab with list, detail view, and create new appointment
- Health Records tab with search, category filters, and detail view
- Medications tab with stock level tracking, low-stock alerts, and refill requests
- Referrals tab with Medical ↔ Dental referral workflow, 5-step create wizard, status timeline, and accept/decline actions
- All data persisted locally on device with sample data seeded on first launch

**Design:**
- Clean "banking app" aesthetic with primary blue (#1E6BB8) and secondary blue (#4A8FD3)
- Light neutral gray backgrounds with white cards and subtle shadows
- Animated stat tiles, button press effects, and smooth page transitions
- Mobile-native feel with proper spacing, typography, and card-based layouts

**Screens:**
- **Login** — Phone number input with country code picker, animated branding
- **Intake Form** — 7-step ADA Health History wizard with avatar at top, progress bar (Patient Info → Dental History → Medical Conditions → Allergies → Medications → Women's Health → Review & Consent)
- **Dashboard** — Quick stats grid, upcoming appointments, medication alerts, pending referrals, recent records
- **Appointments** — Filterable list, detail view, create form (in-person or virtual)
- **Records** — Searchable list with category chips, detail view with download button
- **Medications** — List with stock bars, detail view with refill/discontinue actions, add new form
- **Referrals** — List with search and filter chips, detail view with status timeline, 5-step create wizard

**App Icon:**
- Blue gradient background with white medical cross/shield symbol
