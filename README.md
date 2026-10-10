# Prompt Studio

AI-powered prompt management platform for teams. Create, refine, save, and share prompts with your team.

## Features

- ✨ AI-powered prompt generation and refinement
- 💬 Interactive chat with AI assistant
- 📚 Prompt library with search and filtering
- 👥 Team collaboration and shared workspaces
- 📊 Usage analytics and insights
- 🔐 User authentication and permissions
- ⚡ Real-time prompt updates
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (local) / PostgreSQL (production)
- **AI**: OpenAI API
- **Auth**: JWT + bcryptjs
- **Styling**: CSS Grid & Flexbox with CSS Variables
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional for demo mode)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/omadhau22512-arch/ai-prompt-writer.git
   cd ai-prompt-writer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=your_jwt_secret_key_here
   DATABASE_URL=file:./data/promptstudio.db
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-prompt-writer/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── ai/
│   │   │   ├── chat/route.ts
│   │   │   ├── generate/route.ts
│   │   │   └── refine/route.ts
│   │   ├── prompts/
│   │   │   ├── route.ts
│   │   │   ├── details/route.ts
│   │   │   └── rate/route.ts
│   │   ├── teams/
│   │   │   ├── route.ts
│   │   │   └── add-member/route.ts
│   │   └── analytics/route.ts
│   ├── dashboard/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── dashboard-styles.css
├── components/
│   ├── Dashboard.tsx
│   ├── PromptEditor.tsx
│   ├── ChatWindow.tsx
│   ├── PromptLibrary.tsx
│   ├── TeamPanel.tsx
│   ├── AnalyticsPanel.tsx
│   └── LandingPage.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
├── .env.local.example
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Log in with email and password

### Prompts
- `GET /api/prompts` - Get all prompts for user
- `POST /api/prompts` - Create a new prompt
- `GET /api/prompts/details?id=<id>` - Get prompt details with analytics
- `PUT /api/prompts/details?id=<id>` - Update a prompt
- `POST /api/prompts/rate` - Rate a prompt

### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/generate` - Generate a prompt from an idea
- `POST /api/ai/refine` - Refine an existing prompt

### Teams
- `POST /api/teams` - Create a new team
- `GET /api/teams` - Get user's teams
- `POST /api/teams/add-member` - Invite a team member

### Analytics
- `GET /api/analytics` - Get usage analytics
- `POST /api/analytics` - Track an event

## Environment Variables

### Required
- `OPENAI_API_KEY` - Your OpenAI API key for prompt generation
- `JWT_SECRET` - Secret key for JWT token signing

### Optional
- `DATABASE_URL` - Database connection string (defaults to local SQLite)
- `NEXT_PUBLIC_API_URL` - Public API URL (for client-side requests)
- `NODE_ENV` - Environment (development/production)

## Deployment to Vercel

### 1. Push to GitHub

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select the `ai-prompt-writer` repository
5. Click "Import"

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Add Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update your DNS records as instructed

## Production Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure PostgreSQL database
- [ ] Set up secure JWT secret
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure CORS for your domain
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerts
- [ ] Test authentication flow
- [ ] Test AI prompt generation
- [ ] Verify team collaboration features
- [ ] Check analytics tracking

## Database Setup (PostgreSQL)

For production, use PostgreSQL instead of SQLite:

1. Create a database on your provider (e.g., Supabase, Railway, Render)
2. Update `DATABASE_URL` environment variable
3. Run migrations (included in the app)

## Performance Optimization

- Images are optimized with Next.js Image component
- CSS is minified and tree-shaken
- Code splitting enabled by default
- Static generation where possible
- API routes cached with appropriate headers

## Security

- Passwords hashed with bcryptjs
- JWTs for stateless authentication
- CORS configured for trusted domains
- SQL injection protection via parameterized queries
- XSS protection with React's built-in escaping
- CSRF protection (implement as needed)

## API Rate Limiting

Rate limits per user:
- Prompt generation: 100 requests/day
- Chat messages: 500 messages/day
- Team invites: 50 invites/day

## Error Handling

The app includes comprehensive error handling:
- Graceful fallbacks when API is unavailable
- User-friendly error messages
- Detailed server logs for debugging
- Error tracking integration ready

## Monitoring

Vercel provides built-in monitoring:
- Real-time logs
- Performance metrics
- Error tracking
- Analytics dashboard

Access in Vercel project → "Monitoring"

## Support & Troubleshooting

### Common Issues

**OpenAI API not working**
- Check API key is valid
- Verify account has credits
- Check rate limits

**Database connection failed**
- Verify DATABASE_URL is correct
- Check database is running
- Ensure network access is allowed

**Build fails on Vercel**
- Check Next.js build log
- Verify all environment variables are set
- Clear build cache and rebuild

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Prompt versioning and history
- [ ] Advanced analytics dashboard
- [ ] Prompt marketplace/templates
- [ ] API access for developers
- [ ] Webhook integrations
- [ ] Mobile app
- [ ] Enterprise SSO
- [ ] Advanced permissions/roles

## Contact

Questions or feedback? Open an issue on GitHub.

---

**Built with ❤️ for prompt engineers and AI teams**
