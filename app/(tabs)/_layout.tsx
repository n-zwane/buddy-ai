import { Tabs } from "expo-router";
import { Wallet, Target, Trophy, MessageSquare } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#6366f1",
                tabBarInactiveTintColor: "#9ca3af",
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#f3f4f6",
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Balance",
                    tabBarIcon: ({ color, size }) => (
                        <Wallet color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    title: "Goals",
                    tabBarIcon: ({ color, size }) => (
                        <Target color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="achievements"
                options={{
                    title: "Achievements",
                    tabBarIcon: ({ color, size }) => (
                        <Trophy color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sms"
                options={{
                    title: "SMS Reader",
                    tabBarIcon: ({ color, size }) => (
                        <MessageSquare color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
