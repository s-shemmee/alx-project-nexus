# Pollaroo 🗳️

A full-stack real-time polling application built with Next.js 15 and Django 5, featuring beautiful Catppuccin themes and modern UI components.

## ✨ Features

- 🗳️ **Create Polls**: Build polls with multiple options and settings
- ⚡ **Real-time Voting**: Live updates as votes come in
- 📊 **Beautiful Charts**: Bar and pie chart visualizations
- 🔗 **Easy Sharing**: Share polls with unique links
- 📱 **Mobile-First**: Responsive design for all devices
- 🔐 **Authentication**: Secure JWT-based auth system
- 🎨 **Dark Mode**: Catppuccin Mocha (default) with Latte light mode
- 📈 **Dashboard**: Manage your polls and view analytics
- 🌐 **Public Polls**: Discover and participate in community polls

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Custom UI Components** (Button, Card, Input, etc.)
- **Catppuccin Theme System** (Mocha/Latte)
- **Custom State Management** (React hooks)

### Backend
- **Django 5.x** with REST Framework
- **PostgreSQL** for data persistence
- **JWT Authentication** with SimpleJWT
- **CORS** for frontend integration
- **Custom User Model** with profile fields

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd pollaroo

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your database settings

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
pollaroo/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── dashboard/   # User dashboard
│   │   │   ├── poll/[id]/   # Poll voting page
│   │   │   └── polls/       # Public polls listing
│   │   ├── components/      # Reusable components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── poll/        # Poll-related components
│   │   │   └── ui/          # Base UI components
│   │   ├── lib/             # Utilities and API client
│   │   └── store/           # State management
│   ├── tailwind.config.ts   # Tailwind configuration
│   └── next.config.ts       # Next.js configuration
├── backend/                 # Django API
│   ├── pollaroo/           # Django project settings
│   ├── polls/              # Polls app
│   ├── users/              # User management app
│   └── requirements.txt     # Python dependencies
├── docker-compose.yml      # Development environment
└── README.md
```

## 🎨 Theme System

Pollaroo uses the beautiful Catppuccin color palette:

- **Mocha (Dark Mode)**: Default dark theme with warm colors
- **Latte (Light Mode)**: Clean light theme for daytime use
- **Violet Accent**: Primary accent color throughout the app

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get user profile
- `PUT /api/auth/me/update/` - Update user profile

### Polls
- `GET /api/polls/` - List public polls
- `POST /api/polls/create/` - Create new poll
- `GET /api/polls/{id}/` - Get poll details
- `PUT /api/polls/{id}/update/` - Update poll
- `DELETE /api/polls/{id}/delete/` - Delete poll
- `POST /api/polls/{id}/vote/` - Vote on poll
- `GET /api/polls/{id}/results/` - Get poll results
- `GET /api/polls/my-polls/` - Get user's polls

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```
SECRET_KEY=your-production-secret-key
DEBUG=False
DB_NAME=pollaroo_prod
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
REDIS_URL=redis://your-redis-host:6379/0
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Deployment Options

1. **Vercel** (Frontend) + **Railway/Render** (Backend)
2. **Docker** on any cloud provider
3. **Traditional VPS** with nginx + gunicorn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Catppuccin](https://github.com/catppuccin/catppuccin) for the beautiful color palette
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Django](https://djangoproject.com/) for the robust backend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework