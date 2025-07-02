import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calculator, Calendar, DollarSign, Users, LogOut, Plus, Trash2, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, generateMonthOptions } from '../shared/types';
import { apiService } from './lib/api';

type User = {
  id: number;
  name: string;
  passcode: string;
};

type MemberData = {
  expenses: Array<{
    id: number;
    amount: number;
    description: string;
    created_at: string;
  }>;
  meals: Array<{
    id: number;
    date: string;
    count: number;
    created_at: string;
  }>;
};

type AdminData = {
  members: Array<{
    id: number;
    name: string;
    totalExpenses: number;
    totalMeals: number;
    mealCost: number;
    balance: number;
  }>;
  totalExpenses: number;
  totalMeals: number;
  costPerMeal: number;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Current month and year (fixed for members, selectable for admin)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Member dashboard state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealCount, setMealCount] = useState('1');
  const [memberData, setMemberData] = useState<MemberData | null>(null);

  // Admin dashboard state
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [adminExpenses, setAdminExpenses] = useState<Array<{
    id: number;
    amount: number;
    description: string;
    created_at: string;
    member_name: string;
  }> | null>(null);
  const [editingExpense, setEditingExpense] = useState<{id: number, amount: number, description: string} | null>(null);

  const monthOptions = generateMonthOptions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (loginPasscode === 'admin2024') {
        const result = await apiService.loginAdmin(loginPasscode);
        if (result.success) {
          setIsAdmin(true);
          setLoginPasscode('');
          await loadAdminData();
        } else {
          setError(result.error || 'Invalid admin passcode');
        }
      } else {
        const result = await apiService.loginMember(loginPasscode);
        if (result.success && result.member) {
          setCurrentUser({
            id: result.member.id,
            name: result.member.name,
            passcode: loginPasscode
          });
          setLoginPasscode('');
          await loadMemberData();
        } else {
          setError(result.error || 'Invalid passcode');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Members always use current month
      const result = await apiService.getMemberData(currentUser.passcode, selectedMonth, selectedYear);
      if (result.success && result.data) {
        setMemberData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const [summaryResult, expensesResult] = await Promise.all([
        apiService.getAdminSummary('admin2024', selectedMonth, selectedYear),
        apiService.getAdminExpenses('admin2024', selectedMonth, selectedYear)
      ]);
      
      if (summaryResult.success && summaryResult.data) {
        setAdminData(summaryResult.data);
      } else {
        setError(summaryResult.error || 'Failed to load admin data');
      }
      
      if (expensesResult.success && expensesResult.data) {
        setAdminExpenses(expensesResult.data);
      } else {
        setError(expensesResult.error || 'Failed to load expenses data');
      }
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !expenseAmount) return;

    setLoading(true);
    try {
      const result = await apiService.addExpense(
        currentUser.passcode,
        parseFloat(expenseAmount),
        expenseDescription,
        selectedMonth,
        selectedYear
      );
      
      if (result.success) {
        setExpenseAmount('');
        setExpenseDescription('');
        await loadMemberData();
      } else {
        setError(result.error || 'Failed to add expense');
      }
    } catch (err) {
      setError('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !mealDate || !mealCount) return;

    setLoading(true);
    try {
      const result = await apiService.addMeal(
        currentUser.passcode,
        mealDate,
        parseInt(mealCount),
        selectedMonth,
        selectedYear
      );
      
      if (result.success) {
        await loadMemberData();
      } else {
        setError(result.error || 'Failed to add meal');
      }
    } catch (err) {
      setError('Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setMemberData(null);
    setAdminData(null);
    setError(null);
    setEditingExpense(null);
  };

  const handleAdminMonthYearChange = async (value: string) => {
    const [month, year] = value.split('-').map(Number);
    setSelectedMonth(month);
    setSelectedYear(year);
    await loadAdminData();
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    setLoading(true);
    try {
      const result = await apiService.deleteExpense(expenseId, 'admin2024');
      if (result.success) {
        await loadAdminData();
      } else {
        setError(result.error || 'Failed to delete expense');
      }
    } catch (err) {
      setError('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (expenseId: number, amount: number, description: string) => {
    setLoading(true);
    try {
      const result = await apiService.updateExpense(expenseId, amount, description, 'admin2024');
      if (result.success) {
        setEditingExpense(null);
        await loadAdminData();
      } else {
        setError(result.error || 'Failed to update expense');
      }
    } catch (err) {
      setError('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  // Clear error when switching users
  useEffect(() => {
    setError(null);
  }, [currentUser, isAdmin]);

  // Load data on mount and when month/year changes for admin
  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else if (currentUser) {
      loadMemberData();
    }
  }, [selectedMonth, selectedYear]);

  // Login screen
  if (!currentUser && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              🏠 Apartment Expense Tracker
            </CardTitle>
            <CardDescription>
              Enter your passcode to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  placeholder="Enter your passcode"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Separator className="my-6" />
            
            <div className="text-center text-sm text-gray-600">
              <p>Contact your apartment administrator for access credentials.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Member dashboard
  if (currentUser && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Welcome, {currentUser.name}! 👋
                </CardTitle>
                <CardDescription>
                  Track your expenses and meals for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardHeader>
          </Card>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Expense */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  <DollarSign className="h-5 w-5 inline mr-2" />
                  Add Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (৳)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="What did you buy?"
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || !expenseAmount}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Add Meal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Log Daily Meal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMeal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">Meal Count</Label>
                    <Select value={mealCount} onValueChange={setMealCount} disabled={loading} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Meal</SelectItem>
                        <SelectItem value="2">2 Meals</SelectItem>
                        <SelectItem value="3">3 Meals</SelectItem>
                        <SelectItem value="4">4 Meals</SelectItem>
                        <SelectItem value="5">5 Meals</SelectItem>
                        <SelectItem value="6">6 Meals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Meal
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Current Month Summary */}
          {memberData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Your Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  {memberData.expenses.length > 0 ? (
                    <div className="space-y-3">
                      {memberData.expenses.map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{formatCurrency(expense.amount)}</p>
                            {expense.description && (
                              <p className="text-sm text-gray-600">{expense.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t">
                        <p className="font-semibold text-lg">
                          Total: {formatCurrency(memberData.expenses.reduce((sum, e) => sum + e.amount, 0))}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No expenses recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* Meals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Your Meals</CardTitle>
                </CardHeader>
                <CardContent>
                  {memberData.meals.length > 0 ? (
                    <div className="space-y-3">
                      {memberData.meals.map((meal) => (
                        <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{new Date(meal.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{meal.count} meal(s)</p>
                          </div>
                          <Badge variant="secondary">{meal.count}</Badge>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t">
                        <p className="font-semibold text-lg">
                          Total Meals: {memberData.meals.reduce((sum, m) => sum + m.count, 0)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No meals recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin dashboard
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Admin Dashboard 🏠
                </CardTitle>
                <CardDescription>
                  Manage apartment expenses and view monthly summaries
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardHeader>
          </Card>

          {/* Month/Year Selector - Admin Only */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                <Calendar className="h-5 w-5 inline mr-2" />
                Select Month & Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={`${selectedMonth}-${selectedYear}`} onValueChange={handleAdminMonthYearChange}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {adminData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(adminData.totalExpenses)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminData.totalMeals}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cost Per Meal</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(adminData.costPerMeal)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Member Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Member Summary</CardTitle>
                  <CardDescription>
                    Individual breakdown for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adminData.members.map((member) => (
                      <div key={member.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge 
                            variant={member.balance >= 0 ? "default" : "destructive"}
                            className="ml-2"
                          >
                            {member.balance >= 0 ? "Credit" : "Owes"} {formatCurrency(Math.abs(member.balance))}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Expenses:</span>
                            <p className="font-medium">{formatCurrency(member.totalExpenses)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Meals:</span>
                            <p className="font-medium">{member.totalMeals}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Meal Cost:</span>
                            <p className="font-medium">{formatCurrency(member.mealCost)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Balance:</span>
                            <p className={`font-medium ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {member.balance >= 0 ? '+' : ''}{formatCurrency(member.balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expense Management */}
              {adminExpenses && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Expense Management</CardTitle>
                    <CardDescription>
                      View, edit, and delete expenses for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {adminExpenses.length > 0 ? (
                      <div className="space-y-3">
                        {adminExpenses.map((expense) => (
                          <div key={expense.id} className="p-4 border rounded-lg">
                            {editingExpense?.id === expense.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label>Amount (৳)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editingExpense.amount}
                                      onChange={(e) => setEditingExpense({
                                        ...editingExpense,
                                        amount: parseFloat(e.target.value) || 0
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <Input
                                      value={editingExpense.description}
                                      onChange={(e) => setEditingExpense({
                                        ...editingExpense,
                                        description: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleUpdateExpense(expense.id, editingExpense.amount, editingExpense.description)}
                                    disabled={loading}
                                  >
                                    Save Changes
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setEditingExpense(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-lg">{formatCurrency(expense.amount)}</span>
                                    <Badge variant="outline">{expense.member_name}</Badge>
                                  </div>
                                  {expense.description && (
                                    <p className="text-gray-600 mb-1">{expense.description}</p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {new Date(expense.created_at).toLocaleDateString()} at {new Date(expense.created_at).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingExpense({
                                      id: expense.id,
                                      amount: expense.amount,
                                      description: expense.description
                                    })}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No expenses recorded for this month</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}