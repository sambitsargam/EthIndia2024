const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API route for chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const systemMessage =
      'You are a DeFi investment advisor trained by 0xSambit. When you respond, please include the following: 1) A JSON object containing the token(s) being discussed and their intent, 2) A user-friendly message that can be displayed directly to the user. Use the format: { "intent": { "token": "...", "action": "..." }, "response": "..." } ';

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
      model: "gpt-3.5-turbo",
    });

    const aiResponse = chatCompletion.choices[0].message.content.trim();
    const parsedResponse = JSON.parse(aiResponse);

    res.json({
      intent: parsedResponse.intent,
      response: parsedResponse.response,
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({
      error: "Failed to get response from AI",
      details: error.message,
    });
  }
});

// API route to fetch crypto data
app.get("/api/crypto-data", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "eur",
          order: "market_cap_desc",
          per_page: 5,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        },
      }
    );
    console.log("crypto data " + response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    res.status(500).json({
      error: "Failed to fetch cryptocurrency data",
      details: error.message,
    });
  }
});

// API route to fetch cryptocurrency price history
app.get("/api/price-history/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${token}/market_chart`,
      {
        params: {
          vs_currency: "eur",
          days: "30",
          interval: "daily",
        },
      }
    );
    res.json(response.data.prices);
  } catch (error) {
    console.error("Error fetching price history:", error);
    res.status(500).json({
      error: "Failed to fetch price history",
      details: error.message,
    });
  }
});

// Helper function to determine if a transaction is a "whale" transaction
const isWhaleTransaction = (transaction, threshold) => {
  const value = parseFloat(transaction.value);
  return value >= threshold;
};

const largeTransactions = [];

// API route to fetch whale alerts
app.get("/api/whale-alerts/:block", async (req, res) => {
  const { block } = req.params;
  try {
    // Define what constitutes a "whale" transaction

    if (largeTransactions.length > 0) {
      res.json({ transactions: largeTransactions });
      return;
    }

    const lastBlocks = 100;
    const whaleThreshold = 100000000000000000000; // Example threshold, adjust based on the token's units
    const blockNumber = 20494714;
    for (let i = blockNumber; i > blockNumber - lastBlocks; i--) {
      const blockscoutAPIUrl = `https://base.blockscout.com/api/v2/blocks/${i}/transactions`;

      try {
        const response = await axios.get(blockscoutAPIUrl);

        console.log("blockNumber " + i);
        if (response.data && response.data.items) {
          const transactions = response.data.items;

          // Filter for large transactions
          const filteredTransactions = transactions.filter((tx) =>
            isWhaleTransaction(tx, whaleThreshold)
          );

          largeTransactions.push(...filteredTransactions);
        } else {
          throw new Error("Invalid response from Blockscout API");
        }
      } catch (error) {
        console.error(`Error fetching transactions for block ${i}:`, error);
      }
    }

    res.json({ transactions: largeTransactions });
  } catch (error) {
    console.error("Error fetching whale alerts:", error);
    res.status(500).json({
      error: "Failed to fetch whale alerts",
      details: error.message,
    });
  }
});

// API route to fetch cryptocurrency news
app.get("/api/news/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: token,
        sortBy: "publishedAt",
        apiKey: "db911d65586f48148bead14a254255d6",
        pageSize: 5,
      },
    });
    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      error: "Failed to fetch news",
      details: error.message,
    });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
