# 🏠 Apartment Expense & Meal Tracker

A comprehensive web application for shared apartment expense tracking and meal consumption management with persistent database storage.

## ✨ Features

### 👥 Member Features
- **Individual Login**: Each member has a unique passcode
- **Expense Tracking**: Add grocery expenses with descriptions
- **Meal Logging**: Record daily meal consumption (1-3 meals per day)
- **Monthly History**: View expenses and meals by month/year
- **Personal Dashboard**: See your own expenses and meal records

### 🔐 Admin Features
- **Secure Admin Access**: Protected admin dashboard
- **Monthly Summaries**: Complete overview of all member activities
- **Financial Calculations**: Automatic expense splitting based on meal consumption
- **Balance Tracking**: See who owes money and who has credit
- **Historical Data**: Access all previous months' data
- **Data Management**: Edit/delete expenses when needed

### 🗄️ Database Features
- **Persistent Storage**: SQLite database stores all data permanently
- **Reliable Data**: No data loss between sessions
- **Multi-user Support**: Handles concurrent access from multiple users
- **Historical Records**: Keeps all previous months' data indefinitely

## 🔑 Access Credentials

### Member Passcodes
| Member Name | Passcode |
|-------------|----------|
| S.M Kayes Zaman | `Kayes2024!` |
| Arafat Zaman | `Arafat2024@` |
| Ayon Roy | `Ayon2024#` |
| Rashed Khan | `Rashed2024$` |
| Protik Sarker Opu | `Protik2024%` |

### Admin Access
| Role | Passcode |
|------|----------|
| Administrator | `admin2024` |

## 🚀 Quick Start

### For Users (After Deployment)
1. Visit the deployed website URL
2. Enter your passcode from the table above
3. Start adding expenses and logging meals
4. Use the month/year selector to view historical data

### For Self-Hosting
1. **Clone/Download** this project
2. **Install Dependencies**:
   ```bash
   bun install
   ```
3. **Start the Application**:
   ```bash
   bun start
   ```
4. **Access**: Open `http://localhost:5000` in your browser

## 💡 How It Works

### Expense Splitting Logic
1. **Total Pool**: All members' expenses are combined
2. **Meal-Based Division**: Costs are split based on meal consumption
3. **Fair Distribution**: Cost per meal = Total Expenses ÷ Total Meals
4. **Individual Calculation**: Each member pays (Their Meals × Cost per Meal)
5. **Balance Calculation**: Member Balance = Their Expenses - Their Meal Cost

### Example Calculation
```
Member A: Spent ৳2000, Ate 20 meals
Member B: Spent ৳1000, Ate 30 meals
Member C: Spent ৳500, Ate 10 meals

Total Expenses: ৳3500
Total Meals: 60
Cost per Meal: ৳3500 ÷ 60 = ৳58.33

Member A: ৳2000 - (20 × ৳58.33) = +৳833.40 (Credit)
Member B: ৳1000 - (30 × ৳58.33) = -৳750.00 (Owes)
Member C: ৳500 - (10 × ৳58.33) = -৳83.30 (Owes)
```

## 🏗️ Technical Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS v4** for modern styling
- **ShadCN UI** for professional components
- **Lucide Icons** for consistent iconography

### Backend
- **Express.js** API server
- **SQLite** database for data persistence
- **CORS** enabled for cross-origin requests
- **RESTful API** design

