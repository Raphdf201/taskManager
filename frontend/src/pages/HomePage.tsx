import Aurora from "../components/Aurora";
import HomeText from "../components/HomeText";
import RotatingText from "../components/RotatingText";
import CircularGallery from "../components/CircularGallery";
import Dock from "../components/Dock";
import {
  VscHome,
  VscChecklist,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";
import TargetCursor from "../components/TargetCursor";
import UserBoxPanel from "../components/UserBoxPanel";
import LogoutButton from "../components/LogoutButton";

type HomePageProps = {
  onLogout: () => void;
};

export default function HomePage({ onLogout }: HomePageProps) {
  const items = [
    {
      icon: <VscHome size={18} />,
      label: "Menu",
      onClick: () => alert("Menu!"),
    },
    {
      icon: <VscChecklist size={18} />,
      label: "Tâches",
      onClick: () => alert("Tâches!"),
    },
    {
      icon: <VscAccount size={18} />,
      label: "Membres",
      onClick: () => alert("Membres!"),
    },
    {
      icon: <VscSettingsGear size={18} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
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
      <LogoutButton onLogout={onLogout} />
      
      <div style={{ position: "absolute", inset: 0 }}>
        <Aurora
          colorStops={["#ffff2e", "#ed8ef5", "#000000"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <TargetCursor
        spinDuration={0}
        hideDefaultCursor={true}
        parallaxOn={true}
      />

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
        <HomeText
          text={["Bonjour, Samy!"]}
          as="h1"
          typingSpeed={120}
          deletingSpeed={60}
          pauseDuration={10000}
          loop={true}
          showCursor={true}
          textColors={["#ffffffff", "#fffffff", "#ffffff"]}
          className="centered-text"
        />
        <div className="rotating-text-container" style={{ marginTop: '-1rem' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginRight: '1rem' }}>
            <span className="welcome-text">
              <span>B</span><span>i</span><span>e</span><span>n</span><span>v</span><span>e</span><span>n</span><span>u</span><span>e</span>
            </span>
            <div className="welcome-underline"></div>
          </div>
          <RotatingText
            texts={["chez T4K!", "en comm!"]}
            mainClassName="rotating-text-styled"
            staggerFrom="first"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.015}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "spring", damping: 30, stiffness: 500 }}
            rotationInterval={1500}
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
            <CircularGallery
              bend={0.3}
              borderRadius={0.15}
              scrollEase={0.02}
            />
          </div>
        </div>
      </div>

      <UserBoxPanel />

      <Dock
        items={items}
        panelHeight={90}
        baseItemSize={70}
        magnification={75}
        distance={150}
        spring={{
          mass: 0.15,
          stiffness: 200,
          damping: 15,
        }}
      />
    </div>
  );
}