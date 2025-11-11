    'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import './UserBoxPanel.css';

type User = {
  id: string;
  username: string;
  profileImage?: string;
};

export default function UserBoxPanel() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch last users from your API
    fetch('https://apidog.raphdf201.net/users')
      .then((res) => res.json())
      .then((data) => {
        // Assuming data is an array of users; sort or reverse for "latest"
        const lastUsers = Array.isArray(data) ? data.slice(-3).reverse() : [];
        setUsers(lastUsers);
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  return (
    <div className="userbox-panel">
      {users.map((user) => (
        <motion.div
          key={user.id}
          className="userbox-item"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="userbox-avatar">
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt={user.username}
              draggable={false}
            />
          </div>
          <div className="userbox-name">{user.username}</div>
        </motion.div>
      ))}
    </div>
  );
}
