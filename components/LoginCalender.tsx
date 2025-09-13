import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, CheckCircle } from "lucide-react-native";

interface LoginCalendarProps {
    monthlyLogins: { [key: string]: boolean };
    currentStreak: number;
}

export default function LoginCalendar({
    monthlyLogins,
    currentStreak,
}: LoginCalendarProps) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formatDate = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        return date.toISOString().split("T")[0];
    };

    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const hasLoggedIn = (day: number) => {
        const dateKey = formatDate(day);
        return monthlyLogins[dateKey] === true;
    };

    // Create calendar grid
    const calendarDays = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentDay = isToday(day);
        const hasLogin = hasLoggedIn(day);
        const isPastDay =
            day < today.getDate() ||
            currentMonth < today.getMonth() ||
            currentYear < today.getFullYear();

        calendarDays.push(
            <View
                key={day}
                style={[
                    styles.dayCell,
                    isCurrentDay && styles.todayCell,
                    hasLogin && styles.loginCell,
                    !hasLogin && isPastDay && styles.missedCell,
                ]}
            >
                <Text
                    style={[
                        styles.dayText,
                        isCurrentDay && styles.todayText,
                        hasLogin && styles.loginText,
                        !hasLogin && isPastDay && styles.missedText,
                    ]}
                >
                    {day}
                </Text>
                {hasLogin && (
                    <CheckCircle
                        size={12}
                        color="#ffffff"
                        style={styles.checkIcon}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Calendar color="#6366f1" size={24} />
                <View style={styles.headerText}>
                    <Text style={styles.title}>Login Calendar</Text>
                    <Text style={styles.subtitle}>
                        {monthNames[currentMonth]} {currentYear}
                    </Text>
                </View>
                <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>{currentStreak}</Text>
                    <Text style={styles.streakLabel}>streak</Text>
                </View>
            </View>

            <View style={styles.calendar}>
                {/* Day headers */}
                <View style={styles.dayHeaders}>
                    {dayNames.map((dayName) => (
                        <Text key={dayName} style={styles.dayHeader}>
                            {dayName}
                        </Text>
                    ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.calendarGrid}>{calendarDays}</View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.loginDot]} />
                    <Text style={styles.legendText}>Logged in</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.todayDot]} />
                    <Text style={styles.legendText}>Today</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.missedDot]} />
                    <Text style={styles.legendText}>Missed</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        margin: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    streakBadge: {
        backgroundColor: "#f59e0b",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "center",
    },
    streakText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    streakLabel: {
        color: "#fef3c7",
        fontSize: 10,
        marginTop: 2,
    },
    calendar: {
        marginBottom: 16,
    },
    dayHeaders: {
        flexDirection: "row",
        marginBottom: 8,
    },
    dayHeader: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "600",
        color: "#6b7280",
        paddingVertical: 8,
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 4,
        position: "relative",
    },
    todayCell: {
        backgroundColor: "#e0e7ff",
        borderWidth: 2,
        borderColor: "#6366f1",
    },
    loginCell: {
        backgroundColor: "#10b981",
    },
    missedCell: {
        backgroundColor: "#fef2f2",
    },
    dayText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
    todayText: {
        color: "#6366f1",
        fontWeight: "bold",
    },
    loginText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    missedText: {
        color: "#ef4444",
    },
    checkIcon: {
        position: "absolute",
        top: 2,
        right: 2,
    },
    legend: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    loginDot: {
        backgroundColor: "#10b981",
    },
    todayDot: {
        backgroundColor: "#6366f1",
    },
    missedDot: {
        backgroundColor: "#ef4444",
    },
    legendText: {
        fontSize: 12,
        color: "#6b7280",
    },
});
