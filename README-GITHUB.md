# Apartment Expense Tracker

> Professional expense tracking app for shared apartments with SQLite database

## 🚀 Live Demo
[Deploy your own →](https://render.com/deploy)

## ⚡ One-Click Deploy

### Deploy to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Deploy to Cyclic
1. Fork this repository
2. Visit [cyclic.sh](https://cyclic.sh)
3. Connect your GitHub and select this repo

## 🏠 Features

- **5 Pre-configured Members** with individual passcodes
- **Expense Tracking** with BDT currency
- **Meal Logging** (1-3 meals per day)
- **Automatic Calculations** based on meal consumption
- **Admin Dashboard** for monthly summaries
- **SQLite Database** for persistent storage
- **Mobile Responsive** design

## 🔑 Default Passcodes

### Members
- **S.M Kayes Zaman**: `kayes2024`
- **Arafat Hossain**: `arafat2024`  
- **Ayon Roy**: `ayon2024`
- **Rashed Khan**: `rashed2024`
- **Protik Sarker Opu**: `protik2024`

### Admin
- **Administrator**: `admin2024`

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + TailwindCSS + ShadCN UI
- **Backend**: Express.js + SQLite
- **Build**: Vite + Bun

## 📱 Usage

1. **Members** log in with their passcode to add expenses and meals
2. **Admin** reviews monthly summaries and balances
3. **Settlements** based on meal consumption ratios

## 🚀 Local Development

```bash
# Install dependencies
bun install

# Start development server (frontend)
bun run dev

# Start backend server
bun run dev:server

# Build for production
bun run build

# Start production server
bun start
```

## 📊 How It Works

**Expense Splitting Logic:**
1. Total expenses from all members
2. Total meals consumed by everyone
3. Cost per meal = Total Expenses ÷ Total Meals
4. Each member pays: Their Meals × Cost per Meal
5. Balance = What they spent - What they owe

**Example:**
```
Total Expenses: ৳10,000
Total Meals: 100
Cost per Meal: ৳100

Member A: Spent ৳4,000, Ate 30 meals
Balance: ৳4,000 - (30 × ৳100) = +৳1,000 (Credit)
```

## 🌐 Deployment

See [FREE-HOSTING-GUIDE.md](FREE-HOSTING-GUIDE.md) for detailed deployment instructions to:
- ✅ **Render** (Recommended)
- ✅ **Cyclic** 
- ✅ **Glitch**
- ✅ **Vercel**

## 📄 License

MIT License - feel free to use for your apartment!

## 🤝 Contributing

This is designed for apartment use, but PRs welcome for improvements!

---

**Built for shared living 🏠💰**