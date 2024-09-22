import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Posts from '../components/Posts';
import './Feed.css';

type User = {
    id: number;
    username: string;
};

const Feed: React.FC = () => {
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const userId = parseInt(localStorage.getItem('userId') || '0');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/signin');
    };

    const handleSearchResults = useCallback((results: User[]) => {
        setSearchResults(results);
    }, []);

    const toggleSidebar = () => {
        setSidebarVisible(prev => !prev);
    };

    return (
        <div className="feed-container">
            <header className="header">
                <h1>Echo Feed</h1>
                <div className="button-container">
                    <button className="toggle-sidebar-button" onClick={toggleSidebar}>☰</button>
                    <button className={`feed-button ${!showSearch ? 'active' : ''}`} onClick={() => setShowSearch(false)}>Feed</button>
                    <button className={`feed-button ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(true)}>Search</button>
                </div>
            </header>
            {sidebarVisible && (
                <aside className="sidebar">
                    <ul>
                        <li><Link to="/groups">Groups</Link></li>
                        <li><Link to="/friends">Friends</Link></li>
                        <li>
                            <Link to={userId ? `/profile/${userId}` : '/signin'}>
                                Profile
                            </Link>
                        </li>
                        <li><Link to="/espaces">e.Spaces</Link></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </ul>
                </aside>
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
                        ) : <p>No search results.</p>}
                    </div>
                ) : (
                    <Posts userId={userId} />
                )}
            </main>
        </div>
    );
};

export default Feed;
