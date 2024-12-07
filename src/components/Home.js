import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Heading,
  useToast,
  HStack,
  Stack,
  Avatar,
  Divider,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useOkto } from "okto-sdk-react";
import axios from 'axios';

const Home = () => {
  const { getPortfolio, createWallet } = useOkto();
  const toast = useToast();

  const [portfolio, setPortfolio] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [network, setNetwork] = useState("polygon"); // Default network: polygon
  const [error, setError] = useState(null);

  // Fetch Portfolio and Wallet Data
  useEffect(() => {
    const fetchPortfolioAndWallets = async () => {
      try {
        const portfolioData = await getPortfolio();
        setPortfolio(portfolioData);

        // Automatically create a wallet if none exists
        const walletData = await createWallet();
        console.log("Wallet Data: ", walletData);
        setWallets(walletData);

        // Fetch transaction details for the filtered wallets
        if (walletData?.wallets?.length > 0) {
          walletData.wallets
            .forEach(wallet => {
              // Fetch transactions for the selected wallets based on the network
              fetchTransactionDetails(wallet.address, wallet.network_name);
            });
        }
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to fetch portfolio or create wallet: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchPortfolioAndWallets();
  }, [getPortfolio, createWallet, toast, network]);

  // Fetch Transaction Details based on Network
  const fetchTransactionDetails = async (walletAddress, network) => {
    let apiUrl = "";

    // Define API URLs based on the network
    if (network === "POLYGON_TESTNET_AMOY") {
      apiUrl = `https://api-amoy.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc`;
    } else if (network === "APTOS_TESTNET") {
      apiUrl = `https://api.testnet.aptoslabs.com/v1/accounts/${walletAddress}/transactions`;
    }

    try {
      const response = await axios.get(apiUrl);
      if (response.data.status === "1" || response.data.success) {
        setTransactionDetails(response.data.result || response.data.transactions); // Update based on the response format
      } else {
        setTransactionDetails([]);
      }
    } catch (err) {
      setError("Failed to fetch transactions.");
    }
  };

  // Shorten wallet address for display
  const shortWalletAddress = (walletAddress) => {
    if (walletAddress.length === 64) {
      return `${walletAddress.substring(0, 6)}...${walletAddress.substring(58, 64)}`;
    }
    return `${walletAddress}`;
  };

  return (
    <Box
      maxW="100%"
      mx="auto"
      mt={8}
      p={6}
      bgGradient="linear(to-r, purple.400, blue.500)"
      boxShadow="lg"
      rounded="lg"
    >
      <Heading mb={6} textAlign="center" color="white">
        Portfolio Management
      </Heading>

      {/* Two-column layout */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {/* Left Column: Portfolio */}
        <GridItem>
          {portfolio && (
            <Box mb={6}>
              <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
                Your Portfolio:
              </Text>
              <Stack spacing={4}>
                {portfolio.tokens.map((token, index) => (
                  <HStack
                    key={index}
                    p={4}
                    border="1px solid #e2e8f0"
                    borderRadius="md"
                    backgroundColor="whiteAlpha.800"
                    align="center"
                    justify="space-between"
                  >
                    <HStack>
                      <Avatar name={token.token_name} src={token.token_image || ""} />
                      <Box>
                        <Text fontWeight="bold">{token.token_name}</Text>
                        <Text fontSize="sm">Network: {token.network_name}</Text>
                      </Box>
                    </HStack>
                    <Box textAlign="right">
                      <Text>{token.quantity} Tokens</Text>
                      <Text fontSize="sm">INR: ₹{token.amount_in_inr}</Text>
                    </Box>
                  </HStack>
                ))}
              </Stack>
            </Box>
          )}

          {transactionDetails && (
            <Box mt={6}>
              <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
                Recent Transactions:
              </Text>
              <Stack spacing={4}>
                {transactionDetails.map((transaction, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px solid #e2e8f0"
                    borderRadius="md"
                    backgroundColor="whiteAlpha.800"
                  >
                    <Text>Transaction ID: {transaction.hash}</Text>
                    <Text>Status: {transaction.isError === "0" ? "Success" : "Failed"}</Text>
                    <Text>Amount: {transaction.value / 1e18} {transaction.tokenSymbol || 'ETH'}</Text>
                    <Text>Timestamp: {new Date(transaction.timeStamp * 1000).toLocaleString()}</Text>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </GridItem>

        {/* Right Column: Wallets & Transaction Details */}
        <GridItem>
          <Box mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
              Wallet Addresses:
            </Text>
            <Stack spacing={4}>
              {wallets && wallets.wallets
                .filter(wallet => wallet.network_name.includes("TESTNET") || wallet.network_name.includes("BASE") || wallet.network_name.includes("AVA") || wallet.network_name.includes("DEVNET")) // Filter testnet and devnet wallets
                .map((wallet, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px solid #e2e8f0"
                    borderRadius="md"
                    backgroundColor="whiteAlpha.800"
                  >
                    <Text fontWeight="bold">{wallet.network_name} Wallet</Text>
                    <Text>Address: {shortWalletAddress(wallet.address)}</Text>
                  </Box>
                ))}
            </Stack>
          </Box>
        </GridItem>
      </Grid>

      <Divider mb={6} />
    </Box>
  );
};

export default Home;
