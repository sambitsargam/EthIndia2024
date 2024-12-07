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
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { getPortfolio, showWidgetModal, createWallet, transferTokens, orderHistory } = useOkto();
    const toast = useToast();
    const navigate = useNavigate();

    const [portfolio, setPortfolio] = useState(null);
    const [wallets, setWallets] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [network, setNetwork] = useState("polygon"); // Default network: polygon
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    // For transfer tokens
    const [transferResponse, setTransferResponse] = useState(null);
    const [transferData, setTransferData] = useState({
        network_name: "",
        token_address: "",
        quantity: "",
        recipient_address: "",
    });

    // For order check
    const [orderResponse, setOrderResponse] = useState(null);
    const [orderData, setOrderData] = useState({
        order_id: "",
    });

    const handleOrderCheck = async (e) => {
        e.preventDefault();
        try {
            const response = await orderHistory(orderData);
            setOrderResponse(response);
            setActiveSection('orderResponse');
        } catch (error) {
            setError(`Failed to fetch order status: ${error.message}`);
        }
    };

   const navWidget =async () => {
    try {
      await showWidgetModal();
    } catch (error) {
      setError(`Failed to fetch user details: ${error.message}`);
    }
  };

    // Fetch Portfolio and Wallet Data
    useEffect(() => {
        const fetchPortfolioAndWallets = async () => {
            try {
                const portfolioData = await getPortfolio();
                setPortfolio(portfolioData);

                // Automatically create a wallet if none exists
                const walletData = await createWallet();
                setWallets(walletData);

                if (walletData?.wallets?.length > 0) {
                    walletData.wallets.forEach(wallet => {
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

    // Fetch Transaction Details
    const fetchTransactionDetails = async (walletAddress, network) => {
        let apiUrl = "";

        if (network === "POLYGON_TESTNET_AMOY") {
            apiUrl = `https://api-amoy.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc`;
        } else if (network === "APTOS_TESTNET") {
            apiUrl = `https://api.testnet.aptoslabs.com/v1/accounts/${walletAddress}/transactions`;
        }

        try {
            const response = await axios.get(apiUrl);
            if (response.data.status === "1" || response.data.success) {
                setTransactionDetails(response.data.result || response.data.transactions);
            } else {
                setTransactionDetails([]);
            }
        } catch (err) {
            setError("Failed to fetch transactions.");
        }
    };

    // Transfer Tokens
    const handleTransferTokens = async (e) => {
        e.preventDefault();
        try {
            const response = await transferTokens(transferData);
            setTransferResponse(response);
            setActiveSection('transferResponse');
        } catch (err) {
            setError(`Failed to transfer tokens: ${err.message}`);
        }
    };

    // Handle input change for token transfer
    const handleInputChange = (e) => {
        setTransferData({ ...transferData, [e.target.name]: e.target.value });
    };

    // Handle input change for order check
    const handleInputChangeOrders = (e) => {
        setOrderData({ ...orderData, [e.target.name]: e.target.value });
    };

    // Navigate to other pages
   

    const navSwap = () => {
        navigate("/swap");
    };

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

            <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
                <GridItem>
                    {/* Portfolio and Transactions */}
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
                                        <Text>Amount: {transaction.value / 1e18} {transaction.tokenSymbol || 'POL'}</Text>
                                        <Text>Timestamp: {new Date(transaction.timeStamp * 1000).toLocaleString()}</Text>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <Box mt={9}>
                        <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
                            Transfer Tokens:
                        </Text>
                        <form onSubmit={handleTransferTokens}>
                            <Input
                                name="network_name"
                                value={transferData.network_name}
                                onChange={handleInputChange}
                                placeholder="Network Name"
                                mb={3}
                                required
                                _placeholder={{ color: 'gray.400' }}
                            />
                            <Input
                                name="token_address"
                                value={transferData.token_address}
                                onChange={handleInputChange}
                                placeholder="Token Address"
                                mb={3}
                                required
                                _placeholder={{ color: 'gray.400' }}
                            />
                            <Input
                                name="quantity"
                                value={transferData.quantity}
                                onChange={handleInputChange}
                                placeholder="Quantity"
                                mb={3}
                                required
                                _placeholder={{ color: 'gray.400' }}
                            />
                            <Input
                                name="recipient_address"
                                value={transferData.recipient_address}
                                onChange={handleInputChange}
                                placeholder="Recipient Address"
                                mb={3}
                                required
                                _placeholder={{ color: 'gray.400' }}
                            />
                            <Button type="submit" colorScheme="blue" mb={3}>Transfer Tokens</Button>
                        </form>
                        {activeSection === 'transferResponse' && transferResponse && (
                            <Box>
                                <Text fontWeight="bold" color="white">Transfer Response:</Text>
                                <pre>{JSON.stringify(transferResponse, null, 2)}</pre>
                            </Box>
                        )}
                    </Box>
                </GridItem>

                <GridItem>
                    {/* Wallets, Token Transfer and Order Check */}
                    <Box mb={6}>
                        <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
                            Wallet Addresses:
                        </Text>
                        <Stack spacing={4}>
                            {wallets && wallets.wallets
                                .filter(wallet => wallet.network_name.includes("TESTNET") || wallet.network_name.includes("BASE") || wallet.network_name.includes("AVA") || wallet.network_name.includes("DEVNET"))
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



                    <Box mt={9}>
                        <Text fontWeight="bold" fontSize="lg" mb={4} color="white">
                            Check Order Status:
                        </Text>
                        <form onSubmit={handleOrderCheck}>
                            <Input
                                name="order_id"
                                value={orderData.order_id}
                                onChange={handleInputChangeOrders}
                                placeholder="Order Id"
                                mb={3}
                                required
                                _placeholder={{ color: 'gray.400' }}
                            />
                            <Button type="submit" colorScheme="blue" mb={3}>Check Status</Button>
                        </form>
                        {activeSection === 'orderResponse' && orderResponse && (
                            <Box>
                                <Text fontWeight="bold" color="white">Order Status:</Text>
                                <pre>{JSON.stringify(orderResponse, null, 2)}</pre>
                            </Box>
                        )}
                    </Box>
                    <Button onClick={navSwap} colorScheme="blue" mb={3}>Swap Tokens</Button>
                    <br></br>
                    <Button onClick={navWidget} colorScheme="blue" mb={3}>Open Wallet Modal</Button>
                </GridItem>
            </Grid>

            <Divider mb={6} />
        </Box>
    );
};

export default Home;
