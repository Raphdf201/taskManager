import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Aurora from "./components/Aurora";
import HomeText from "./components/HomeText";
import RotatingText from "./components/RotatingText";
import CircularGallery from "./components/CircularGallery";
import TargetCursor from "./components/TargetCursor";
import Dock from "./components/Dock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

// Create a proper App component
const App = () => {
  // Define dock items
  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "#000000",
      }}
    >
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
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
          justifyContent: "flex-start",
          padding: "2rem",
          paddingTop: "15rem",
          gap: "1rem",
        }}
      >
        {/* Text Components */}
        <HomeText
          text={["Bonjour, Samy!"]}
          as="h1"
          typingSpeed={120}
          deletingSpeed={40}
          pauseDuration={10}
          loop={true}
          showCursor={true}
          textColors={["#ffffffff", "#fffffff", "#ffffff"]}
          className="centered-text"
        />
        <div className="rotating-text-container">
          <span className="welcome-text">Bienvenue</span>
          <RotatingText
            texts={["chez 3990!", "en comm!"]}
            mainClassName="rotating-text-styled"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.015}
            splitLevelClassName="overflow-hidden"
            transition={{ type:"spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div className="circular-gallery-container">
            <CircularGallery bend={3} borderRadius={0.15} scrollEase={0.02} />
          </div>
        </div>
      </div>

      {/* Dock at the bottom */}
      <Dock 
        items={items}
        panelHeight={320}
        baseItemSize={56}
        magnification={70}
      />
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}