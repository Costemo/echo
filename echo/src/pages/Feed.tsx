import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Feed.css';

const Feed = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/signin'); 
    };

    return (
        <div className="feed-container">
            <header className="header">
                <h1>Echo Feed</h1>
            </header>
            <div className="sidebar">
                <ul>
                    <li><Link to="/groups">Groups</Link></li>
                    <li><Link to="/friends">Friends</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/espaces">e.Spaces</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li> 
                </ul>
            </div>
            <main className="content">
                <div className="post">
                    <p>Post 1: This is an example of a 3D bubble post.</p>
                </div>
                <div className="post">
                    <p>Post 2: Another example post styled as a bubble.</p>
                </div>
            </main>
        </div>
    );
};

export default Feed;
