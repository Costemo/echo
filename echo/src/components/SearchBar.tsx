import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

type User = {
    id: number;
    username: string;
};

type ESpace = {
    id: number;
    name: string;
};

interface SearchBarProps {
    onSearchResults: (results: { users: User[]; eSpaces: ESpace[] }) => void;
}


const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');
    const [userResults, setUserResults] = useState<User[]>([]);
    const [eSpaceResults, setESpaceResults] = useState<ESpace[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        let isCancelled = false;

        if (query.length > 0) {
            const fetchResults = async () => {
                try {
                    const [userResponse, eSpaceResponse] = await Promise.all([
                        axios.get('http://localhost:5000/api/user/search', {
                            params: { q: query },
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }),
                        axios.get('http://localhost:5000/api/espaces/search', {
                            params: { q: query },
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        })
                    ]);

                    
if (!isCancelled) {
    const userData = Array.isArray(userResponse.data) ? userResponse.data : [];
    const eSpaceData = Array.isArray(eSpaceResponse.data) ? eSpaceResponse.data : [];
    setUserResults(userData);
    setESpaceResults(eSpaceData);
    onSearchResults({ users: userData, eSpaces: eSpaceData }); 
}

                } catch (error) {
                    console.error('Error fetching results:', error);
                    if (!isCancelled) {
                        setUserResults([]);
                        setESpaceResults([]);
                        onSearchResults([]);
                    }
                }
            };

            fetchResults();
        } else {
            setUserResults([]);
            setESpaceResults([]);
            onSearchResults({ users: [], eSpaces: [] }); 
        }
        

        return () => {
            isCancelled = true;
        };
    }, [query, onSearchResults]);

    const handleResultClick = (id: number, type: 'user' | 'espace') => {
        navigate(`/${type === 'user' ? 'profile' : 'espaces'}/${id}`);
    };

    return (
        <div className="search-bar">
            <label htmlFor="searchInput">Search Users or e.Spaces:</label>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users or e.Spaces..."
                name="searchQuery"
                id="searchInput"
            />
            {(userResults.length > 0 || eSpaceResults.length > 0) && (
                <ul className="search-results">
                    {userResults.map(user => (
                        <li key={user.id} onClick={() => handleResultClick(user.id, 'user')}>
                            {user.username} (User)
                        </li>
                    ))}
                    {eSpaceResults.map(eSpace => (
                        <li key={eSpace.id} onClick={() => handleResultClick(eSpace.id, 'espace')}>
                            {eSpace.name} (e.Space)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
