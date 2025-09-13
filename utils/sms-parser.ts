import { Platform } from "react-native";

export interface ParsedTransaction {
    amount: number;
    description: string;
    category: string;
    type: "income" | "expense";
    date: Date;
}

export const parseSMSForTransaction = (
    smsContent: string
): ParsedTransaction | null => {
    if (Platform.OS !== "android") {
        return null;
    }

    // Common patterns for bank SMS
    const patterns = [
        // Debit/withdrawal patterns
        {
            regex: /(?:debited|withdrawn|spent|paid).*?(?:rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
            type: "expense" as const,
        },
        // Credit/deposit patterns
        {
            regex: /(?:credited|deposited|received).*?(?:rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
            type: "income" as const,
        },
        // Purchase patterns
        {
            regex: /purchase.*?(?:rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
            type: "expense" as const,
        },
    ];

    for (const pattern of patterns) {
        const match = smsContent.match(pattern.regex);
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ""));

            // Extract merchant/description
            let description = "Transaction";
            const merchantMatch = smsContent.match(
                /(?:at|to|from)\s+([A-Za-z0-9\s]+)/i
            );
            if (merchantMatch) {
                description = merchantMatch[1].trim();
            }

            // Categorize based on keywords
            const category = categorizeTransaction(smsContent, description);

            return {
                amount,
                description,
                category,
                type: pattern.type,
                date: new Date(),
            };
        }
    }

    return null;
};

const categorizeTransaction = (
    smsContent: string,
    description: string
): string => {
    if (!smsContent?.trim() || !description?.trim()) return "Other";
    const text = (smsContent + " " + description).toLowerCase();

    const categories = {
        "Food & Dining": [
            "restaurant",
            "food",
            "cafe",
            "pizza",
            "burger",
            "swiggy",
            "zomato",
        ],
        Shopping: ["amazon", "flipkart", "mall", "store", "shop", "purchase"],
        Transportation: [
            "uber",
            "ola",
            "taxi",
            "metro",
            "bus",
            "fuel",
            "petrol",
        ],
        "Bills & Utilities": [
            "electricity",
            "water",
            "gas",
            "internet",
            "mobile",
            "recharge",
        ],
        Entertainment: ["movie", "cinema", "netflix", "spotify", "game"],
        Healthcare: ["hospital", "pharmacy", "doctor", "medical"],
        Salary: ["salary", "wages", "payroll"],
        Transfer: ["transfer", "upi", "neft", "imps"],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (
            keywords.some((keyword) => {
                if (!keyword?.trim()) return false;
                return text.includes(keyword);
            })
        ) {
            return category;
        }
    }

    return "Other";
};
