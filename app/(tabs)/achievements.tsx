import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy, Calendar, Flame, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBudget } from "@/hooks/budget-store";
import LoginCalendar from "@/components/LoginCalendar";
import PlantBuddy from "@/components/PlantBuddy";

export default function AchievementsScreen() {
    const { achievements, loginStreak, plantHealth } = useBudget();
    const insets = useSafeAreaInsets();

    const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
    const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getAchievementProgress = (achievement: any) => {
        if (!achievement || typeof achievement.target !== "number") return 0;
        if (achievement.type === "login_streak") {
            return Math.min(
                (loginStreak.currentStreak / achievement.target) * 100,
                100
            );
        }
        return (achievement.current / achievement.target) * 100;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Achievements</Text>
                    <Text style={styles.subtitle}>
                        Track your progress and milestones
                    </Text>
                </View>

                {/* Login Streak Card */}
                <LinearGradient
                    colors={["#f59e0b", "#d97706"]}
                    style={styles.streakCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.streakHeader}>
                        <Flame color="#ffffff" size={32} />
                        <View style={styles.streakInfo}>
                            <Text style={styles.streakTitle}>Login Streak</Text>
                            <Text style={styles.streakSubtitle}>
                                Keep the momentum going!
                            </Text>
                        </View>
                    </View>

                    <View style={styles.streakStats}>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>
                                {loginStreak.currentStreak}
                            </Text>
                            <Text style={styles.streakStatLabel}>Current</Text>
                        </View>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>
                                {loginStreak.longestStreak}
                            </Text>
                            <Text style={styles.streakStatLabel}>Best</Text>
                        </View>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>
                                {loginStreak.totalLogins}
                            </Text>
                            <Text style={styles.streakStatLabel}>Total</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Login Calendar */}
                <LoginCalendar
                    monthlyLogins={loginStreak.monthlyLogins}
                    currentStreak={loginStreak.currentStreak}
                />

                {/* Plant Buddy */}
                <PlantBuddy plantHealth={plantHealth} />

                {/* Achievement Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Trophy color="#6366f1" size={24} />
                            <Text style={styles.statValue}>
                                {unlockedAchievements.length}
                            </Text>
                            <Text style={styles.statLabel}>Unlocked</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Star color="#f59e0b" size={24} />
                            <Text style={styles.statValue}>
                                {achievements.length}
                            </Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Calendar color="#10b981" size={24} />
                            <Text style={styles.statValue}>
                                {Math.round(
                                    (unlockedAchievements.length /
                                        achievements.length) *
                                        100
                                )}
                                %
                            </Text>
                            <Text style={styles.statLabel}>Complete</Text>
                        </View>
                    </View>
                </View>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            🏆 Unlocked Achievements
                        </Text>
                        {unlockedAchievements.map((achievement) => (
                            <View
                                key={achievement.id}
                                style={[
                                    styles.achievementItem,
                                    styles.unlockedItem,
                                ]}
                            >
                                <View style={styles.achievementIcon}>
                                    <Text style={styles.achievementEmoji}>
                                        {achievement.icon}
                                    </Text>
                                </View>
                                <View style={styles.achievementContent}>
                                    <Text style={styles.achievementTitle}>
                                        {achievement.title}
                                    </Text>
                                    <Text style={styles.achievementDescription}>
                                        {achievement.description}
                                    </Text>
                                    {achievement.unlockedAt && (
                                        <Text style={styles.unlockedDate}>
                                            Unlocked on{" "}
                                            {formatDate(achievement.unlockedAt)}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.achievementBadge}>
                                    <Trophy color="#fbbf24" size={20} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            🔒 Locked Achievements
                        </Text>
                        {lockedAchievements.map((achievement) => {
                            const progress =
                                getAchievementProgress(achievement);
                            const currentValue =
                                achievement.type === "login_streak"
                                    ? loginStreak.currentStreak
                                    : achievement.current;

                            return (
                                <View
                                    key={achievement.id}
                                    style={[
                                        styles.achievementItem,
                                        styles.lockedItem,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.achievementIcon,
                                            styles.lockedIcon,
                                        ]}
                                    >
                                        <Text style={styles.achievementEmoji}>
                                            {achievement.icon}
                                        </Text>
                                    </View>
                                    <View style={styles.achievementContent}>
                                        <Text
                                            style={[
                                                styles.achievementTitle,
                                                styles.lockedTitle,
                                            ]}
                                        >
                                            {achievement.title}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.achievementDescription,
                                                styles.lockedDescription,
                                            ]}
                                        >
                                            {achievement.description}
                                        </Text>

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
                                                        },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {currentValue}/
                                                {achievement.target}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Motivational Message */}
                <View style={styles.motivationCard}>
                    <Text style={styles.motivationTitle}>Keep Going! 💪</Text>
                    <Text style={styles.motivationText}>
                        Every day you track your finances brings you closer to
                        your goals. Stay consistent and watch your achievements
                        grow!
                    </Text>
                </View>
            </ScrollView>
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
    streakCard: {
        margin: 20,
        marginTop: 10,
        padding: 24,
        borderRadius: 20,
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    streakHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    streakInfo: {
        marginLeft: 16,
    },
    streakTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    streakSubtitle: {
        color: "#fef3c7",
        fontSize: 14,
    },
    streakStats: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    streakStat: {
        alignItems: "center",
    },
    streakStatValue: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    streakStatLabel: {
        color: "#fef3c7",
        fontSize: 12,
    },
    statsCard: {
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
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    section: {
        margin: 20,
        marginTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 16,
    },
    achievementItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unlockedItem: {
        backgroundColor: "#ffffff",
        borderLeftWidth: 4,
        borderLeftColor: "#10b981",
    },
    lockedItem: {
        backgroundColor: "#f9fafb",
        borderLeftWidth: 4,
        borderLeftColor: "#d1d5db",
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f0f9ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    lockedIcon: {
        backgroundColor: "#f3f4f6",
        opacity: 0.6,
    },
    achievementEmoji: {
        fontSize: 24,
    },
    achievementContent: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4,
    },
    lockedTitle: {
        color: "#6b7280",
    },
    achievementDescription: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 4,
    },
    lockedDescription: {
        color: "#9ca3af",
    },
    unlockedDate: {
        fontSize: 12,
        color: "#10b981",
        fontWeight: "500",
    },
    achievementBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#fef3c7",
        justifyContent: "center",
        alignItems: "center",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        marginRight: 12,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#6366f1",
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "500",
        minWidth: 40,
        textAlign: "right",
    },
    motivationCard: {
        margin: 20,
        marginTop: 0,
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#e0e7ff",
        alignItems: "center",
    },
    motivationTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    motivationText: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
    },
});
