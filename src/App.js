import React from "react";
import { ChakraProvider, CSSReset, extendTheme } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IntegratedDeFiAdvisor from "./components/IntegratedDeFiAdvisor";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/ai" element={<IntegratedDeFiAdvisor />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
