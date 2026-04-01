# Matchlance

A full-stack freelance marketplace where clients post jobs and hire freelancers, with real-time messaging, smart job matching, proposal management, and contract tracking.

**Live:** [matchlance.vercel.app](https://matchlance-frontend-d1rx.vercel.app/) &nbsp;|&nbsp; **Backend:** Node.js REST API + Socket.io on Render

---

## Overview

Matchlance is a two-sided marketplace with separate experiences for clients and freelancers. Clients post jobs with detailed requirements and budgets, review incoming proposals, and manage contracts. Freelancers get a personalized feed of jobs matched to their skills, submit proposals, and communicate with clients — all in real time.

---

## Features

### Clients

- Post jobs with title, description, category, required skills, budget (fixed or hourly range), experience level, and project duration
- Browse and manage all posted jobs with proposal counts and status
- Review freelancer proposals — cover letter, proposed budget, timeline, and availability
- Accept or reject proposals to move into contract stage
- Real-time chat with freelancers including typing indicators and read receipts
- View freelancer profiles before making hiring decisions

### Freelancers

- Build a detailed profile: skills, categories, hourly rate, availability, location, languages, and profile photo
- Browse a smart-matched job feed filtered by keyword, category, and experience level
- Submit proposals with a cover letter, proposed budget range, timeline estimate, and availability
- Edit pending proposals before a client responds
- Track accepted jobs and navigate to contracts
- Real-time chat with clients from any active job

### Both Roles

- Email/password auth with email verification, or Google OAuth
- JWT authentication with automatic token refresh and request queuing on 401
- Password reset via email link
- Light/dark theme with system preference detection and localStorage persistence

---

## Tech Stack

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **Framework**  | React 19 + TypeScript                                                    |
| **Build Tool** | Vite 7 (HMR, manual chunk splitting)                                     |
| **Routing**    | React Router v7                                                          |
| **Styling**    | Tailwind CSS v4 + PostCSS, CSS custom properties for theming             |
| **HTTP**       | Axios — interceptors handle token refresh and auth failure               |
| **Real-Time**  | Socket.io Client v4 — messaging, typing indicators, delivery/read status |
| **State**      | React Context (UserContext, ThemeContext)                                |
| **Deployment** | Vercel (SPA rewrites) + Render (backend)                                 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the [Matchlance backend](https://github.com/Successful-Guy/matchlance-backend)

### Install

```bash
git clone https://github.com/Successful-Guy/matchlance-frontend
cd matchlance-frontend
npm install
```

### Configure environment

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api
```

### Run

```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # ESLint
```

---

## Project Structure

```
src/
├── pages/
│   ├── auth/           # Signup, Login, Verify Email, Reset Password
│   ├── client/         # PostJob, Jobs, JobDetail, EditJob, ClientHome
│   ├── freelancer/     # Profile, MyProposals, EditProposal, MyJobs, FreelancerHome
│   └── shared/         # Landing, Chat
├── components/         # JobCard, ProposalForm, Contract, Navbar, ThemeToggle, ...
├── contexts/
│   ├── UserContext.tsx  # Auth state, user role, token refresh
│   └── ThemeContext.tsx # Light/dark mode
└── utils/
    ├── api.ts           # Axios instance with auth interceptors
    └── socket.ts        # Socket.io event helpers
```

---

## Architecture Notes

**Auth flow** — Axios response interceptor catches 401s, queues in-flight requests, calls `/auth/refresh`, then replays the queue. On hard failure, clears localStorage and redirects to login.

**Real-time messaging** — Socket.io handles `send_message`, `user_typing`, `mark_as_read`, `message_delivered`, and `messages_read` events. Typing indicators and read receipts update live without polling.

**Role-based routing** — `UserContext` exposes `isClient` and `isFreelancer` flags derived from the `/auth/me` response. The router uses these to gate access to client and freelancer page trees.

**Theming** — CSS custom properties (`--color-background`, `--color-primary`, etc.) are toggled by a class on the root element. `ThemeContext` reads `localStorage` and `prefers-color-scheme` on init.
