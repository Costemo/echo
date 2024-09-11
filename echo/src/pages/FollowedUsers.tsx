
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FollowedUsers.css';

const FollowedUsers = () => {
    const [followedUsers, setFollowedUsers] = useState([]);

    useEffect(() => {
        const fetchFollowedUsers = async () => {
            try {
                const response = await axios.get('/api/users/followed');
                setFollowedUsers(response.data);
            } catch (error) {
                console.error('Error fetching followed users:', error);
            }
        };
        fetchFollowedUsers();
    }, []);

    return (
        <div className="followed-users-container">
            <h2>Followed Users</h2>
            <ul>
                {followedUsers.map(user => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
};

export default FollowedUsers;
