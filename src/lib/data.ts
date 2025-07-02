import { AppData, Member, Expense, MealEntry, MemberSummary, INITIAL_MEMBERS, ADMIN_PASSCODE } from "../../shared/types";

const STORAGE_KEY = "apartment-tracker-data";

export class DataManager {
  private static instance: DataManager;
  private data: AppData;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private loadData(): AppData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    
    // Return initial data if nothing saved
    return {
      members: INITIAL_MEMBERS,
      expenses: [],
      meals: [],
      adminPasscode: ADMIN_PASSCODE,
      lastBackup: new Date().toISOString(),
      version: "1.0.0"
    };
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  // Member authentication
  public authenticateMember(passcode: string): Member | null {
    return this.data.members.find(member => member.passcode === passcode) || null;
  }

  public authenticateAdmin(passcode: string): boolean {
    return passcode === this.data.adminPasscode;
  }

  // Expense management
  public addExpense(memberId: string, amount: number, description: string): void {
    const now = new Date();
    const expense: Expense = {
      id: Date.now().toString(),
      memberId,
      amount,
      description,
      date: now.toISOString().split('T')[0],
      month: now.toISOString().slice(0, 7) // YYYY-MM
    };
    
    this.data.expenses.push(expense);
    this.saveData();
  }

  // Meal management
  public addMealEntry(memberId: string, mealCount: number, date?: string): void {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const month = targetDate.slice(0, 7); // YYYY-MM
    
    // Remove existing entry for the same member and date
    this.data.meals = this.data.meals.filter(
      meal => !(meal.memberId === memberId && meal.date === targetDate)
    );
    
    const mealEntry: MealEntry = {
      id: Date.now().toString(),
      memberId,
      date: targetDate,
      mealCount,
      month
    };
    
    this.data.meals.push(mealEntry);
    this.saveData();
  }

  // Data retrieval
  public getMembers(): Member[] {
    return this.data.members;
  }

  public getMemberById(id: string): Member | undefined {
    return this.data.members.find(member => member.id === id);
  }

  public getExpensesByMonth(month: string): Expense[] {
    return this.data.expenses.filter(expense => expense.month === month);
  }

  public getMealsByMonth(month: string): MealEntry[] {
    return this.data.meals.filter(meal => meal.month === month);
  }

  public getExpensesByMember(memberId: string, month?: string): Expense[] {
    return this.data.expenses.filter(expense => 
      expense.memberId === memberId && 
      (!month || expense.month === month)
    );
  }

  public getMealsByMember(memberId: string, month?: string): MealEntry[] {
    return this.data.meals.filter(meal => 
      meal.memberId === memberId && 
      (!month || meal.month === month)
    );
  }

  // Monthly summary calculations
  public getMonthlyMemberSummary(month: string): MemberSummary[] {
    const monthExpenses = this.getExpensesByMonth(month);
    const monthMeals = this.getMealsByMonth(month);
    
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalMeals = monthMeals.reduce((sum, meal) => sum + meal.mealCount, 0);
    
    const pricePerMeal = totalMeals > 0 ? totalExpenses / totalMeals : 0;
    
    return this.data.members.map(member => {
      const memberExpenses = monthExpenses
        .filter(expense => expense.memberId === member.id)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const memberMeals = monthMeals
        .filter(meal => meal.memberId === member.id)
        .reduce((sum, meal) => sum + meal.mealCount, 0);
      
      const calculatedShare = memberMeals * pricePerMeal;
      const balance = memberExpenses - calculatedShare;
      
      return {
        member,
        totalExpenses: memberExpenses,
        totalMeals: memberMeals,
        calculatedShare,
        balance
      };
    });
  }

  public getAllMonths(): string[] {
    const expenseMonths = this.data.expenses.map(expense => expense.month);
    const mealMonths = this.data.meals.map(meal => meal.month);
    const allMonths = [...new Set([...expenseMonths, ...mealMonths])];
    return allMonths.sort().reverse(); // Most recent first
  }

  // Utility methods
  public getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  public formatMonth(month: string): string {
    const date = new Date(month + "-01");
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
}