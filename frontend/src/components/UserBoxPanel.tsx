'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import './UserBoxPanel.css';
import {API_URL} from "@/lib/utils";

type User = {
  id: string;
  username: string;
  profileImage?: string;
};

export default function UserBoxPanel() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First, check if user is logged in and get their info
    fetch(API_URL + '/isLoggedIn', {
      method: 'GET',
      credentials: 'include', // Important for cookies/sessions
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not logged in');
        }
        return res.json();
      })
      .then((data) => {
        console.log('isLoggedIn response:', data);
        
        // The response might contain user data directly or an ID
        // Adjust based on your API's actual response structure
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            username: data.user.username,
            profileImage: data.user.profileImage || data.user.avatar || data.user.picture,
          });
        } else if (data.id) {
          // If only ID is returned, fetch full user details
          return fetch(API_URL + '/user', {
            credentials: 'include',
          }).then(res => res.json());
        } else {
          throw new Error('Invalid response format');
        }
      })
      .then((userData) => {
        if (userData && !currentUser) {
          setCurrentUser({
            id: userData.id,
            username: userData.username,
            profileImage: userData.profileImage || userData.avatar || userData.picture,
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="userbox-panel">
        <div className="userbox-loading">
          <div className="userbox-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="userbox-panel">
        <div className="userbox-error">
          <span>Not logged in</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="userbox-panel">
      <motion.div
        className="userbox-item"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="userbox-avatar">
          <img
            src={currentUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
            alt={currentUser.username}
            draggable={false}
          />
        </div>
        <div className="userbox-name">{currentUser.username}</div>
      </motion.div>
    </div>
  );
}