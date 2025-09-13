export interface Transaction {
    id: string;
    amount: number;
    description: string;
    category: string;
    date: Date;
    type: "income" | "expense";
    smsContent?: string;
    advice?: string;
}

export interface Goal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    category: string;
    isCompleted: boolean;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    type: "login_streak" | "savings" | "spending";
    target: number;
    current: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
    icon: string;
}

export interface LoginStreak {
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: string;
    totalLogins: number;
    monthlyLogins: { [key: string]: boolean }; // YYYY-MM-DD format
}

export interface PlantHealth {
    level: number; // 0-100
    stage: "seed" | "sprout" | "sapling" | "tree" | "wilting" | "dead";
    lastUpdated: string;
    goodHabits: number;
    badHabits: number;
}

export interface BudgetState {
    transactions: Transaction[];
    goals: Goal[];
    achievements: Achievement[];
    loginStreak: LoginStreak;
    plantHealth: PlantHealth;
    monthlyBudget: number;
    isLoading: boolean;
}
