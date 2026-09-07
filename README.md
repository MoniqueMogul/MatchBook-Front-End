# MatchBook Frontend - Authentication & Form Components

This repository contains the frontend implementation of the **MatchBook** Authentication flow, built with **Next.js, React, and TypeScript**. The project has been successfully migrated from a Vite + React Router setup to the modern Next.js App Router structure.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (TSX)
- **State Management:** Zustand
- **Routing:** Next.js App Router (`/`, `/verify-email`, `/role-selection`)
- **Form Handling:** React Hook Form
- **Validation:** Yup (with @hookform/resolvers)
- **Styling:** External CSS (BEM Methodology)
- **API Client:** Axios (Pending Backend Integration)

## ✨ Key Features Implemented

- **Reusable Form Components:** Built generic `Input`, `PasswordInput`, `Button`, and `OtpInput` components that accept custom props, labels, and error states.
- **Real-time Form Validation:** Implemented strict email, password length, and password matching validation using `React Hook Form` and `Yup`.
- **Interactive OTP UI:** Custom `OtpInput` component with auto-focus, backspace handling, and a countdown timer for the "Resend" feature.
- **Dynamic State Management:** Leveraged `Zustand` to manage the user's email and selected role across multi-step navigation without prop drilling.
- **Responsive Layout:** Split-screen `AuthLayout` designed to match Figma specifications, including a dynamic 10% progress indicator.
- **Intuitive Role Selection:** Interactive cards with dedicated hover and selected states to determine Buyer vs. Seller onboarding paths.
- **Next.js App Router:** Built with the modern file-based routing system (`src/app/`).

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/abaasi888/matchbook--frontend]