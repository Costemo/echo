import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar'; // Adjust the path as necessary
import './Feed.css';

const Feed = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        localStorage.removeItem('userId'); // Remove userId on logout
        navigate('/signin'); 
    };

    const userId = localStorage.getItem('userId'); // Retrieve userId

    console.log('Retrieved userId:', userId); // Debugging line

    return (
        <div className="feed-container">
            <header className="header">
                <h1>Echo Feed</h1>
                <SearchBar />
            </header>
            <div className="sidebar">
                <ul>
                    <li><Link to="/groups">Groups</Link></li>
                    <li><Link to="/friends">Friends</Link></li>
                    {userId ? (
                        <li><Link to={`/profile/${userId}`}>Profile</Link></li>
                    ) : (
                        <li><Link to="/signin">Profile</Link></li>
                    )}
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
