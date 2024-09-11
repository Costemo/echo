import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DecodedToken {
    id: string; 
}

interface User {
    id: string;
    username: string;
}

interface FetchError extends Error {
    response?: {
        data: {
            message: string;
        };
        status: number;
        headers: Record<string, string>;
    };
}

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parseJwt = (token: string): DecodedToken | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            console.log('Decoded JWT payload:', jsonPayload); 
            const parsedPayload = JSON.parse(jsonPayload);
            console.log('Parsed JWT payload:', parsedPayload);

            return parsedPayload as DecodedToken;
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    };

    const fetchUser = async (userId: string) => {
        try {
            const token = localStorage.getItem('token'); 
            if (!token) throw new Error('No token found');

            console.log('Fetching user with ID:', userId);
            const response = await axios.get<User>(`http://localhost:5000/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (err) {
            const fetchError = err as FetchError;
            setError('Error fetching user');
            console.error('Error fetching user:', fetchError.message || fetchError);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = parseJwt(token); 
            if (decodedToken && decodedToken.id) {
                fetchUser(decodedToken.id); 
            } else {
                setError('Invalid token');
            }
        } else {
            setError('No token found');
        }
    }, []);

    return (
        <div>
            {error && <p>{error}</p>}
            {user ? (
                <div>
                    <h1>{user.username}</h1>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;
