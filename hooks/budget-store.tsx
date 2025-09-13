import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import {
    Transaction,
    Goal,
    Achievement,
    LoginStreak,
    BudgetState,
    PlantHealth,
} from "@/types/budget";
import { generateSpendingAdvice } from "@/utils/ai-advice";
import { initializeAchievements } from "@/utils/achievements";

export const [BudgetProvider, useBudget] = createContextHook(() => {
    const [state, setState] = useState<BudgetState>({
        transactions: [],
        goals: [],
        achievements: [],
        loginStreak: {
            currentStreak: 0,
            longestStreak: 0,
            lastLoginDate: "",
            totalLogins: 0,
            monthlyLogins: {},
        },
        plantHealth: {
            level: 50,
            stage: "seed" as const,
            lastUpdated: "",
            goodHabits: 0,
            badHabits: 0,
        },
        monthlyBudget: 3000,
        isLoading: true,
    });

    // Load data from storage
    const dataQuery = useQuery({
        queryKey: ["budget-data"],
        queryFn: async () => {
            return {
                transactions: [],
                goals: [],
                achievements: initializeAchievements(),
                loginStreak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastLoginDate: "",
                    totalLogins: 0,
                    monthlyLogins: {},
                },
                plantHealth: {
                    level: 50,
                    stage: "seed" as const,
                    lastUpdated: "",
                    goodHabits: 0,
                    badHabits: 0,
                },
                monthlyBudget: 3000,
            };
        },
    });

    // Save data mutations
    const { mutate: saveTransactions } = useMutation({
        mutationFn: async (transactions: Transaction[]) => {
            if (!Array.isArray(transactions)) return [];
            console.log("Saving transactions:", transactions.length);
            return transactions;
        },
    });

    const { mutate: saveGoals } = useMutation({
        mutationFn: async (goals: Goal[]) => {
            if (!Array.isArray(goals)) return [];
            console.log("Saving goals:", goals.length);
            return goals;
        },
    });

    const { mutate: saveAchievements } = useMutation({
        mutationFn: async (achievements: Achievement[]) => {
            if (!Array.isArray(achievements)) return [];
            console.log("Saving achievements:", achievements.length);
            return achievements;
        },
    });

    const { mutate: saveLoginStreak } = useMutation({
        mutationFn: async (loginStreak: LoginStreak) => {
            if (!loginStreak || typeof loginStreak !== "object")
                return {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastLoginDate: "",
                    totalLogins: 0,
                    monthlyLogins: {},
                };
            console.log("Saving login streak:", loginStreak);
            return loginStreak;
        },
    });

    const { mutate: savePlantHealth } = useMutation({
        mutationFn: async (plantHealth: PlantHealth) => {
            if (!plantHealth || typeof plantHealth !== "object")
                return {
                    level: 50,
                    stage: "seed" as const,
                    lastUpdated: "",
                    goodHabits: 0,
                    badHabits: 0,
                };
            console.log("Saving plant health:", plantHealth);
            return plantHealth;
        },
    });

    // Update state when data loads
    useEffect(() => {
        if (dataQuery.data) {
            setState((prev) => ({
                ...prev,
                ...dataQuery.data,
                isLoading: false,
            }));
        }
    }, [dataQuery.data]);

    const getMonthlySpending = useCallback(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return state.transactions
            .filter(
                (t) => t.type === "expense" && new Date(t.date) >= startOfMonth
            )
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }, [state.transactions]);

    const getMonthlyIncome = useCallback(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return state.transactions
            .filter(
                (t) => t.type === "income" && new Date(t.date) >= startOfMonth
            )
            .reduce((sum, t) => sum + t.amount, 0);
    }, [state.transactions]);

    const getCurrentBalance = useCallback(() => {
        return state.transactions.reduce((balance, transaction) => {
            return transaction.type === "income"
                ? balance + transaction.amount
                : balance - Math.abs(transaction.amount);
        }, 0);
    }, [state.transactions]);

    const updatePlantHealth = useCallback(
        (type: "good" | "bad", reason: string) => {
            const currentPlant = state.plantHealth;
            let newLevel = currentPlant.level;
            let newGoodHabits = currentPlant.goodHabits;
            let newBadHabits = currentPlant.badHabits;

            if (type === "good") {
                newLevel = Math.min(100, newLevel + 5);
                newGoodHabits += 1;
            } else {
                newLevel = Math.max(0, newLevel - 10);
                newBadHabits += 1;
            }

            // Determine plant stage based on level
            let newStage: PlantHealth["stage"] = "seed";
            if (newLevel >= 80) newStage = "tree";
            else if (newLevel >= 60) newStage = "sapling";
            else if (newLevel >= 40) newStage = "sprout";
            else if (newLevel >= 20) newStage = "seed";
            else if (newLevel >= 10) newStage = "wilting";
            else newStage = "dead";

            const updatedPlant: PlantHealth = {
                level: newLevel,
                stage: newStage,
                lastUpdated: new Date().toISOString(),
                goodHabits: newGoodHabits,
                badHabits: newBadHabits,
            };

            setState((prev) => ({ ...prev, plantHealth: updatedPlant }));
            savePlantHealth(updatedPlant);

            console.log(
                `Plant health updated: ${type} habit (${reason}) - Level: ${newLevel}`
            );
        },
        [state.plantHealth, savePlantHealth]
    );

    const checkStreakAchievements = useCallback(
        (streak: number) => {
            const streakTargets = [3, 5, 7, 14, 30];
            const updatedAchievements = [...state.achievements];
            let hasNewAchievement = false;

            streakTargets.forEach((target) => {
                const achievement = updatedAchievements.find(
                    (a) => a.type === "login_streak" && a.target === target
                );

                if (
                    achievement &&
                    !achievement.isUnlocked &&
                    streak >= target
                ) {
                    achievement.isUnlocked = true;
                    achievement.current = streak;
                    achievement.unlockedAt = new Date();
                    hasNewAchievement = true;
                }
            });

            if (hasNewAchievement) {
                setState((prev) => ({
                    ...prev,
                    achievements: updatedAchievements,
                }));
                saveAchievements(updatedAchievements);
            }
        },
        [state.achievements, saveAchievements]
    );

    const checkDailyLogin = useCallback(() => {
        const today = new Date().toDateString();
        const todayKey = new Date().toISOString().split("T")[0];
        const lastLogin = state.loginStreak.lastLoginDate;

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let newStreak = 1;
            if (lastLogin === yesterday.toDateString()) {
                newStreak = state.loginStreak.currentStreak + 1;
            }

            const updatedMonthlyLogins = {
                ...state.loginStreak.monthlyLogins,
                [todayKey]: true,
            };

            const updatedStreak: LoginStreak = {
                currentStreak: newStreak,
                longestStreak: Math.max(
                    newStreak,
                    state.loginStreak.longestStreak
                ),
                lastLoginDate: today,
                totalLogins: state.loginStreak.totalLogins + 1,
                monthlyLogins: updatedMonthlyLogins,
            };

            setState((prev) => ({ ...prev, loginStreak: updatedStreak }));
            saveLoginStreak(updatedStreak);

            // Update plant health for daily login (good habit)
            updatePlantHealth("good", "Daily login");

            // Check for streak achievements
            checkStreakAchievements(newStreak);
        }
    }, [
        state.loginStreak,
        saveLoginStreak,
        updatePlantHealth,
        checkStreakAchievements,
    ]);

    // Check daily login
    useEffect(() => {
        if (!dataQuery.isLoading && dataQuery.data) {
            checkDailyLogin();
        }
    }, [dataQuery.isLoading, dataQuery.data, checkDailyLogin]);

    const addTransaction = useCallback(
        async (transaction: Omit<Transaction, "id" | "advice">) => {
            const newTransaction: Transaction = {
                ...transaction,
                id: Date.now().toString(),
                date: new Date(transaction.date),
            };

            // Generate AI advice for the transaction
            if (Platform.OS !== "web") {
                try {
                    const advice = await generateSpendingAdvice(
                        newTransaction,
                        state.transactions
                    );
                    newTransaction.advice = advice;
                } catch (error) {
                    console.log("Failed to generate advice:", error);
                }
            }

            // Update plant health based on transaction
            if (newTransaction.type === "expense") {
                const monthlySpending =
                    getMonthlySpending() + Math.abs(newTransaction.amount);
                if (monthlySpending > state.monthlyBudget) {
                    updatePlantHealth("bad", "Exceeded monthly budget");
                } else if (Math.abs(newTransaction.amount) > 100) {
                    updatePlantHealth("bad", "Large expense");
                }
            } else {
                updatePlantHealth("good", "Income received");
            }

            const updatedTransactions = [newTransaction, ...state.transactions];
            setState((prev) => ({
                ...prev,
                transactions: updatedTransactions,
            }));
            saveTransactions(updatedTransactions);
        },
        [
            state.transactions,
            state.monthlyBudget,
            getMonthlySpending,
            updatePlantHealth,
            saveTransactions,
        ]
    );

    const addGoal = useCallback(
        (goal: Omit<Goal, "id">) => {
            const newGoal: Goal = {
                ...goal,
                id: Date.now().toString(),
                deadline: new Date(goal.deadline),
            };

            const updatedGoals = [...state.goals, newGoal];
            setState((prev) => ({ ...prev, goals: updatedGoals }));
            saveGoals(updatedGoals);
        },
        [state.goals, saveGoals]
    );

    const updateGoal = useCallback(
        (goalId: string, updates: Partial<Goal>) => {
            const updatedGoals = state.goals.map((goal) =>
                goal.id === goalId ? { ...goal, ...updates } : goal
            );
            setState((prev) => ({ ...prev, goals: updatedGoals }));
            saveGoals(updatedGoals);
        },
        [state.goals, saveGoals]
    );

    const updateMonthlyBudget = useCallback((newBudget: number) => {
        setState((prev) => ({ ...prev, monthlyBudget: newBudget }));
        console.log("Updated monthly budget to:", newBudget);
    }, []);

    return useMemo(
        () => ({
            ...state,
            addTransaction,
            addGoal,
            updateGoal,
            updatePlantHealth,
            updateMonthlyBudget,
            getMonthlySpending,
            getMonthlyIncome,
            getCurrentBalance,
            isLoading: dataQuery.isLoading,
        }),
        [
            state,
            addTransaction,
            addGoal,
            updateGoal,
            updatePlantHealth,
            updateMonthlyBudget,
            getMonthlySpending,
            getMonthlyIncome,
            getCurrentBalance,
            dataQuery.isLoading,
        ]
    );
});
