import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    Plus,
    Target,
    Calendar,
    TrendingUp,
    BarChart3,
} from "lucide-react-native";
import { useBudget } from "@/hooks/budget-store";

export default function GoalsScreen() {
    const { goals, addGoal, updateGoal, getCurrentBalance } = useBudget();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: "",
        targetAmount: "",
        category: "Savings",
        deadline: "",
    });

    const currentBalance = getCurrentBalance();
    const totalGoalsAmount = goals.reduce(
        (sum, goal) => sum + goal.targetAmount,
        0
    );
    const completedGoals = goals.filter((goal) => goal.isCompleted).length;

    const handleAddGoal = () => {
        if (
            !newGoal.title?.trim() ||
            !newGoal.targetAmount?.trim() ||
            !newGoal.deadline?.trim()
        ) {
            return;
        }

        const deadlineDate = new Date(newGoal.deadline);
        if (deadlineDate <= new Date()) {
            return;
        }

        addGoal({
            title: newGoal.title,
            targetAmount: parseFloat(newGoal.targetAmount),
            currentAmount: 0,
            deadline: deadlineDate,
            category: newGoal.category,
            isCompleted: false,
        });

        setNewGoal({
            title: "",
            targetAmount: "",
            category: "Savings",
            deadline: "",
        });
        setShowAddModal(false);
    };

    const updateGoalProgress = (goalId: string, amount: number) => {
        if (typeof amount !== "number" || isNaN(amount)) return;
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;

        const newAmount = Math.max(0, Math.min(goal.targetAmount, amount));
        const isCompleted = newAmount >= goal.targetAmount;

        updateGoal(goalId, {
            currentAmount: newAmount,
            isCompleted,
        });
    };

    const formatCurrency = (amount: number) => {
        if (typeof amount !== "number" || isNaN(amount)) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getDaysUntilDeadline = (deadline: Date) => {
        const now = new Date();
        const diffTime = new Date(deadline).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Your Goals</Text>
                    <Text style={styles.subtitle}>
                        Track your financial objectives
                    </Text>
                </View>

                {/* Goals Overview */}
                <LinearGradient
                    colors={["#10b981", "#059669"]}
                    style={styles.overviewCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.overviewStats}>
                        <View style={styles.overviewStat}>
                            <Text style={styles.overviewStatValue}>
                                {goals.length}
                            </Text>
                            <Text style={styles.overviewStatLabel}>
                                Total Goals
                            </Text>
                        </View>
                        <View style={styles.overviewStat}>
                            <Text style={styles.overviewStatValue}>
                                {completedGoals}
                            </Text>
                            <Text style={styles.overviewStatLabel}>
                                Completed
                            </Text>
                        </View>
                        <View style={styles.overviewStat}>
                            <Text style={styles.overviewStatValue}>
                                {formatCurrency(totalGoalsAmount)}
                            </Text>
                            <Text style={styles.overviewStatLabel}>
                                Target Amount
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Monthly Savings Goal */}
                <View style={styles.monthlySavingsCard}>
                    <View style={styles.monthlySavingsHeader}>
                        <TrendingUp color="#6366f1" size={24} />
                        <Text style={styles.monthlySavingsTitle}>
                            Monthly Savings Goal
                        </Text>
                    </View>
                    <Text style={styles.monthlySavingsAmount}>
                        {formatCurrency(Math.max(0, currentBalance))}
                    </Text>
                    <Text style={styles.monthlySavingsSubtext}>
                        Current balance available for goals
                    </Text>
                </View>

                {/* Stock Investment Suggestions */}
                <View style={styles.stockSuggestionsCard}>
                    <View style={styles.stockHeader}>
                        <BarChart3 color="#6366f1" size={24} />
                        <Text style={styles.stockTitle}>
                            Investment Suggestions
                        </Text>
                    </View>
                    <Text style={styles.stockSubtitle}>
                        Based on your savings goals and risk profile
                    </Text>

                    <View style={styles.stockSuggestion}>
                        <View style={styles.stockInfo}>
                            <Text style={styles.stockName}>
                                S&P 500 Index Fund
                            </Text>
                            <Text style={styles.stockDescription}>
                                Low-risk, diversified growth
                            </Text>
                        </View>
                        <View style={styles.stockMetrics}>
                            <Text style={styles.stockReturn}>+8.2%</Text>
                            <Text style={styles.stockPeriod}>Avg. Annual</Text>
                        </View>
                    </View>

                    <View style={styles.stockSuggestion}>
                        <View style={styles.stockInfo}>
                            <Text style={styles.stockName}>Technology ETF</Text>
                            <Text style={styles.stockDescription}>
                                Medium-risk, tech sector focus
                            </Text>
                        </View>
                        <View style={styles.stockMetrics}>
                            <Text style={styles.stockReturn}>+12.5%</Text>
                            <Text style={styles.stockPeriod}>Avg. Annual</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.learnMoreButton}>
                        <Text style={styles.learnMoreText}>
                            Learn More About Investing
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Goals List */}
                <View style={styles.goalsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Goals</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Plus color="#6366f1" size={20} />
                        </TouchableOpacity>
                    </View>

                    {goals.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Target color="#9ca3af" size={48} />
                            <Text style={styles.emptyStateText}>
                                No goals yet
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Set your first financial goal to get started
                            </Text>
                        </View>
                    ) : (
                        goals.map((goal) => {
                            const progress =
                                (goal.currentAmount / goal.targetAmount) * 100;
                            const daysLeft = getDaysUntilDeadline(
                                goal.deadline
                            );

                            return (
                                <View key={goal.id} style={styles.goalItem}>
                                    <View style={styles.goalHeader}>
                                        <View style={styles.goalInfo}>
                                            <Text style={styles.goalTitle}>
                                                {goal.title}
                                            </Text>
                                            <Text style={styles.goalCategory}>
                                                {goal.category}
                                            </Text>
                                        </View>
                                        <View style={styles.goalAmount}>
                                            <Text
                                                style={styles.goalCurrentAmount}
                                            >
                                                {formatCurrency(
                                                    goal.currentAmount
                                                )}
                                            </Text>
                                            <Text
                                                style={styles.goalTargetAmount}
                                            >
                                                of{" "}
                                                {formatCurrency(
                                                    goal.targetAmount
                                                )}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${Math.min(
                                                            progress,
                                                            100
                                                        )}%`,
                                                        backgroundColor:
                                                            goal.isCompleted
                                                                ? "#10b981"
                                                                : "#6366f1",
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.progressText}>
                                            {Math.round(progress)}%
                                        </Text>
                                    </View>

                                    <View style={styles.goalFooter}>
                                        <View style={styles.deadlineInfo}>
                                            <Calendar
                                                color="#6b7280"
                                                size={16}
                                            />
                                            <Text style={styles.deadlineText}>
                                                {daysLeft > 0
                                                    ? `${daysLeft} days left`
                                                    : "Overdue"}
                                            </Text>
                                        </View>

                                        {!goal.isCompleted && (
                                            <TouchableOpacity
                                                style={styles.updateButton}
                                                onPress={() => {
                                                    console.log(
                                                        "Update goal progress for:",
                                                        goal.id
                                                    );
                                                }}
                                            >
                                                <Text
                                                    style={
                                                        styles.updateButtonText
                                                    }
                                                >
                                                    Update
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {goal.isCompleted && (
                                        <View style={styles.completedBadge}>
                                            <Text style={styles.completedText}>
                                                🎉 Goal Completed!
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Add Goal Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setShowAddModal(false)}
                        >
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>New Goal</Text>
                        <TouchableOpacity onPress={handleAddGoal}>
                            <Text style={styles.modalSave}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Goal Title</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.title}
                                onChangeText={(text) =>
                                    setNewGoal((prev) => ({
                                        ...prev,
                                        title: text,
                                    }))
                                }
                                placeholder="e.g., Emergency Fund, Vacation"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Target Amount</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.targetAmount}
                                onChangeText={(text) =>
                                    setNewGoal((prev) => ({
                                        ...prev,
                                        targetAmount: text,
                                    }))
                                }
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.category}
                                onChangeText={(text) =>
                                    setNewGoal((prev) => ({
                                        ...prev,
                                        category: text,
                                    }))
                                }
                                placeholder="Savings"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Deadline</Text>
                            <TextInput
                                style={styles.input}
                                value={newGoal.deadline}
                                onChangeText={(text) =>
                                    setNewGoal((prev) => ({
                                        ...prev,
                                        deadline: text,
                                    }))
                                }
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
    },
    overviewCard: {
        margin: 20,
        marginTop: 10,
        padding: 24,
        borderRadius: 20,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    overviewStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    overviewStat: {
        alignItems: "center",
    },
    overviewStatValue: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    overviewStatLabel: {
        color: "#d1fae5",
        fontSize: 12,
    },
    monthlySavingsCard: {
        margin: 20,
        marginTop: 0,
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    monthlySavingsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    monthlySavingsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginLeft: 8,
    },
    monthlySavingsAmount: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#10b981",
        marginBottom: 4,
    },
    monthlySavingsSubtext: {
        fontSize: 14,
        color: "#6b7280",
    },
    goalsSection: {
        margin: 20,
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f0f0ff",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        alignItems: "center",
        padding: 40,
        backgroundColor: "#ffffff",
        borderRadius: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    goalItem: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4,
    },
    goalCategory: {
        fontSize: 14,
        color: "#6b7280",
    },
    goalAmount: {
        alignItems: "flex-end",
    },
    goalCurrentAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#10b981",
    },
    goalTargetAmount: {
        fontSize: 14,
        color: "#6b7280",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 4,
        marginRight: 12,
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
        minWidth: 40,
        textAlign: "right",
    },
    goalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    deadlineInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    deadlineText: {
        fontSize: 14,
        color: "#6b7280",
        marginLeft: 4,
    },
    updateButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#6366f1",
        borderRadius: 8,
    },
    updateButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    completedBadge: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#f0fdf4",
        borderRadius: 8,
        alignItems: "center",
    },
    completedText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#15803d",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    modalCancel: {
        fontSize: 16,
        color: "#6b7280",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
    },
    modalSave: {
        fontSize: 16,
        color: "#6366f1",
        fontWeight: "600",
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: "#ffffff",
    },
    stockSuggestionsCard: {
        margin: 20,
        marginTop: 0,
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    stockHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    stockTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginLeft: 8,
    },
    stockSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
    },
    stockSuggestion: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    stockInfo: {
        flex: 1,
    },
    stockName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 2,
    },
    stockDescription: {
        fontSize: 14,
        color: "#6b7280",
    },
    stockMetrics: {
        alignItems: "flex-end",
    },
    stockReturn: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#10b981",
    },
    stockPeriod: {
        fontSize: 12,
        color: "#6b7280",
    },
    learnMoreButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#f0f0ff",
        borderRadius: 8,
        alignItems: "center",
    },
    learnMoreText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6366f1",
    },
});
