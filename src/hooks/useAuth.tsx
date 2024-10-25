// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from '@firebase/auth';
import app from '../firebase';

const auth = getAuth(app);

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return user;
};
