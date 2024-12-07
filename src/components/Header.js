import React from "react";
import { Box, Flex, Heading, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function Header() {
  return (
    <Box bg="blue.500" px={4} py={3}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="lg" color="white">
          DeFi Advisor
        </Heading>
        <Flex>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="whiteAlpha"
            variant="ghost"
            mr={3}
          >
            Dashboard
          </Button>
          <Button
            as={RouterLink}
            to="/chat"
            colorScheme="whiteAlpha"
            variant="ghost"
          >
            Chat
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
