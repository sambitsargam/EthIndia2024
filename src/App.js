import React, { useState } from 'react';
import { ChakraProvider, CSSReset, extendTheme } from "@chakra-ui/react";
import { OktoProvider, BuildType } from 'okto-sdk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/LoginPage";
import Home from './components/Home';
import IntegratedDeFiAdvisor from "./components/IntegratedDeFiAdvisor";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});
const OKTO_CLIENT_API_KEY = "709deb29-fbf4-4415-9967-f66ac0033f55";
function App() {
  console.log('App component rendered');
  const [authToken, setAuthToken] = useState(null);
  const handleLogout = () => {
    console.log("setting auth token to null")
    setAuthToken(null); // Clear the authToken
  };
  return (
    <Router>
      <OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
        <ChakraProvider theme={theme}>
          <CSSReset />
          <Routes>
            <Route path="/defi" element={<IntegratedDeFiAdvisor authToken={authToken} handleLogout={handleLogout} />} />
            <Route path="/" element={<LoginPage setAuthToken={setAuthToken} authToken={authToken} handleLogout={handleLogout} />} />
            <Route path="/home" element={authToken ? <Home authToken={authToken} handleLogout={handleLogout} /> : <Navigate to="/" />} />
          </Routes>
        </ChakraProvider>

      </OktoProvider>
    </Router>
  );
}
export default App;