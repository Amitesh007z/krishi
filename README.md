# 🌾 KrishiAI - Punjab Agricultural Intelligence System

**Real-time AI-powered Agricultural Decision Support System for Punjab State**

Built for **Capital One Hackathon** - Exploring and Building Agentic AI Solutions for Agriculture

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-green?style=for-the-badge)](https://krishiai-latest.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

## 🌐 **Live Application**

**🎉 Your KrishiAI application is now live and accessible to everyone!**

**🔗 Live URL**: [https://krishiai-latest.onrender.com](https://krishiai-latest.onrender.com)

**✅ Status**: Deployed and Running on Render

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🚀 Key Features](#-key-features)
- [🏗️ Technical Architecture](#️-technical-architecture)
- [📊 Data Sources](#-data-sources)
- [🚀 Quick Start](#-quick-start)
- [🌐 Live Deployment](#-live-deployment)
- [🎯 Usage Guide](#-usage-guide)
- [🌍 Punjab Focus](#-punjab-focus)
- [🔧 API Integration](#-api-integration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 **Project Overview**

KrishiAI is a comprehensive, real-time agricultural intelligence system specifically designed for **Punjab State, India**. It integrates live data from government APIs, weather services, and agricultural databases to provide farmers with data-driven insights for better decision-making.

### **Core Components**
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Python Flask API with ML models
- **AI Engine**: Local LLM integration with Llama.cpp
- **Database**: Supabase for real-time data
- **Containerization**: Docker and Docker Compose

## 🚀 **Key Features**

### **1. Real-Time Market Intelligence**
- **Live Mandi Prices** from Government of India's Agricultural Market Information System (AMIS)
- **Price Forecasting** using historical data and market trends
- **Punjab-specific Data** for all major agricultural markets
- **Real-time Updates** every 15 minutes

### **2. AI-Powered Storage Optimization**
- **Punjab State Warehousing Corporation (PSWC)** integration
- **Real Storage Costs** and availability data
- **AI Recommendations** for optimal storage timing
- **Cost-benefit Analysis** for storage vs. immediate sale

### **3. Cooperative Selling Platform**
- **Farmer Matching** based on crop type and location
- **Bulk Selling** facilitation for better prices
- **Real-time Group Formation** and management
- **Market Access** to larger buyers

### **4. Live Weather & Climate Intelligence**
- **OpenWeather API** integration for real-time weather data
- **Agricultural Impact Analysis** based on weather conditions
- **5-Day Forecasts** with crop-specific recommendations
- **Weather Alerts** for critical farming decisions

### **5. Advanced AI Insights Engine**
- **Multi-factor Analysis** combining market, weather, and storage data
- **Seasonal Pattern Recognition** for Punjab crops
- **Risk Assessment** and mitigation strategies
- **Confidence Scoring** for all recommendations

### **6. Voice-First Interface**
- **Multi-language Support** (English, Hindi, Punjabi)
- **Voice Commands** for hands-free operation
- **Natural Language Processing** for intuitive interaction
- **Accessibility** for low-literacy users

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Next.js 14** with App Router
- **React 18** with modern hooks
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **Chart.js** for data visualization

### **Backend Stack**
- **Python Flask** API server
- **XGBoost** ML models for price prediction
- **Pandas & NumPy** for data processing
- **Scikit-learn** for ML utilities

### **AI & ML Components**
- **Local LLM**: Llama.cpp server with Llama-2-7B model
- **Custom AI Engine** for agricultural recommendations
- **Real-time Data Processing** and analysis
- **Machine Learning Models** for price forecasting

### **Infrastructure**
- **Docker** containerization
- **Docker Compose** for multi-service orchestration
- **Supabase** for database and authentication
- **Real-time APIs** integration

## 📊 **Data Sources**

### **Government APIs**
- **Agricultural Market Information System (AMIS)** - Live mandi prices
- **Data.gov.in** - Government open data
- **Punjab State Warehousing Corporation** - Storage facilities

### **Weather Services**
- **OpenWeather API** - Real-time weather data
- **Agricultural Weather Impact** analysis

### **Agricultural Knowledge Base**
- **Crop Database** with Punjab-specific information
- **Seasonal Patterns** for major crops
- **Market Dynamics** and price trends

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Python 3.8+
- Docker and Docker Compose
- Valid API keys for external services

### **Local Development Setup**

1. **Clone the repository**
```bash
git clone <repository-url>
cd agri
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
```

4. **Add your API keys to `.env`**
```env
# Get your free API key from: https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE

# Get your API key from: https://data.gov.in/
NEXT_PUBLIC_DATA_GOV_API_KEY=YOUR_DATA_GOV_API_KEY_HERE

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 **Live Deployment**

### **🎉 Successfully Deployed on Render!**

Your KrishiAI application is now live and accessible to users worldwide at:

**🔗 Live URL**: [https://krishiai-latest.onrender.com](https://krishiai-latest.onrender.com)

### **Deployment Details**
- **Platform**: Render (Web Service)
- **Container**: Docker-based deployment
- **Status**: ✅ Active and Running
- **Performance**: Optimized for production use

### **Access Your Application**
1. **Visit**: [https://krishiai-latest.onrender.com](https://krishiai-latest.onrender.com)
2. **Test all features** including voice assistant
3. **Share the URL** with farmers and stakeholders
4. **Monitor usage** through Render dashboard

### **Environment Variables (Production)**
The following environment variables are configured in production:
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_OPENWEATHER_API_KEY=configured
NEXT_PUBLIC_DATA_GOV_API_KEY=configured
NEXT_PUBLIC_SUPABASE_URL=configured
NEXT_PUBLIC_SUPABASE_ANON_KEY=configured
```

## 🎯 **Usage Guide**

### **1. Enter Your Details**
- **Location**: Must be a valid Punjab district (e.g., Ludhiana, Amritsar, Jalandhar)
- **Crop**: Select from major Punjab crops (Wheat, Rice, Cotton, Sugarcane, Pulses, Maize)
- **Quantity**: Enter your crop quantity in tons

### **2. Navigate Through Features**
- **Market Intelligence**: Live prices, trends, and forecasts
- **Storage Optimization**: Warehouse availability and costs
- **Cooperative Selling**: Group selling opportunities
- **Weather & Climate**: Real-time weather insights
- **AI Insights**: Comprehensive AI recommendations
- **Voice Interface**: Multi-language voice commands

### **3. Voice Commands**
- **"Show market prices"** - Switch to market tab
- **"Show storage options"** - Switch to storage tab
- **"Show weather forecast"** - Switch to weather tab
- **"Show AI insights"** - Switch to AI insights tab

## 🌍 **Punjab Focus**

### **Supported Districts**
- Amritsar, Barnala, Bathinda, Faridkot, Fatehgarh Sahib
- Ferozepur, Gurdaspur, Hoshiarpur, Jalandhar, Kapurthala
- Ludhiana, Mansa, Moga, Muktsar, Pathankot
- Patiala, Rupnagar, Sahibzada Ajit Singh Nagar, Sangrur, Shahid Bhagat Singh Nagar

### **Major Crops**
- **Wheat** - Rabi season (November-April)
- **Rice** - Kharif season (June-October)
- **Cotton** - Kharif season (June-October)
- **Sugarcane** - Year-round with peak in October-December
- **Pulses** - Both Kharif and Rabi seasons
- **Maize** - Kharif season (June-October)

## 🔧 **API Integration**

### **Real-time Data Sources**
- **Market Prices**: Government of India AMIS API
- **Weather Data**: OpenWeather API
- **Storage Facilities**: Punjab State Warehousing Corporation
- **Agricultural Data**: Custom AI engine with real-time inputs

### **Data Update Frequency**
- **Market Prices**: Every 15 minutes
- **Weather Data**: Every 30 minutes
- **Storage Availability**: Every hour
- **AI Recommendations**: Real-time based on latest data

## 🎉 **Hackathon Achievements**

### **Problem Statement Addressed**
- ✅ **Multi-modal Agentic Solution** for agricultural queries
- ✅ **Real-time Data Integration** from government sources
- ✅ **Local Language Support** for Indian farmers
- ✅ **Offline-Capable Design** with cached data
- ✅ **AI-powered Recommendations** based on real data
- ✅ **Voice-First Interface** for accessibility

### **Innovation Highlights**
- **Punjab State Focus** with real government data integration
- **Real-time Market Intelligence** from live APIs
- **AI-powered Decision Support** using actual agricultural data
- **Voice Interface** in multiple Indian languages
- **Comprehensive Agricultural Platform** for end-to-end decision making

## 🤝 **Contributing**

This project was built for the Capital One Hackathon. For contributions or questions:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Submit a pull request**

## 📄 **License**

MIT License - Built for educational and hackathon purposes

## 🙏 **Acknowledgments**

- **Capital One** for the hackathon opportunity
- **Government of India** for open data APIs
- **OpenWeather** for weather data services
- **Punjab State** for agricultural data and insights
- **Render** for hosting and deployment services

---

**🌾 Built with ❤️ for Indian Agriculture** 🇮🇳

**🚀 Live at**: [https://krishiai-latest.onrender.com](https://krishiai-latest.onrender.com)
