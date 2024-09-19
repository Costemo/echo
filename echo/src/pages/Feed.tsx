import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar'; 
import './Feed.css';

type User = {
    id: number;
    username: string;
};

const Feed = () => {
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        localStorage.removeItem('userId'); 
        navigate('/signin'); 
    };

    const userId = localStorage.getItem('userId'); 

    const handleSearchResults = useCallback((results: User[]) => {
        setSearchResults(results);
    }, []);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <div className="feed-container">
            <header className="header">
                <h1>Echo Feed</h1>
                <div className="button-container">
                    <button
                        className="toggle-sidebar-button"
                        onClick={toggleSidebar}
                    >
                        ☰
                    </button>
                    <button
                        className={`feed-button ${!showSearch ? 'active' : ''}`}
                        onClick={() => setShowSearch(false)}
                    >
                        Feed
                    </button>
                    <button
                        className={`feed-button ${showSearch ? 'active' : ''}`}
                        onClick={() => setShowSearch(true)}
                    >
                        Search
                    </button>
                </div>
            </header>
            {sidebarVisible && (
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
            )}
            <main className="content">
                {showSearch ? (
                    <div className="search-bubble">
                        <SearchBar onSearchResults={handleSearchResults} />
                        {searchResults.length > 0 ? (
                            <ul className="search-results">
                                {searchResults.map(user => (
                                    <li key={user.id} className="search-result-item">
                                        <Link to={`/profile/${user.id}`}>{user.username}</Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No search results.</p>
                        )}
                    </div>
                ) : (
                    <div className="posts-container">
                        <p className="post">Post 1: This is an example of a 3D bubble post.</p>
                        <p className="post">Post 2: Another example post styled as a bubble.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Feed;
