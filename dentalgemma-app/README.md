# DentalGemma - AI Dental Diagnostics Platform

Multimodal dental AI diagnostic platform built with Next.js 16, featuring cloud-first architecture with GPU-accelerated inference via Modal.com.

## Features

- 🦷 **X-Ray Analysis Suite** - Cavity detection, OPG classification, tooth identification
- 📋 **Clinical Case Assessment** - Comprehensive diagnostic reports with evidence-based recommendations
- 🎤 **Voice Consultation** - Voice system (Web Speech API)
- 🤖 **Agentic Workflows** - Multi-agent diagnostic orchestration
- 📍 **Dentist Finder** - Location-based specialist search
- 📊 **Treatment Tracker** - Progress monitoring and milestone tracking
- 📚 **Research Dashboard** - PubMed integration for evidence-based practice
- 🎓 **Patient Education** - 98 dental conditions with interactive content
- 🔍 **Symptom Checker** - AI-powered urgency assessment
- 📱 **PWA Support** - Offline capabilities and app-like experience

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **AI/ML**: Vercel AI SDK 6, Modal.com (DentalGemma 1.5 4B IT)
- **APIs**: Google Places, PubMed E-Utils
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

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dentalgemma-app/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions and API clients
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── store/           # Zustand state management
├── __tests__/       # Automated testing suite
├── scripts/         # Utility scripts
├── public/          # Static assets and PWA files
├── jest.config.js   # Test configuration
└── vercel.json      # Vercel configuration
```

## Environment Variables

See `.env.local.example` for required environment variables.

## Deployment

### Vercel (Frontend)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Modal.com (Backend)

See `scripts/modal_dentalgemma.py` for backend deployment instructions.

## License

This project is part of the DentalGemma challenge submission.

## Medical Disclaimer

This application is for educational and demonstration purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions regarding medical conditions.
