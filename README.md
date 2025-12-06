# ReplyRobot

Automated review response system for Google Business Profile. ReplyRobot helps businesses automatically generate and manage responses to Google reviews with AI-powered suggestions.

## Features

- Google OAuth login with business.manage scope
- Stripe Checkout with three monthly plans (Starter, Growth, Pro)
- Automated AI-powered reply generation using OpenAI GPT-4o-mini
- Dashboard for reviewing and approving generated responses
- Usage-based billing with overage charges
- Responsive UI with TailwindCSS

## Tech Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + Vite + TailwindCSS
- **Authentication**: Passport.js with Google OAuth
- **Payments**: Stripe Checkout
- **AI**: OpenAI GPT-4o-mini
- **Database**: SQLite with Sequelize ORM
- **Deployment**: Vercel (monorepo setup)

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Google OAuth credentials
- Stripe account with API keys
- OpenAI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd replyrobot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Copy the `.env.example` file to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google Cloud Console
   - `STRIPE_SECRET` from your Stripe dashboard
   - `OPENAI_KEY` from your OpenAI account
   - `SESSION_SECRET` with a random string for session encryption

4. **Initialize the database**
   ```bash
   pnpm db:migrate
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   This will start both the backend server (port 3001) and frontend development server (port 3000).

6. **Build for production**
   ```bash
   pnpm build
   ```

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set the environment variables in Vercel project settings
4. Deploy!

The monorepo setup in `vercel.json` ensures that:
- `/api/*` routes are handled by the serverless functions
- All other routes serve the static React frontend

## Project Structure

```
replyrobot/
├── server/                 # Backend API
│   ├── index.js           # Entry point
│   ├── db.js              # Database setup
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication
│   │   ├── billing.js     # Stripe billing
│   │   ├── reviews.js     # Reviews management
│   │   └── webhook.js     # Stripe webhook
│   └── config.js          # Configuration
├── client/                # Frontend React app
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   ├── pages/         # Page components
│   │   └── components/    # Reusable components
│   └── index.html         # HTML template
├── .env.example           # Environment variables template
├── package.json           # Root package.json with pnpm workspaces
└── vercel.json            # Vercel deployment configuration
```

## How It Works

1. Users sign in with Google OAuth (business.manage scope)
2. Users select a subscription plan and complete payment via Stripe
3. After payment, users connect their Google Business Profile and select locations
4. A background cron job runs every 10 minutes to:
   - Fetch new reviews via Google MyBusiness API
   - Store reviews in SQLite database
   - Generate AI-powered replies using OpenAI GPT-4o-mini
5. Users review pending responses in the dashboard and approve/reject them
6. Approved responses are published back to Google via the API
7. Stripe webhook handles `invoice.payment_succeeded` events to reset usage counters

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.