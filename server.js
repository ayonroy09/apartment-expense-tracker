import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'apartment_tracker.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  const createMembersTable = `
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      passcode TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members (id)
    )
  `;

  const createMealsTable = `
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members (id),
      UNIQUE(member_id, date)
    )
  `;

  // Clean up any potential duplicates and insert/update members
  const cleanupDuplicates = `
    DELETE FROM members WHERE id NOT IN (
      SELECT MIN(id) FROM members GROUP BY name
    )
  `;
  
  const insertInitialMembers = `
    INSERT OR REPLACE INTO members (id, name, passcode) VALUES
    (1, 'S.M Kayes Zaman', 'Kayes2024!'),
    (2, 'Arafat Zaman', 'Arafat2024@'),
    (3, 'Ayon Roy', 'Ayon2024#'),
    (4, 'Rashed Khan', 'Rashed2024$'),
    (5, 'Protik Sarker Opu', 'Protik2024%')
  `;

  db.serialize(() => {
    db.run(createMembersTable);
    db.run(createExpensesTable);
    db.run(createMealsTable);
    db.run(cleanupDuplicates);
    db.run(insertInitialMembers);
  });
}

// Authentication middleware
function authenticateMember(req, res, next) {
  const { passcode } = req.body;
  
  if (!passcode) {
    return res.status(401).json({ error: 'Passcode required' });
  }

  db.get('SELECT * FROM members WHERE passcode = ?', [passcode], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!member) {
      return res.status(401).json({ error: 'Invalid passcode' });
    }
    req.member = member;
    next();
  });
}

// Admin authentication
function authenticateAdmin(req, res, next) {
  const { passcode } = req.body || req.query;
  
  if (passcode !== 'Admin2024*') {
    return res.status(401).json({ error: 'Invalid admin passcode' });
  }
  next();
}

// API Routes

// Member login
app.post('/api/login', authenticateMember, (req, res) => {
  res.json({ 
    success: true, 
    member: {
      id: req.member.id,
      name: req.member.name
    }
  });
});

// Admin login
app.post('/api/admin/login', authenticateAdmin, (req, res) => {
  res.json({ success: true });
});

// Add expense
app.post('/api/expenses', authenticateMember, (req, res) => {
  const { amount, description, month, year } = req.body;
  
  if (!amount || !month || !year) {
    return res.status(400).json({ error: 'Amount, month, and year are required' });
  }

  const query = `
    INSERT INTO expenses (member_id, amount, description, month, year)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [req.member.id, amount, description || '', month, year], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add expense' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Add meal
