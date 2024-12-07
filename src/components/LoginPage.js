import React from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = ({ setAuthToken, authToken, handleLogout }) => {
  console.log("LoginPage component rendered: ", authToken);
  const navigate = useNavigate();
  const { authenticate } = useOkto();

  // Styles
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    background: "#f0f4f8",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "#007bff",
    color: "#fff",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "#6c757d",
    color: "#fff",
  };

  const handleGoogleLogin = async (credentialResponse) => {
    console.log("Google login response:", credentialResponse);
    const idToken = credentialResponse.credential;
    console.log("Google ID Token: ", idToken);
    authenticate(idToken, async (authResponse, error) => {
      if (authResponse) {
        console.log("Authentication successful: ", authResponse);
        setAuthToken(authResponse.auth_token);
        navigate("/home");
      }
      if (error) {
        console.error("Authentication error:", error);
      }
    });
  };

  const onLogoutClick = () => {
    handleLogout(); // Clear the authToken
    navigate("/"); // Navigate back to the login page
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>Welcome to SimpleFi Hub</h1>
      <p style={{ textAlign: "center", color: "#555", marginBottom: "20px" }}>
        Seamlessly manage your finances, explore investments, and get advice from our AI advisor.
      </p>

      {!authToken ? (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={(error) => {
            console.log("Login Failed", error);
          }}
          useOneTap
          promptMomentNotification={(notification) =>
            console.log("Prompt moment notification:", notification)
          }
        />
      ) : (
        <button style={primaryButtonStyle} onClick={onLogoutClick}>
          Logout
        </button>
      )}

      {/* Buttons Section */}
      <div style={buttonContainerStyle}>
        <button
          style={primaryButtonStyle}
          onClick={() => navigate("/swap")}
        >
          Go to Swap
        </button>
        <button
          style={primaryButtonStyle}
          onClick={() => navigate("/valut")}
        >
          Private Vault
        </button>
        <button
          style={primaryButtonStyle}
          onClick={() => navigate("/defi")}
        >
          AI Advisor
        </button>
        <button
          style={secondaryButtonStyle}
          onClick={() =>
            window.open("http://localhost:3001", "_blank", "noopener,noreferrer")
          }
        >
          Investment Ideas
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
