import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchBar.css';

type User = {
    id: number;
    username: string;
};

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);

    useEffect(() => {
        if (query.length > 0) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get(`/api/auth/users/search?q=${query}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    console.log('Search results:', response.data); // Log search results
                    setResults(Array.isArray(response.data) ? response.data : []);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setResults([]);
                }
            };

            fetchUsers();
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
            />
            {results.length > 0 && (
                <ul className="search-results">
                    {results.map(user => (
                        <li key={user.id}>
                            <a href={`/profile/${user.id}`}>{user.username}</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
