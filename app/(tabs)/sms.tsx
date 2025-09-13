import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    PermissionsAndroid,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    MessageSquare,
    CheckCircle,
    XCircle,
    RefreshCw,
    Smartphone,
} from "lucide-react-native";
import { useBudget } from "@/hooks/budget-store";
import { parseSMSForTransaction, ParsedTransaction } from "@/utils/sms-parser";

interface PendingSMS {
    id: string;
    content: string;
    parsedTransaction: ParsedTransaction | null;
    timestamp: Date;
    isConfirmed: boolean;
}

export default function SMSScreen() {
    const { addTransaction } = useBudget();
    const insets = useSafeAreaInsets();

    const [pendingSMS, setPendingSMS] = useState<PendingSMS[]>([]);
    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        checkSMSPermission();
    }, []);

    const checkSMSPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_SMS
                );
                setHasPermission(granted);
            } catch (error) {
                console.log("Permission check error:", error);
                setHasPermission(false);
            }
        } else {
            setHasPermission(false);
        }
    };

    const requestSMSPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_SMS,
                    {
                        title: "SMS Permission",
                        message:
                            "Budget Buddy needs access to read SMS messages to automatically detect transactions from your bank.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );

                const hasPermission =
                    granted === PermissionsAndroid.RESULTS.GRANTED;
                setHasPermission(hasPermission);

                if (hasPermission) {
                    scanForBankSMS();
                }
            } catch (error) {
                console.log("Permission request error:", error);
                Alert.alert("Error", "Failed to request SMS permission");
            }
        } else {
            Alert.alert(
                "Not Available",
                "SMS reading is only available on Android devices for security reasons."
            );
        }
    };

    const scanForBankSMS = async () => {
        if (!hasPermission) {
            Alert.alert(
                "Permission Required",
                "Please grant SMS permission first."
            );
            return;
        }

        setIsScanning(true);

        // Simulate SMS scanning (in a real app, you'd use a native module)
        setTimeout(() => {
            const mockSMSMessages = [
                {
                    id: "1",
                    content:
                        "Your account has been debited by Rs. 250.00 at STARBUCKS COFFEE on 2024-01-15. Available balance: Rs. 5,750.00",
                    timestamp: new Date(),
                },
                {
                    id: "2",
                    content:
                        "Amount Rs. 1,200.00 credited to your account from SALARY DEPOSIT on 2024-01-15. Available balance: Rs. 6,950.00",
                    timestamp: new Date(),
                },
                {
                    id: "3",
                    content:
                        "Purchase of Rs. 85.50 at AMAZON INDIA on 2024-01-15 using your card ending 1234.",
                    timestamp: new Date(),
                },
            ];

            const newPendingSMS: PendingSMS[] = mockSMSMessages.map((sms) => ({
                ...sms,
                parsedTransaction: parseSMSForTransaction(sms.content),
                isConfirmed: false,
            }));

            setPendingSMS((prev) => [...newPendingSMS, ...prev]);
            setIsScanning(false);
        }, 2000);
    };

    const confirmTransaction = (smsId: string) => {
        const sms = pendingSMS.find((s) => s.id === smsId);
        if (!sms || !sms.parsedTransaction) return;

        addTransaction({
            amount: sms.parsedTransaction.amount,
            description: sms.parsedTransaction.description,
            category: sms.parsedTransaction.category,
            type: sms.parsedTransaction.type,
            date: sms.parsedTransaction.date,
        });

        setPendingSMS((prev) =>
            prev.map((s) => (s.id === smsId ? { ...s, isConfirmed: true } : s))
        );

        Alert.alert("Success", "Transaction added to your budget!");
    };

    const rejectTransaction = (smsId: string) => {
        setPendingSMS((prev) => prev.filter((s) => s.id !== smsId));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <MessageSquare color="#6366f1" size={28} />
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>
                            SMS Transaction Reader
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            Automatically detect bank transactions
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Permission Status */}
                <View style={styles.permissionCard}>
                    <View style={styles.permissionHeader}>
                        <Smartphone
                            color={hasPermission ? "#10b981" : "#f59e0b"}
                            size={24}
                        />
                        <Text style={styles.permissionTitle}>
                            SMS Permission{" "}
                            {hasPermission ? "Granted" : "Required"}
                        </Text>
                    </View>

                    {!hasPermission ? (
                        <View>
                            <Text style={styles.permissionDescription}>
                                Grant SMS permission to automatically detect
                                bank transactions from your messages.
                            </Text>
                            <TouchableOpacity
                                style={styles.permissionButton}
                                onPress={requestSMSPermission}
                            >
                                <Text style={styles.permissionButtonText}>
                                    Grant Permission
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.permissionDescription}>
                                SMS permission granted. You can now scan for
                                bank transactions.
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.permissionButton,
                                    styles.scanButton,
                                ]}
                                onPress={scanForBankSMS}
                                disabled={isScanning}
                            >
                                <RefreshCw
                                    color="#ffffff"
                                    size={16}
                                    style={
                                        isScanning ? styles.spinning : undefined
                                    }
                                />
                                <Text style={styles.permissionButtonText}>
                                    {isScanning
                                        ? "Scanning..."
                                        : "Scan for Transactions"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Pending SMS Transactions */}
                {pendingSMS.length > 0 && (
                    <View style={styles.smsSection}>
                        <Text style={styles.sectionTitle}>
                            Detected Transactions
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Review and confirm these transactions from your SMS
                            messages
                        </Text>

                        {pendingSMS.map((sms) => (
                            <View key={sms.id} style={styles.smsCard}>
                                <View style={styles.smsHeader}>
                                    <Text style={styles.smsTimestamp}>
                                        {sms.timestamp.toLocaleTimeString()}
                                    </Text>
                                    {sms.isConfirmed && (
                                        <View style={styles.confirmedBadge}>
                                            <CheckCircle
                                                color="#10b981"
                                                size={16}
                                            />
                                            <Text style={styles.confirmedText}>
                                                Added
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.smsContent}>
                                    {sms.content}
                                </Text>

                                {sms.parsedTransaction ? (
                                    <View style={styles.parsedTransaction}>
                                        <Text style={styles.parsedTitle}>
                                            Detected Transaction:
                                        </Text>
                                        <View style={styles.transactionDetails}>
                                            <View style={styles.transactionRow}>
                                                <Text
                                                    style={
                                                        styles.transactionLabel
                                                    }
                                                >
                                                    Amount:
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.transactionValue,
                                                        {
                                                            color:
                                                                sms
                                                                    .parsedTransaction
                                                                    .type ===
                                                                "income"
                                                                    ? "#10b981"
                                                                    : "#ef4444",
                                                        },
                                                    ]}
                                                >
                                                    {sms.parsedTransaction
                                                        .type === "income"
                                                        ? "+"
                                                        : "-"}
                                                    {formatCurrency(
                                                        sms.parsedTransaction
                                                            .amount
                                                    )}
                                                </Text>
                                            </View>
                                            <View style={styles.transactionRow}>
                                                <Text
                                                    style={
                                                        styles.transactionLabel
                                                    }
                                                >
                                                    Description:
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.transactionValue
                                                    }
                                                >
                                                    {
                                                        sms.parsedTransaction
                                                            .description
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.transactionRow}>
                                                <Text
                                                    style={
                                                        styles.transactionLabel
                                                    }
                                                >
                                                    Category:
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.transactionValue
                                                    }
                                                >
                                                    {
                                                        sms.parsedTransaction
                                                            .category
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.transactionRow}>
                                                <Text
                                                    style={
                                                        styles.transactionLabel
                                                    }
                                                >
                                                    Type:
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.transactionValue
                                                    }
                                                >
                                                    {sms.parsedTransaction
                                                        .type === "income"
                                                        ? "Income"
                                                        : "Expense"}
                                                </Text>
                                            </View>
                                        </View>

                                        {!sms.isConfirmed && (
                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity
                                                    style={styles.rejectButton}
                                                    onPress={() =>
                                                        rejectTransaction(
                                                            sms.id
                                                        )
                                                    }
                                                >
                                                    <XCircle
                                                        color="#ef4444"
                                                        size={16}
                                                    />
                                                    <Text
                                                        style={
                                                            styles.rejectButtonText
                                                        }
                                                    >
                                                        Reject
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.confirmButton}
                                                    onPress={() =>
                                                        confirmTransaction(
                                                            sms.id
                                                        )
                                                    }
                                                >
                                                    <CheckCircle
                                                        color="#ffffff"
                                                        size={16}
                                                    />
                                                    <Text
                                                        style={
                                                            styles.confirmButtonText
                                                        }
                                                    >
                                                        Confirm & Add
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.noTransactionDetected}>
                                        <Text style={styles.noTransactionText}>
                                            No transaction detected in this
                                            message
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {pendingSMS.length === 0 && hasPermission && (
                    <View style={styles.emptyState}>
                        <MessageSquare color="#9ca3af" size={48} />
                        <Text style={styles.emptyStateText}>
                            No SMS transactions found
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            Scan for bank SMS messages to automatically detect
                            transactions
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    header: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    permissionCard: {
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
    permissionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginLeft: 8,
    },
    permissionDescription: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
        marginBottom: 16,
    },
    permissionButton: {
        backgroundColor: "#6366f1",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    scanButton: {
        backgroundColor: "#10b981",
    },
    permissionButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    spinning: {
        transform: [{ rotate: "45deg" }],
    },
    smsSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
    },
    smsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    smsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    smsTimestamp: {
        fontSize: 12,
        color: "#6b7280",
    },
    confirmedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    confirmedText: {
        fontSize: 12,
        color: "#10b981",
        fontWeight: "600",
        marginLeft: 4,
    },
    smsContent: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 16,
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 8,
    },
    parsedTransaction: {
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 16,
    },
    parsedTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    transactionDetails: {
        marginBottom: 16,
    },
    transactionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    transactionLabel: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    transactionValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ef4444",
        backgroundColor: "#ffffff",
    },
    rejectButtonText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    confirmButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#10b981",
    },
    confirmButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    noTransactionDetected: {
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 16,
        alignItems: "center",
    },
    noTransactionText: {
        fontSize: 14,
        color: "#6b7280",
        fontStyle: "italic",
    },
    emptyState: {
        alignItems: "center",
        padding: 40,
        marginTop: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
    },
});
