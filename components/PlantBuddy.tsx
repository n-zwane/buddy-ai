import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sprout, TreePine, Skull, Heart } from "lucide-react-native";
import { PlantHealth } from "@/types/budget";

interface PlantBuddyProps {
    plantHealth: PlantHealth;
}

export default function PlantBuddy({ plantHealth }: PlantBuddyProps) {
    const getPlantEmoji = () => {
        switch (plantHealth.stage) {
            case "seed":
                return "🌱";
            case "sprout":
                return "🌿";
            case "sapling":
                return "🌳";
            case "tree":
                return "🌲";
            case "wilting":
                return "🥀";
            case "dead":
                return "💀";
            default:
                return "🌱";
        }
    };

    const getPlantIcon = () => {
        switch (plantHealth.stage) {
            case "seed":
            case "sprout":
                return <Sprout color={getHealthColor()} size={48} />;
            case "sapling":
            case "tree":
                return <TreePine color={getHealthColor()} size={48} />;
            case "wilting":
                return <Heart color="#ef4444" size={48} />;
            case "dead":
                return <Skull color="#6b7280" size={48} />;
            default:
                return <Sprout color={getHealthColor()} size={48} />;
        }
    };

    const getHealthColor = () => {
        if (plantHealth.level >= 80) return "#10b981";
        if (plantHealth.level >= 60) return "#84cc16";
        if (plantHealth.level >= 40) return "#f59e0b";
        if (plantHealth.level >= 20) return "#f97316";
        return "#ef4444";
    };

    const getHealthMessage = () => {
        if (plantHealth.level >= 80) {
            return "Your plant is thriving! Keep up the great financial habits! 🌟";
        } else if (plantHealth.level >= 60) {
            return "Your plant is growing well! You're making good progress. 💚";
        } else if (plantHealth.level >= 40) {
            return "Your plant needs some care. Try to improve your spending habits. 💛";
        } else if (plantHealth.level >= 20) {
            return "Your plant is struggling. Focus on better financial decisions. 🧡";
        } else {
            return "Your plant needs immediate attention! Time to get back on track. ❤️";
        }
    };

    const getStageTitle = () => {
        switch (plantHealth.stage) {
            case "seed":
                return "Tiny Seed";
            case "sprout":
                return "Growing Sprout";
            case "sapling":
                return "Young Sapling";
            case "tree":
                return "Mighty Tree";
            case "wilting":
                return "Wilting Plant";
            case "dead":
                return "Dormant Seed";
            default:
                return "Tiny Seed";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Plant Buddy</Text>
                <Text style={styles.subtitle}>Grows with your good habits</Text>
            </View>

            <View
                style={[
                    styles.plantContainer,
                    { backgroundColor: getHealthColor() + "20" },
                ]}
            >
                <View style={styles.plantDisplay}>
                    <Text style={styles.plantEmoji}>{getPlantEmoji()}</Text>
                    <View style={styles.plantIcon}>{getPlantIcon()}</View>
                </View>

                <View style={styles.plantInfo}>
                    <Text style={styles.stageName}>{getStageTitle()}</Text>
                    <Text style={styles.healthLevel}>
                        Health: {plantHealth.level}%
                    </Text>

                    <View style={styles.healthBar}>
                        <View
                            style={[
                                styles.healthFill,
                                {
                                    width: `${plantHealth.level}%`,
                                    backgroundColor: getHealthColor(),
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {plantHealth.goodHabits}
                    </Text>
                    <Text style={styles.statLabel}>Good Habits</Text>
                    <View
                        style={[styles.statDot, { backgroundColor: "#10b981" }]}
                    />
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {plantHealth.badHabits}
                    </Text>
                    <Text style={styles.statLabel}>Bad Habits</Text>
                    <View
                        style={[styles.statDot, { backgroundColor: "#ef4444" }]}
                    />
                </View>
            </View>

            <View style={styles.messageContainer}>
                <Text style={styles.message}>{getHealthMessage()}</Text>
            </View>

            <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Plant Care Tips</Text>
                <Text style={styles.tip}>
                    • Stay within your budget to help your plant grow
                </Text>
                <Text style={styles.tip}>
                    • Regular savings boost plant health
                </Text>
                <Text style={styles.tip}>
                    • Avoid impulse purchases to prevent wilting
                </Text>
                <Text style={styles.tip}>
                    • Daily login keeps your plant happy
                </Text>
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
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
    },
    plantContainer: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    plantDisplay: {
        alignItems: "center",
        marginBottom: 16,
    },
    plantEmoji: {
        fontSize: 64,
        marginBottom: 8,
    },
    plantIcon: {
        opacity: 0.7,
    },
    plantInfo: {
        alignItems: "center",
        width: "100%",
    },
    stageName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    healthLevel: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 12,
    },
    healthBar: {
        width: "100%",
        height: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 4,
        overflow: "hidden",
    },
    healthFill: {
        height: "100%",
        borderRadius: 4,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
        paddingVertical: 16,
        backgroundColor: "#f9fafb",
        borderRadius: 12,
    },
    statItem: {
        alignItems: "center",
        position: "relative",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center",
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: "absolute",
        top: -4,
        right: -4,
    },
    messageContainer: {
        backgroundColor: "#f0f9ff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#0ea5e9",
    },
    message: {
        fontSize: 14,
        color: "#1f2937",
        textAlign: "center",
        lineHeight: 20,
    },
    tipsContainer: {
        backgroundColor: "#fefce8",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#eab308",
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
    },
    tip: {
        fontSize: 13,
        color: "#374151",
        marginBottom: 6,
        lineHeight: 18,
    },
});
