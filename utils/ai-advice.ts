import { Transaction } from "@/types/budget";

export const generateSpendingAdvice = async (
    transaction: Transaction,
    previousTransactions: Transaction[]
): Promise<string> => {
    try {
        const recentTransactions = previousTransactions
            .slice(0, 10)
            .map(
                (t) =>
                    `${t.type}: $${Math.abs(t.amount)} - ${t.category} - ${
                        t.description
                    }`
            )
            .join("\n");

        const messages = [
            {
                role: "system" as const,
                content:
                    "You are a helpful financial advisor. Provide brief, actionable advice about spending habits. Keep responses under 50 words and be encouraging but honest.",
            },
            {
                role: "user" as const,
                content: `New transaction: ${transaction.type}: $${Math.abs(
                    transaction.amount
                )} - ${transaction.category} - ${transaction.description}

Recent transactions:
${recentTransactions}

Give me brief advice about this spending pattern.`,
            },
        ];

        const response = await fetch("https://toolkit.rork.com/text/llm/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });

        const data = await response.json();
        return (
            data.completion ||
            "Keep tracking your expenses to build better financial habits!"
        );
    } catch (error) {
        console.error("Failed to generate advice:", error);
        return "Keep tracking your expenses to build better financial habits!";
    }
};
