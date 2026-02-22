# DentalGemma - AI Dental Diagnostics Platform

Multimodal dental AI diagnostic platform built with Next.js 16, featuring cloud-first architecture with GPU-accelerated inference via Modal.com.

## Features

- 🦷 **Dental Image Analysis** - AI-powered analysis of clinical photos and radiographs (OPG, bitewing, periapical) with PDF/JSON export
- 📋 **Clinical Case Assessment** - Comprehensive diagnostic reports with evidence-based recommendations
- 🎤 **Voice Consultation** - Hands-free consultation using the Web Speech API for recognition and synthesis, backed by the DentalGemma model on Modal.com
- 🤖 **Agentic Workflows** - Multi-agent diagnostic orchestration with automatic checkpoint persistence and session recovery
- 📍 **Dentist Finder** - Location-based specialist search with an interactive Leaflet map
- 📊 **Treatment Tracker** - Progress monitoring and milestone tracking
- 📚 **Research Dashboard** - PubMed integration for evidence-based practice
- 🎓 **Patient Education Portal** - Browsable library of dental conditions with a built-in anatomy explorer
- 🔍 **Symptom Checker** - AI-powered symptom analysis via the DentalGemma model
- 📱 **PWA Support** - Offline capabilities and app-like experience

## Tech Stack

- **Frontend**: Next.js 16.1, React 19.2, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **AI/ML**: Modal.com (DentalGemma 1.5 4B IT)
- **Map Integration**: Leaflet, Google Places API
- **Research API**: PubMed E-Utils
- **Testing Suite**: Jest, Fast-Check (Property-based Testing), React Testing Library
- **Deployment**: Vercel (frontend), Modal.com (backend)

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- API keys for Google Places and Modal.com

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your API keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing

The application includes a comprehensive test suite incorporating standard unit tests and advanced property-based testing.

- Run tests: `npm test`
- Run the interactive watcher: `npm run test:watch`
- Generate test coverage: `npm run test:coverage`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dentalgemma-app/
├── app/              # Next.js App Router pages
│   ├── (dashboard)/  # Core features (Image Analysis, Voice Consultation, Agentic Workflow, etc.)
│   └── api/          # API route handlers
├── components/       # React components
│   └── ui/           # shadcn/ui primitive components
├── lib/              # Utilities and API clients (Modal, PubMed, Places, etc.)
├── types/            # TypeScript type definitions
├── store/            # Zustand global state management
├── __tests__/        # Automated test suite (unit + property-based tests)
├── scripts/          # Backend deployment and endpoint test scripts
├── public/           # Static assets and PWA manifest
├── jest.config.js    # Jest test configuration
└── vercel.json       # Vercel deployment configuration
```

## Environment Variables

See `.env.local.example` for all required environment variables.

## Deployment

### Vercel (Frontend)

1. Connect your repository to Vercel
2. Add the required environment variables in the Vercel dashboard
3. Deploy

### Modal.com (Backend)

See `scripts/modal_dentalgemma.py` for backend deployment instructions. Ensure all required secrets are configured in Modal before deploying.

## License

This project is part of the DentalGemma challenge submission.

## Medical Disclaimer

This application is for educational and demonstration purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions regarding medical conditions.
