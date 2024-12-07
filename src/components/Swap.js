import React, { useState } from "react";
import { useOkto } from "okto-sdk-react";

const SwapPage = () => {
  const { createWallet, transferTokens } = useOkto();
  const [swapResponse, setSwapResponse] = useState(null);
  const [error, setError] = useState(null);
  const [swapData, setSwapData] = useState({
    from_network: "polygon",  // Default starting network
    to_network: "base",  // Default ending network
    quantity: "",
  });

  const handleSwapTokens = async (e) => {
    e.preventDefault();
    try {
      // Create wallet instance and fetch addresses
      const walletData = await createWallet();
      const { fromAddress, toAddress } = walletData;

      // Assuming the SDK handles the swap with the provided data
      const response = await transferTokens({
        ...swapData,
        from_address: fromAddress,
        to_address: toAddress,
      });

      setSwapResponse(response);
    } catch (error) {
      setError(`Failed to swap tokens: ${error.message}`);
    }
  };

  const handleSwapInputChange = (e) => {
    setSwapData({ ...swapData, [e.target.name]: e.target.value });
  };

  // Styles for UI
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    backgroundColor: "#f4f7fc",
    minHeight: "100vh",
  };

  const headerStyle = {
    color: "#333",
    marginBottom: "30px",
    fontSize: "32px",
    fontWeight: "700",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "30px",
  };

  const inputStyle = {
    margin: "12px 0",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    width: "100%",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold", // Make the text bold
    textTransform: "uppercase", // Make text uppercase
    transition: "background-color 0.3s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "#45a049",
  };

  const swapResponseStyle = {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e8f5e9",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
  };

  const errorStyle = {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f8d7da",
    borderRadius: "8px",
    color: "#721c24",
    width: "100%",
    maxWidth: "400px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Swap Tokens</h1>

      {/* Token Swap Form */}
      <form style={formStyle} onSubmit={handleSwapTokens}>
        <input
          style={inputStyle}
          type="text"
          name="from_network"
          placeholder="From Network (e.g., Polygon)"
          value={swapData.from_network}
          onChange={handleSwapInputChange}
          required
        />
        <input
          style={inputStyle}
          type="text"
          name="to_network"
          placeholder="To Network (e.g., Base)"
          value={swapData.to_network}
          onChange={handleSwapInputChange}
          required
        />
        <input
          style={inputStyle}
          type="text"
          name="quantity"
          placeholder="Quantity to Swap"
          value={swapData.quantity}
          onChange={handleSwapInputChange}
          required
        />
        <button
          style={buttonStyle}
          type="submit"
          onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Swap Tokens
        </button>
      </form>

      {/* Swap Response */}
      {swapResponse && (
        <div style={swapResponseStyle}>
          <h3>Swap Successful!</h3>
          <pre>{JSON.stringify(swapResponse, null, 2)}</pre>
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div style={errorStyle}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SwapPage;
