/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register the necessary components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function IntegratedDeFiAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [news, setNews] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  const toast = useToast();

  useEffect(() => {
    addWelcomeMessage();
    fetchDefaultNews();
  }, []);

  useEffect(() => {
    if (selectedToken) {
      fetchTokenNews();
      fetchPriceHistory();
    }
  }, [selectedToken]);

  const addWelcomeMessage = () => {
    setMessages([
      {
        text: "Welcome to your DeFi Advisor! How can I assist you today?",
        sender: "ai",
      },
    ]);
  };

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await axios.post("http://localhost:3000/api/chat", {
          message: input,
        });
        const { intent, response: aiResponse } = response.data;

        if (intent.token) {
          setSelectedToken(intent.token.toLowerCase());
        }

        const aiMessage = { text: aiResponse, sender: "ai" };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling AI API:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const fetchDefaultNews = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/news/cryptocurrency"
      );
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching default news:", error);
    }
  };

  const fetchTokenNews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/news/${selectedToken}`
      );
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching token-specific news:", error);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/price-history/${selectedToken}`
      );
      setPriceHistory(response.data);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  return (
    <Box p={4} bg="gray.900">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg" color="white">
          Defidvisor
        </Heading>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {/* Left Column: Chat Section */}
        <GridItem colSpan={1}>
          <VStack spacing={4} align="stretch" height="calc(100vh - 100px)">

            <Box
              flex={1}
              overflowY="auto"
              bg="gray.700"
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.600"
            >
              {messages.map((msg, index) => (
                <Text
                  key={index}
                  bg={msg.sender === "user" ? "blue.600" : "green.600"}
                  color="white"
                  p={2}
                  borderRadius="md"
                  my={1}
                >
                  {msg.text}
                </Text>
              ))}
            </Box>
            <HStack>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DeFi investments..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                bg="gray.800"
                color="white"
                _placeholder={{ color: "gray.400" }}
              />
              <Button onClick={handleSend} colorScheme="blue">
                Send
              </Button>
            </HStack>
          </VStack>
        </GridItem>

        {/* Right Column: News and Graph Section */}
        <GridItem colSpan={1}>
          <VStack spacing={4} align="stretch" height="calc(100vh - 100px)">
            {/* News Section */}
            <Heading size="md" color="white">
              Relevant News
            </Heading>
            <Box
              bg="gray.700"
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.600"
              minHeight={200}
              maxHeight="350px"
              overflowY="auto"
            >
              {news.map((article, index) => (
                <Box key={index} my={2}>
                  <Text fontWeight="bold" color="white">
                    {article.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {article.source.name} -{" "}
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Text>
                  <Text color="gray.300">{article.description}</Text>
                </Box>
              ))}
            </Box>

            {/* Price History Graph Section */}
            {priceHistory.length > 0 && (
              <Box
                bg="gray.700"
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.600"
                minHeight={400}
              >
                <Heading size="md" color="white" mb={4}>
                  Price History
                </Heading>
                <Line
                  data={{
                    labels: priceHistory.map((point) =>
                      new Date(point[0]).toLocaleDateString()
                    ),
                    datasets: [
                      {
                        label: `${selectedToken.toUpperCase()} Price (EUR)`,
                        data: priceHistory.map((point) => point[1]),
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                      },
                    ],
                  }}
                />
              </Box>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default IntegratedDeFiAdvisor;
