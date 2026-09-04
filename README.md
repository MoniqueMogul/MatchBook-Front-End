markdown
# MatchBook Frontend - Authentication & Form Components

## Overview
Frontend implementation of the MatchBook Authentication flow, built with React, TypeScript, and Zustand. 

## Tech Stack
- **Framework:** React.js (Vite)
- **Language:** TypeScript (TSX)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Form Handling:** React Hook Form
- **Validation:** Yup
- **Styling:** External CSS (BEM)

## Features
- **Reusable Form Components:** Input, PasswordInput, Button, OtpInput.
- **Form Validation:** Email, password strength, and password matching via Yup.
- **Interactive OTP UI:** Auto-focus, backspace logic, and a 27-second resend timer.
- **State Management:** Zustand store for managing user email and role.
- **Split-Screen Auth Layout:** Includes a 10% progress indicator.
- **Role Selection:** Interactive Buyer/Seller selection cards.

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
Start the development server:

bash
npm run dev
Open http://localhost:5173 in your browser.

Routes
Path	Component	Description
/	Signup	Email capture page.
/verify-email	VerifyEmail	OTP verification and password setup.
/role-selection	RoleSelection	Buyer/Seller role selection.
Backend Integration (Pending)
API integration is currently pending. Once the backend endpoints are provided, create a .env file in the root directory:

env
VITE_API_BASE_URL=https://api.your-backend-url.com
Author
Walusimbi Abaasi - AI Engineering Intern (Frontend Development)