### Database Schema
```sql
-- Members table
CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  passcode TEXT NOT NULL
);

-- Expenses table
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  member_id INTEGER,
  amount REAL NOT NULL,
  description TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE meals (
  id INTEGER PRIMARY KEY,
  member_id INTEGER,
  date TEXT NOT NULL,
  count INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Deployment

This application can be deployed to various free hosting platforms:

### Recommended Platforms
1. **Railway** - Excellent Node.js support, automatic deployments
2. **Render** - Reliable hosting with good SQLite support
3. **Heroku** - Classic platform with good documentation
4. **Vercel** - Great for frontend, limited backend persistence

### Quick Deploy to Railway
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Railway auto-deploys with zero configuration
4. Your app is live!

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🛡️ Security Features

- **Passcode Authentication**: Each member and admin has unique access
- **Session Management**: Secure login/logout functionality
- **Data Isolation**: Members can only see their own data
- **Admin Controls**: Restricted admin functions with separate authentication
- **HTTPS Ready**: Works securely over HTTPS when deployed

## 📱 Mobile Friendly

- **Responsive Design**: Works perfectly on phones and tablets
- **Touch Optimized**: Large buttons and easy navigation
- **PWA Ready**: Can be added to home screen like a native app
- **Fast Loading**: Optimized for mobile networks

## 💾 Data Management

### Automatic Features
- **Auto-save**: All data is saved immediately to the database
- **Data Persistence**: No data loss between sessions or server restarts
- **Concurrent Access**: Multiple users can use the app simultaneously
- **Date Tracking**: Automatic timestamps for all entries

### Manual Features
- **Monthly Organization**: Data is organized by month and year
- **Historical Access**: View any previous month's data
- **Admin Controls**: Edit or delete entries when needed
- **Export Ready**: Database can be backed up or exported

## 🎯 Usage Tips

### For Members
- **Regular Logging**: Log meals daily for accurate calculations
- **Detailed Expenses**: Add descriptions to expenses for clarity
- **Check Monthly**: Review your balance regularly
- **Historical Review**: Use month selector to check previous periods

### For Admins
- **Monthly Reviews**: Check summaries at month-end for settlements
- **Data Verification**: Review unusual expenses or meal counts
- **Balance Settlement**: Use balance information for money transfers
- **Record Keeping**: Export or backup data periodically

## 🔧 Customization

### Adding New Members
1. Access the database
2. Add new member to the `members` table
3. Update the login screen to show new passcode

### Changing Passcodes
1. Update the `members` table in the database
2. Update the admin passcode in `server.js`
3. Inform members of new passcodes

### Modifying Calculations
Edit the calculation logic in `server.js` (admin summary endpoint) to change how expenses are split.

## 🚨 Troubleshooting

### Common Issues

**Can't Login**: Check that you're using the correct passcode from the table above.

**Data Not Saving**: Ensure the server is running and database is accessible.

**Month Not Showing**: Make sure you've selected the correct month/year.

**Balance Incorrect**: Verify all expenses and meals are logged correctly.

### Getting Help
1. Check the browser console for error messages
2. Verify server logs for backend issues
3. Ensure all dependencies are installed
4. Test with a fresh browser session

## 📊 Monthly Settlement Process

### Recommended Workflow
1. **Month End**: All members ensure their data is complete
2. **Admin Review**: Admin checks the monthly summary
3. **Verification**: Discuss any unusual entries with members
4. **Settlement**: Transfer money based on balance calculations
5. **Record**: Keep a record of settlements for reference

### Settlement Example
Based on the balance calculations:
- Members with positive balance receive money
- Members with negative balance pay money
- Net zero sum ensures fair distribution

## 🎉 Benefits

### For the Apartment
- **Transparency**: Everyone can see their own data
- **Fairness**: Expenses split based on actual consumption
- **Efficiency**: No more manual calculations or disputes
- **History**: Complete record of all expenses and settlements

### For Members
- **Convenience**: Easy mobile access from anywhere
- **Accuracy**: Automatic calculations eliminate errors
- **Privacy**: Only see your own detailed data
- **Flexibility**: Add expenses and meals anytime

---

## 📞 Support

This application is designed to be self-sufficient, but if you need help:
1. Check this README for common solutions
2. Review the DEPLOYMENT.md for hosting issues
3. Check the application logs for technical errors
4. Verify all passcodes are correct

---

**Enjoy tracking your shared apartment expenses! 🏠💰**