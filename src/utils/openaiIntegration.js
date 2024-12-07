import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

async function getAIResponse(prompt, cryptoData, portfolio) {
  try {
    const portfolioDescription = Object.entries(portfolio)
      .map(([id, amount]) => {
        const crypto = cryptoData.find((c) => c.id === id);
        return crypto ? `${crypto.name}: ${amount}` : "";
      })
      .filter(Boolean)
      .join(", ");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a DeFi investment advisor." },
        {
          role: "user",
          content: `My current portfolio is: ${portfolioDescription}. ${prompt}`,
        },
      ],
      max_tokens: 150,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

export default getAIResponse;
