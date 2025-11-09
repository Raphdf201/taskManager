import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import Aurora from "./Components/Aurora";
import HomeText from "./Components/HomeText";
import RotatingText from "./Components/RotatingText";
import CircularGallery from "./Components/CircularGallery";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          backgroundColor: "#000000",
        }}
      >
        {/* Aurora Background */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Aurora
            colorStops={["#ffff2e", "#ed8ef5", "#000000"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>

        {/* Content Layer */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HomeText
            text={["Bonjour, Samy!"]}
            as="h1"
            typingSpeed={80}
            deletingSpeed={40}
            pauseDuration={10}
            loop={true}
            showCursor={true}
            textColors={["#ffffffff", "#fffffff", "#ffffff"]}
            className="centered-text"
          />
          <div className="rotating-text-container">
            <span className="welcome-text">Bienvenue </span>
            <RotatingText
              texts={["chez 3990!", "en comm!"]}
              mainClassName="rotating-text-styled"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.005}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
          <div className="circular-gallery-container">
            <CircularGallery
              bend={3}
              borderRadius={0.15}
              scrollEase={0.02}
            />
          </div>

          <App />
        </div>
      </div>
    </StrictMode>
  );
}
