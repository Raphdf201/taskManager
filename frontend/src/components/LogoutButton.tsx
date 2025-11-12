import { motion } from 'motion/react';
import { VscSignOut } from 'react-icons/vsc';
import './LogoutButton.css';

type LogoutButtonProps = {
  onLogout: () => void;
};

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <motion.button
      className="logout-button"
      onClick={onLogout}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <VscSignOut size={20} />
      <span className="logout-text">Déconnexion</span>
    </motion.button>
  );
}