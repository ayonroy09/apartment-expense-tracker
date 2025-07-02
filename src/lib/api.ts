const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

export interface LoginResponse {
  success: boolean;
  member?: {
    id: number;
    name: string;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MemberData {
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
}

export interface AdminSummary {
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
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async loginMember(passcode: string): Promise<LoginResponse> {
    return this.request<{ member: { id: number; name: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    });
  }

  async loginAdmin(passcode: string): Promise<ApiResponse> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    });
  }

  async addExpense(
    passcode: string,
    amount: number,
    description: string,
    month: number,
    year: number
  ): Promise<ApiResponse> {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify({ passcode, amount, description, month, year }),
    });
  }

  async addMeal(
    passcode: string,
    date: string,
    count: number,
    month: number,
    year: number
  ): Promise<ApiResponse> {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify({ passcode, date, count, month, year }),
    });
  }

  async getMemberData(passcode: string, month: number, year: number): Promise<ApiResponse<MemberData>> {
    return this.request<MemberData>('/member/data', {
      method: 'POST',
      body: JSON.stringify({ passcode, month, year }),
    });
  }

  async getAdminSummary(passcode: string, month: number, year: number): Promise<ApiResponse<AdminSummary>> {
    return this.request<AdminSummary>('/admin/summary', {
      method: 'POST',
      body: JSON.stringify({ passcode, month, year }),
    });
  }

  async getAdminExpenses(passcode: string, month: number, year: number): Promise<ApiResponse<Array<{
    id: number;
    amount: number;
    description: string;
    created_at: string;
    member_name: string;
  }>>> {
    return this.request('/admin/expenses', {
      method: 'POST',
      body: JSON.stringify({ passcode, month, year }),
    });
  }

  async getAvailableMonths(): Promise<ApiResponse<Array<{ month: number; year: number }>>> {
    return this.request<Array<{ month: number; year: number }>>('/admin/months');
  }

  async deleteExpense(expenseId: number, adminPasscode: string): Promise<ApiResponse> {
    return this.request(`/admin/expenses/${expenseId}?passcode=${adminPasscode}`, {
      method: 'DELETE',
    });
  }

  async updateExpense(
    expenseId: number,
    amount: number,
    description: string,
    adminPasscode: string
  ): Promise<ApiResponse> {
    return this.request(`/admin/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify({ passcode: adminPasscode, amount, description }),
    });
  }
}

export const apiService = new ApiService();