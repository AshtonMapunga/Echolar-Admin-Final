# QuickPro Solutions - Company Registration Chatbot

A WhatsApp chatbot built with Node.js and Twilio for automating company registration processes in Zimbabwe.

## 🌟 Features

- **Interactive WhatsApp Integration**: Seamless conversation flow through WhatsApp
- **Complete Registration Process**: Collects all necessary information for company registration
- **Multiple Business Types**: Supports Pvt Ltd, Public Ltd, Partnership, Sole Proprietorship, Trust, and NPO
- **Data Validation**: Input validation for emails, phone numbers, and ID numbers
- **Admin Dashboard**: API endpoints for managing registrations
- **Database Storage**: MongoDB integration for persistent data storage
- **Session Management**: Handles multiple concurrent user sessions

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Twilio Account with WhatsApp sandbox or approved number
- ngrok (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickpro-company-registration-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Configure your .env file**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   MONGODB_URI=mongodb://localhost:27017/company_registration
   PORT=3000
   ```

5. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Twilio Configuration

### 1. WhatsApp Sandbox Setup (Development)

1. Log into your [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow the instructions to join your sandbox
4. Set your webhook URL: `https://your-ngrok-url.com/webhook`

### 2. Production WhatsApp Number

1. Request WhatsApp Business API access from Twilio
2. Get your number approved
3. Configure webhook URL: `https://your-domain.com/webhook`

### 3. Webhook Configuration

```javascript
// Your webhook URL should be accessible publicly
POST https://your-domain.com/webhook

// For local development with ngrok:
POST https://abc123.ngrok.io/webhook
```

## 📱 User Flow

1. **Welcome**: User sends any message to start
2. **Start Process**: User replies with "START"
3. **Company Name**: Enter desired company name
4. **Business Type**: Select from 6 business types
5. **Director Info**: Provide main director details
6. **Share Capital**: Enter share capital amount
7. **Addresses**: Business and director addresses
8. **Contact Info**: Email address
9. **Additional Directors**: Optional additional directors
10. **Business Description**: Brief description of business
11. **Review**: Review all information
12. **Confirmation**: Submit application

## 🛠 API Endpoints

### Registration Management

```bash
# Get all registrations
GET /api/registrations

# Get specific registration
GET /api/registrations/:id

# Update registration status
PATCH /api/registrations/:id/status
{
  "status": "approved" | "pending" | "rejected"
}

# Health check
GET /health
```

### Example API