import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Posts from '../components/Posts';
import './Feed.css';

type User = {
    id: number;
    username: string;
};

type ESpace = {
    id: number;
    name: string;
};

const Feed: React.FC = () => {
    const navigate = useNavigate();
    const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
    const [eSpaceSearchResults, setESpaceSearchResults] = useState<ESpace[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const userId = parseInt(localStorage.getItem('userId') || '0');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/signin');
    };

    const handleSearchResults = useCallback((results: { users: User[]; eSpaces: ESpace[] }) => {
        setUserSearchResults(results.users);
        setESpaceSearchResults(results.eSpaces);
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
        {(userSearchResults.length > 0 || eSpaceSearchResults.length > 0) ? (
            <div className="search-results">
                {userSearchResults.length > 0 && (
                    <div>
                        <h3>Users</h3>
                        <ul>
                            {userSearchResults.map(user => (
                                <li key={user.id} className="search-result-item">
                                    <Link to={`/profile/${user.id}`}>{user.username}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {eSpaceSearchResults.length > 0 && (
                    <div>
                        <h3>e.Spaces</h3>
                        <ul>
                            {eSpaceSearchResults.map(eSpace => (
                                <li key={eSpace.id} className="search-result-item">
                                    <Link to={`/eSpaces/${eSpace.id}`}>{eSpace.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
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
