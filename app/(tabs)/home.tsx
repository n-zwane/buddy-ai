import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Menu,
    User,
    Info,
    LogOut,
    TrendingUp,
    TrendingDown,
    Plus,
    X,
} from "lucide-react-native";
import { useBudget } from "@/hooks/budget-store";

export default function HomeScreen() {
    const {
        transactions,
        monthlyBudget,
        getMonthlySpending,
        getMonthlyIncome,
        getCurrentBalance,
        addTransaction,
        updateMonthlyBudget,
    } = useBudget();

    const insets = useSafeAreaInsets();

    const [showMenu, setShowMenu] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [newBudget, setNewBudget] = useState(monthlyBudget.toString());
    const [newTransaction, setNewTransaction] = useState({
        amount: "",
        description: "",
        category: "",
        type: "expense" as "income" | "expense",
    });

    const monthlySpending = getMonthlySpending();
    const monthlyIncome = getMonthlyIncome();
    const currentBalance = getCurrentBalance();
    const remainingBudget = monthlyBudget - monthlySpending;
    const budgetProgress = (monthlySpending / monthlyBudget) * 100;

    // Determine budget status color
    const getBudgetStatusColor = () => {
        if (budgetProgress <= 85) return "#10b981"; // Green - on track
        if (budgetProgress <= 100) return "#f59e0b"; // Yellow - close (within 15%)
        return "#ef4444"; // Red - over budget
    };

    const getBudgetStatusText = () => {
        if (budgetProgress <= 85) return "On Track";
        if (budgetProgress <= 100) return "Close to Limit";
        return "Over Budget";
    };

    const handleUpdateBudget = () => {
        const budget = parseFloat(newBudget);
        if (isNaN(budget) || budget <= 0) {
            Alert.alert(
                "Invalid Budget",
                "Please enter a valid budget amount."
            );
            return;
        }
        updateMonthlyBudget(budget);
        setShowBudgetModal(false);
    };

    const handleAddTransaction = () => {
        const amount = parseFloat(newTransaction.amount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount.");
            return;
        }
        if (!newTransaction.description.trim()) {
            Alert.alert("Missing Description", "Please enter a description.");
            return;
        }

        addTransaction({
            amount,
            description: newTransaction.description,
            category: newTransaction.category || "Other",
            type: newTransaction.type,
            date: new Date(),
        });

        setNewTransaction({
            amount: "",
            description: "",
            category: "",
            type: "expense",
        });
        setShowTransactionModal(false);
    };

    const handleMenuAction = (action: string) => {
        setShowMenu(false);
        switch (action) {
            case "account":
                Alert.alert("Account", "Account settings coming soon!");
                break;
            case "info":
                Alert.alert(
                    "App Info",
                    "Budget Buddy v1.0\nTrack your spending habits and achieve your financial goals!"
                );
                break;
            case "quit":
                Alert.alert("Quit App", "Are you sure you want to quit?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Quit", style: "destructive" },
                ]);
                break;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header with Hamburger Menu */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setShowMenu(true)}
                    testID="hamburger-menu"
                >
                    <Menu color="#374151" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Budget Buddy</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowTransactionModal(true)}
                    testID="add-transaction"
                >
                    <Plus color="#6366f1" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Budget Overview Card */}
                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <Text style={styles.budgetTitle}>Monthly Budget</Text>
                        <TouchableOpacity
                            onPress={() => setShowBudgetModal(true)}
                            testID="edit-budget"
                        >
                            <Text style={styles.editBudgetText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.budgetAmounts}>
                        <Text style={styles.budgetAmount}>
                            ${monthlyBudget.toLocaleString()}
                        </Text>
                        <Text style={styles.spentAmount}>
                            Spent: ${monthlySpending.toLocaleString()}
                        </Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(
                                            budgetProgress,
                                            100
                                        )}%`,
                                        backgroundColor: getBudgetStatusColor(),
                                    },
                                ]}
                            />
                        </View>
                        <Text
                            style={[
                                styles.statusText,
                                { color: getBudgetStatusColor() },
                            ]}
                        >
                            {getBudgetStatusText()}
                        </Text>
                    </View>

                    <View style={styles.budgetStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Remaining</Text>
                            <Text
                                style={[
                                    styles.statValue,
                                    {
                                        color:
                                            remainingBudget >= 0
                                                ? "#10b981"
                                                : "#ef4444",
                                    },
                                ]}
                            >
                                ${Math.abs(remainingBudget).toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text
                                style={[styles.statValue, { color: "#10b981" }]}
                            >
                                ${monthlyIncome.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceTitle}>Current Balance</Text>
                    <Text
                        style={[
                            styles.balanceAmount,
                            {
                                color:
                                    currentBalance >= 0 ? "#10b981" : "#ef4444",
                            },
                        ]}
                    >
                        ${currentBalance.toLocaleString()}
                    </Text>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsCard}>
                    <Text style={styles.transactionsTitle}>
                        Recent Transactions
                    </Text>
                    {transactions.slice(0, 5).map((transaction) => (
                        <View
                            key={transaction.id}
                            style={styles.transactionItem}
                        >
                            <View style={styles.transactionIcon}>
                                {transaction.type === "income" ? (
                                    <TrendingUp color="#10b981" size={20} />
                                ) : (
                                    <TrendingDown color="#ef4444" size={20} />
                                )}
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionDescription}>
                                    {transaction.description}
                                </Text>
                                <Text style={styles.transactionCategory}>
                                    {transaction.category}
                                </Text>
                                {transaction.advice && (
                                    <Text style={styles.transactionAdvice}>
                                        💡 {transaction.advice}
                                    </Text>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    {
                                        color:
                                            transaction.type === "income"
                                                ? "#10b981"
                                                : "#ef4444",
                                    },
                                ]}
                            >
                                {transaction.type === "income" ? "+" : "-"}$
                                {Math.abs(transaction.amount).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                    {transactions.length === 0 && (
                        <Text style={styles.noTransactions}>
                            No transactions yet. Add your first transaction!
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Hamburger Menu Modal */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuAction("account")}
                            testID="menu-account"
                        >
                            <User color="#374151" size={20} />
                            <Text style={styles.menuItemText}>Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuAction("info")}
                            testID="menu-info"
                        >
                            <Info color="#374151" size={20} />
                            <Text style={styles.menuItemText}>App Info</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuAction("quit")}
                            testID="menu-quit"
                        >
                            <LogOut color="#ef4444" size={20} />
                            <Text
                                style={[
                                    styles.menuItemText,
                                    { color: "#ef4444" },
                                ]}
                            >
                                Quit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Budget Edit Modal */}
            <Modal
                visible={showBudgetModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowBudgetModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Edit Monthly Budget
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowBudgetModal(false)}
                            >
                                <X color="#6b7280" size={24} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={newBudget}
                            onChangeText={setNewBudget}
                            placeholder="Enter budget amount"
                            keyboardType="numeric"
                            testID="budget-input"
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleUpdateBudget}
                            testID="save-budget"
                        >
                            <Text style={styles.saveButtonText}>
                                Save Budget
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal
                visible={showTransactionModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTransactionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Add Transaction
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowTransactionModal(false)}
                            >
                                <X color="#6b7280" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    newTransaction.type === "expense" &&
                                        styles.typeButtonActive,
                                ]}
                                onPress={() =>
                                    setNewTransaction((prev) => ({
                                        ...prev,
                                        type: "expense",
                                    }))
                                }
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        newTransaction.type === "expense" &&
                                            styles.typeButtonTextActive,
                                    ]}
                                >
                                    Expense
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeButton,
                                    newTransaction.type === "income" &&
                                        styles.typeButtonActive,
                                ]}
                                onPress={() =>
                                    setNewTransaction((prev) => ({
                                        ...prev,
                                        type: "income",
                                    }))
                                }
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        newTransaction.type === "income" &&
                                            styles.typeButtonTextActive,
                                    ]}
                                >
                                    Income
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            value={newTransaction.amount}
                            onChangeText={(text) =>
                                setNewTransaction((prev) => ({
                                    ...prev,
                                    amount: text,
                                }))
                            }
                            placeholder="Amount"
                            keyboardType="numeric"
                            testID="transaction-amount"
                        />

                        <TextInput
                            style={styles.input}
                            value={newTransaction.description}
                            onChangeText={(text) =>
                                setNewTransaction((prev) => ({
                                    ...prev,
                                    description: text,
                                }))
                            }
                            placeholder="Description"
                            testID="transaction-description"
                        />

                        <TextInput
                            style={styles.input}
                            value={newTransaction.category}
                            onChangeText={(text) =>
                                setNewTransaction((prev) => ({
                                    ...prev,
                                    category: text,
                                }))
                            }
                            placeholder="Category (optional)"
                            testID="transaction-category"
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleAddTransaction}
                            testID="save-transaction"
                        >
                            <Text style={styles.saveButtonText}>
                                Add Transaction
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    menuButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    addButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    budgetCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    budgetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    budgetTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    editBudgetText: {
        fontSize: 14,
        color: "#6366f1",
        fontWeight: "500",
    },
    budgetAmounts: {
        marginBottom: 16,
    },
    budgetAmount: {
        fontSize: 32,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    spentAmount: {
        fontSize: 16,
        color: "#6b7280",
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    budgetStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        alignItems: "center",
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "600",
    },
    balanceCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    balanceTitle: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: "700",
    },
    transactionsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    transactionsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f9fafb",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 4,
    },
    transactionAdvice: {
        fontSize: 12,
        color: "#6366f1",
        fontStyle: "italic",
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: "600",
    },
    noTransactions: {
        textAlign: "center",
        color: "#6b7280",
        fontStyle: "italic",
        paddingVertical: 20,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    menuContainer: {
        backgroundColor: "#ffffff",
        marginTop: 80,
        marginLeft: 20,
        borderRadius: 12,
        paddingVertical: 8,
        minWidth: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: "#374151",
        marginLeft: 12,
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: "#ffffff",
    },
    typeSelector: {
        flexDirection: "row",
        marginBottom: 16,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 6,
    },
    typeButtonActive: {
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6b7280",
    },
    typeButtonTextActive: {
        color: "#111827",
    },
    saveButton: {
        backgroundColor: "#6366f1",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
