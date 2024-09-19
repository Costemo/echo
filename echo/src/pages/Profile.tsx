import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
    const { id } = useParams<{ id: string }>(); 
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetched, setIsFetched] = useState(false);

    const fetchUser = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            console.log('Fetching user with ID:', userId);
            const response = await axios.get<User>(`http://localhost:5000/api/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('User fetched:', response.data);
            setUser(response.data);
            setIsFetched(true);
        } catch (err) {
            const fetchError = err as FetchError;
            console.error('Error fetching user:', fetchError.message || fetchError);
            setError('Error fetching user');
        }
    };

    useEffect(() => {
        if (id && !isFetched) {
            fetchUser(id);
        }
    }, [id, isFetched]);

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
