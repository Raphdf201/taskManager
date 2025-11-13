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
    console.log('Starting auth check...', API_URL);
    
    fetch(API_URL + '/isLoggedIn', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
          throw new Error('Not logged in');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Full isLoggedIn response:', JSON.stringify(data, null, 2));
        
        if (data.user) {
          console.log('Found user in data.user:', data.user);
          setCurrentUser({
            id: data.user.id,
            username: data.user.username,
            profileImage: data.user.profileIcon,
          });
          setIsLoading(false);
        } else if (data.id) {
          console.log('Found ID, fetching full user details...');
          return fetch(API_URL + '/user', {
              credentials: 'include',
          })
            .then(res => {
              console.log('User endpoint status:', res.status);
              return res.json();
            })
            .then((userData) => {
              console.log('User data:', userData);
              setCurrentUser({
                id: userData.id,
                username: userData.username,
                profileImage: userData.profileIcon,
              });
              setIsLoading(false);
            });
        } else {
          console.log('No user or id found in response');
          throw new Error('Invalid response format');
        }
      })
      .catch((err) => {
        console.error('Error caught:', err);
        console.error('Error message:', err.message);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  console.log('Current state:', { currentUser, isLoading, error });

  if (isLoading) {
    return (
      <div className="userbox-panel">
        <div className="userbox-loading">
          <div className="userbox-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="userbox-panel">
        <div className="userbox-error">
          <span>Not logged in</span>
        </div>
      </div>
    );
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