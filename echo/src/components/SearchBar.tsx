import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

type User = {
    id: number;
    username: string;
};

interface SearchBarProps {
    onSearchResults: (results: User[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        let isCancelled = false;

        if (query.length > 0) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/user/search', {
                        params: { q: query },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!isCancelled) {
                        const data = Array.isArray(response.data) ? response.data : [];
                        setResults(data);
                        onSearchResults(data);
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                    if (!isCancelled) {
                        setResults([]);
                        onSearchResults([]);
                    }
                }
            };

            fetchUsers();
        } else {
            setResults([]);
            onSearchResults([]);
        }

        return () => {
            isCancelled = true;
        };
    }, [query, onSearchResults]);

    const handleResultClick = (id: number) => {
        navigate(`/profile/${id}`);
    };

    return (
        <div className="search-bar">
            <label htmlFor="searchInput">Search Users:</label>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                name="searchQuery"
                id="searchInput"
            />
            {results.length > 0 && (
                <ul className="search-results">
                    {results.map(user => (
                        <li key={user.id} onClick={() => handleResultClick(user.id)}>
                            {user.username}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