app.post('/api/meals', authenticateMember, (req, res) => {
  const { date, count, month, year } = req.body;
  
  if (!date || !count || !month || !year) {
    return res.status(400).json({ error: 'Date, count, month, and year are required' });
  }

  const query = `
    INSERT OR REPLACE INTO meals (member_id, date, count, month, year)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [req.member.id, date, count, month, year], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to add meal' });
    }
    res.json({ success: true });
  });
});

// Get member data
app.post('/api/member/data', authenticateMember, (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const expenseQuery = `
    SELECT * FROM expenses 
    WHERE member_id = ? AND month = ? AND year = ?
    ORDER BY created_at DESC
  `;

  const mealQuery = `
    SELECT * FROM meals 
    WHERE member_id = ? AND month = ? AND year = ?
    ORDER BY date ASC
  `;

  db.all(expenseQuery, [req.member.id, month, year], (err, expenses) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }

    db.all(mealQuery, [req.member.id, month, year], (err, meals) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch meals' });
      }

      res.json({
        success: true,
        data: {
          expenses: expenses || [],
          meals: meals || []
        }
      });
    });
  });
});

// Get admin summary
app.post('/api/admin/summary', authenticateAdmin, (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const summaryQuery = `
    SELECT DISTINCT
      m.id,
      m.name,
      COALESCE(expense_totals.total_expenses, 0) as total_expenses,
      COALESCE(meal_totals.total_meals, 0) as total_meals
    FROM members m
    LEFT JOIN (
      SELECT member_id, SUM(amount) as total_expenses
      FROM expenses 
      WHERE month = ? AND year = ?
      GROUP BY member_id
    ) expense_totals ON m.id = expense_totals.member_id
    LEFT JOIN (
      SELECT member_id, SUM(count) as total_meals
      FROM meals 
      WHERE month = ? AND year = ?
      GROUP BY member_id
    ) meal_totals ON m.id = meal_totals.member_id
    ORDER BY m.id
  `;

  db.all(summaryQuery, [month, year, month, year], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }

    const totalExpenses = results.reduce((sum, member) => sum + member.total_expenses, 0);
    const totalMeals = results.reduce((sum, member) => sum + member.total_meals, 0);
    const costPerMeal = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    // Ensure no duplicates by using a Map with member ID as key
    const memberMap = new Map();
    results.forEach(member => {
      memberMap.set(member.id, {
        id: member.id,
        name: member.name,
        totalExpenses: member.total_expenses || 0,
        totalMeals: member.total_meals || 0,
        mealCost: (member.total_meals || 0) * costPerMeal,
        balance: (member.total_expenses || 0) - ((member.total_meals || 0) * costPerMeal)
      });
    });
    
    const memberSummaries = Array.from(memberMap.values()).sort((a, b) => a.id - b.id);

    res.json({
      success: true,
      data: {
        members: memberSummaries,
        totalExpenses,
        totalMeals,
        costPerMeal
      }
    });
  });
});

// Get all expenses for admin (detailed view)
app.post('/api/admin/expenses', authenticateAdmin, (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const expensesQuery = `
    SELECT 
      e.id,
      e.amount,
      e.description,
      e.created_at,
      m.name as member_name
    FROM expenses e
    JOIN members m ON e.member_id = m.id
    WHERE e.month = ? AND e.year = ?
    ORDER BY e.created_at DESC
  `;

  db.all(expensesQuery, [month, year], (err, expenses) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json({ success: true, data: expenses || [] });
  });
});

// Get all meals for admin (detailed view)
app.post('/api/admin/meals', authenticateAdmin, (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  const mealsQuery = `
    SELECT 
      meals.id,
      meals.date,
      meals.count,
      meals.created_at,
      m.name as member_name
    FROM meals
    JOIN members m ON meals.member_id = m.id
    WHERE meals.month = ? AND meals.year = ?
    ORDER BY meals.date DESC, meals.created_at DESC
  `;

  db.all(mealsQuery, [month, year], (err, meals) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }
    res.json({ success: true, data: meals || [] });
  });
});

// Delete meal (admin only)
app.delete('/api/admin/meals/:id', (req, res) => {
  const { passcode } = req.query;
  
  if (passcode !== 'Admin2024*') {
    return res.status(401).json({ error: 'Admin access required' });
  }

  const query = 'DELETE FROM meals WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete meal' });
    }
    res.json({ success: true });
  });
});

// Update meal (admin only)
app.put('/api/admin/meals/:id', (req, res) => {
  const { passcode, date, count } = req.body;
  
  if (passcode !== 'Admin2024*') {
    return res.status(401).json({ error: 'Admin access required' });
  }

  if (!date || !count) {
    return res.status(400).json({ error: 'Date and count are required' });
  }

  const query = 'UPDATE meals SET date = ?, count = ? WHERE id = ?';
  
  db.run(query, [date, count, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update meal' });
    }
    res.json({ success: true });
  });
});

// Get all months with data
app.get('/api/admin/months', (req, res) => {
  const query = `
    SELECT DISTINCT month, year 
    FROM (
      SELECT month, year FROM expenses
      UNION
      SELECT month, year FROM meals
    )
    ORDER BY year DESC, month DESC
  `;

  db.all(query, [], (err, months) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch months' });
    }
    res.json({ success: true, data: months || [] });
  });
});

// Delete expense (admin only)
app.delete('/api/admin/expenses/:id', (req, res) => {
  const { passcode } = req.query;
  
  if (passcode !== 'Admin2024*') {
    return res.status(401).json({ error: 'Admin access required' });
  }

  const query = 'DELETE FROM expenses WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
    res.json({ success: true });
  });
});

// Update expense (admin only)
app.put('/api/admin/expenses/:id', (req, res) => {
  const { passcode, amount, description } = req.body;
  
  if (passcode !== 'Admin2024*') {
    return res.status(401).json({ error: 'Admin access required' });
  }

  const query = 'UPDATE expenses SET amount = ?, description = ? WHERE id = ?';
  
  db.run(query, [amount, description, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update expense' });
    }
    res.json({ success: true });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});