/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const page = () => {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const initializeUser = async () => {
      let currentUserId = localStorage.getItem('userId');
      let currentUserObjectId = localStorage.getItem('userObjectId');

      if (!currentUserId) {
        currentUserId = uuidv4();
        localStorage.setItem('userId', currentUserId);

        try {
          const response = await fetch('/api/saveUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUserId }),
          });

          const userData = await response.json();
          currentUserObjectId = userData._id;
          if (currentUserObjectId) {
            localStorage.setItem('userObjectId', currentUserObjectId);
          } else {
            console.log(
              'currentUserObjectId is null, not setting in localStorage'
            );
          }
        } catch (error) {
          console.error('Failed to create user', error);
          return;
        }
      }

      if (currentUserObjectId) {
        setUserId(currentUserObjectId);
        console.log(userId);
      }
    };

    initializeUser();
  }, [userId]);

  return <div>test page</div>;
};

export default page;
