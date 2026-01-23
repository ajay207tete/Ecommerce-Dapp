# THRUSTER - Web3 E-Commerce dApp on TON

A cutting-edge decentralized marketplace built on the TON blockchain featuring cryptocurrency payments, NFT rewards, and token incentives.

## Features

### Core Functionality
- **E-Commerce Marketplace** - Browse and purchase physical products & services
- **Crypto Payments** - Accept TON and multiple cryptocurrencies via NOWPayments
- **NFT Rewards** - Earn exclusive NFTs with purchases
- **Token System** - THRUSTER token rewards for purchases and social tasks
- **Social Tasks** - Complete social media tasks to earn rewards
- **Telegram Mini App** - Full integration with Telegram Web App

### User Features
- TON wallet connection (TON Connect)
- Shopping cart with persistent state
- Secure checkout with shipping address
- Order tracking dashboard
- Reward center with social tasks
- NFT gallery
- Multi-currency payment options

### Admin Features
- Product & service management
- Order processing
- User management
- Payment verification
- Analytics dashboard

## Tech Stack

**Frontend:**
- React
- Tailwind CSS (Cyberpunk theme)
- TON Connect UI React
- Shadcn UI components
- React Router DOM
- Axios

**Backend:**
- FastAPI (Python)
- MongoDB (Motor async driver)
- JWT Authentication
- Bcrypt password hashing
- HTTPX async HTTP client

**Blockchain:**
- TON blockchain integration
- TON Connect protocol
- NFT minting (TEP-471 standard)
- Token smart contracts

**Payment Gateways:**
- TON native payments
- NOWPayments (BTC, ETH, USDC, etc.)

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB
- Yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd /app/backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `/app/backend/.env`:
```env
# Required
JWT_SECRET=your-super-secret-jwt-key
MONGO_URL=mongodb://localhost:27017
DB_NAME=thruster_db

# Optional - Add when ready
TELEGRAM_BOT_TOKEN=your_bot_token
NOWPAYMENTS_API_KEY=your_api_key
NOWPAYMENTS_IPN_SECRET=your_ipn_secret
TON_API_KEY=your_ton_api_key
DEPOSIT_WALLET_ADDRESS=your_ton_wallet
GETGEMS_API_KEY=your_getgems_key
```

4. Seed initial data:
```bash
python seed_data.py
```

5. The backend runs automatically via supervisor on port 8001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd /app/frontend
```

2. Install dependencies:
```bash
yarn install
```

3. The frontend runs automatically via supervisor on port 3000

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products & Services
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create product (admin)
- `GET /api/services` - List all services
- `POST /api/services` - Create service (admin)

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/{item_id}` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders

### Payments
- `POST /api/payments/create-ton` - Create TON payment
- `POST /api/payments/create-crypto` - Create crypto payment
- `GET /api/payments/{id}/status` - Check payment status
- `POST /api/webhooks/nowpayments` - Payment webhook

### Rewards & NFTs
- `GET /api/rewards` - Get user rewards
- `POST /api/rewards/claim` - Claim reward
- `GET /api/nfts` - List user NFTs
- `POST /api/nfts/mint` - Mint NFT
- `GET /api/tasks` - List social tasks
- `POST /api/tasks/complete` - Complete task

### Admin
- `GET /api/admin/stats` - Get admin statistics

## Configuration

### TON Wallet Integration
1. Create TON wallet or use existing
2. Add wallet address to backend `.env` as `DEPOSIT_WALLET_ADDRESS`
3. Users can connect their wallets via TON Connect button in navbar

### NOWPayments Setup
1. Register at [nowpayments.io](https://nowpayments.io)
2. Generate API key and IPN secret
3. Add keys to backend `.env`
4. Configure webhook URL in NOWPayments dashboard

### Telegram Bot Setup
1. Create bot via @BotFather on Telegram
2. Get bot token
3. Add token to backend `.env` as `TELEGRAM_BOT_TOKEN`
4. Set webhook URL to your backend

## Database Schema

### Collections
- `users` - User accounts and wallet addresses
- `products` - Product catalog
- `services` - Service offerings
- `orders` - Purchase orders
- `carts` - Shopping carts
- `payments` - Payment records
- `rewards` - User rewards
- `nfts` - NFT ownership records
- `social_tasks` - Social media tasks

## Security Features
- JWT-based authentication
- Bcrypt password hashing
- HMAC webhook signature verification
- CORS protection
- Input validation with Pydantic
- MongoDB ObjectId sanitization
- Environment variable protection

## Design System

### Colors
- Background: #030014 (Deep Space Black)
- Primary: #FF2E63 (Neon Pink)
- Secondary: #08D9D6 (Cyber Cyan)
- Muted: #1A1A2E
- Accent: #252A34

### Typography
- Headings: Orbitron (futuristic display font)
- Body: Rajdhani (technical sans-serif)
- Mono: JetBrains Mono

### Visual Effects
- Scanline overlay
- Noise texture
- Glassmorphism
- Neon glow effects
- Sharp angular design

## TON Integration Details

### Wallet Connection
- Uses TON Connect protocol
- Supports major TON wallets
- Manifest file: `/public/tonconnect-manifest.json`

### Payment Flow
1. User creates order
2. Backend generates payment address
3. User sends TON to address
4. Backend monitors blockchain
5. Payment confirmed automatically
6. Order status updated

### NFT Minting
- TEP-471 standard compliance
- GetGems marketplace compatible
- Metadata stored on IPFS
- On-chain ownership verification

## Deployment

### Environment Variables (Production)
Update `.env` files with production values:
- Change `JWT_SECRET` to secure random string
- Update `CORS_ORIGINS` to production domain
- Add real API keys for payment gateways
- Configure production MongoDB URL

### Supervisor Configuration
Services are managed by supervisor:
- Backend: `sudo supervisorctl restart backend`
- Frontend: `sudo supervisorctl restart frontend`
- Status: `sudo supervisorctl status`

## License
MIT

## Support
For issues and questions, please check the documentation or contact support.
