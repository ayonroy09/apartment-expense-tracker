export interface Member {
  id: string;
  name: string;
  passcode: string;
}

export interface Expense {
  id: string;
  memberId: string;
  amount: number;
  description: string;
  date: string;
  month: string; // YYYY-MM format
}

export interface MealEntry {
  id: string;
  memberId: string;
  date: string;
  mealCount: number;
  month: string; // YYYY-MM format
}

export interface MonthlyData {
  month: string;
  expenses: Expense[];
  meals: MealEntry[];
}

export interface MemberSummary {
  member: Member;
  totalExpenses: number;
  totalMeals: number;
  calculatedShare: number;
  balance: number; // positive means they should receive money, negative means they owe
}

export interface AppData {
  members: Member[];
  expenses: Expense[];
  meals: MealEntry[];
  adminPasscode: string;
  lastBackup?: string;
  version: string;
}

export const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "S.M Kayes Zaman", passcode: "Kayes2024!" },
  { id: "2", name: "Arafat Hossain", passcode: "Arafat2024@" },
  { id: "3", name: "Ayon Roy", passcode: "Ayon2024#" },
  { id: "4", name: "Rashed Khan", passcode: "Rashed2024$" },
  { id: "5", name: "Protik Sarker Opu", passcode: "Protik2024%" }
];

export const ADMIN_PASSCODE = "Admin2024*";

// Currency formatting for BDT
export const formatCurrency = (amount: number): string => {
  return `৳${amount.toFixed(2)}`;
};

// Generate month options for selector
export const generateMonthOptions = (): Array<{value: string, label: string}> => {
  const options: Array<{value: string, label: string}> = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Generate options for 3 years: previous year, current year, next year
  for (let year = currentYear + 1; year >= currentYear - 1; year--) { // Start from next year and go backwards
    for (let month = 12; month >= 1; month--) { // Start from December and go backwards
      const date = new Date(year, month - 1, 1);
      const value = `${month}-${year}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
  }
  
  return options; // Already in descending order (most recent first)
};