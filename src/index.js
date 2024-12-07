import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google';


const root = ReactDOM.createRoot(document.getElementById('root'));
const GOOGLE_CLIENT_ID = "124157893528-0aoofe4vbc6b18e4p2lvqpmk5dkpdc32.apps.googleusercontent.com";
root.render(
 <React.StrictMode>
   <GoogleOAuthProvider clientId = {GOOGLE_CLIENT_ID}>
   <ChakraProvider>
     <App />
    </ChakraProvider>
   </GoogleOAuthProvider>
 </React.StrictMode>
);