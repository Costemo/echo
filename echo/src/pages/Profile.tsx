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
    const [isFollowed, setIsFollowed] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const currentUserId = localStorage.getItem('userId'); // Assume you store current user's ID in localStorage

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

            // Check if the user is already followed
            const followedResponse = await axios.get<boolean>(`http://localhost:5000/api/user/${userId}/isFollowed`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsFollowed(followedResponse.data);

            // Check if the user is already a friend
            const friendResponse = await axios.get<boolean>(`http://localhost:5000/api/user/${userId}/isFriend`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsFriend(friendResponse.data);
        } catch (err) {
            const fetchError = err as FetchError;
            console.error('Error fetching user:', fetchError.message || fetchError);
            setError('Error fetching user');
        }
    };

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const url = isFollowed ? `http://localhost:5000/api/user/${id}/unfollow` : `http://localhost:5000/api/user/${id}/follow`;
            await axios.post(url, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsFollowed(!isFollowed);
        } catch (err) {
            console.error('Error updating follow status:', err);
        }
    };

    const handleFriend = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const url = isFriend ? `http://localhost:5000/api/user/${id}/removeFriend` : `http://localhost:5000/api/user/${id}/addFriend`;
            await axios.post(url, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setIsFriend(!isFriend);
        } catch (err) {
            console.error('Error updating friend status:', err);
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
                    {currentUserId !== id && (
                        <>
                            <button onClick={handleFollow}>
                                {isFollowed ? 'Unfollow' : 'Follow'}
                            </button>
                            <button onClick={handleFriend}>
                                {isFriend ? 'Remove Friend' : 'Add Friend'}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;
