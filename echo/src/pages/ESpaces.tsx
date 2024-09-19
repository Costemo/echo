import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./ESpaces.css";

interface Space {
    id: number;
    name: string;
    description: string;
}

const ESpaces: React.FC = () => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [newSpace, setNewSpace] = useState({ name: '', description: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found in localStorage");
                }

                console.log('Fetching e.Spaces with token:', token);

                const response = await axios.get<Space[]>('http://localhost:5000/api/espaces', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log('Fetched e.Spaces:', response.data);
                setSpaces(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("Error fetching e.Spaces", err.response?.data || err.message);
                } else {
                    console.error("Unexpected error", err);
                }
                setError('Failed to fetch e.Spaces');
            }
        };

        fetchSpaces();
    }, []);

    const handleAddSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found in localStorage");
            }
    
            console.log('Adding e.Space with token:', token);
    
            // Send the POST request
            const response = await axios.post<string>('http://localhost:5000/api/espaces/add', newSpace, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
    
            console.log('Added e.Space:', response.data);
    
            // Check if response contains the message you sent
            if (response.data === 'eSpace Created') {
                // Refresh the list of spaces
                const updatedSpaces = await axios.get<Space[]>('http://localhost:5000/api/espaces', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setSpaces(updatedSpaces.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Unexpected response format');
            }
    
            setNewSpace({ name: '', description: '' });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Error adding e.Space", err.response?.data || err.message);
                setError(`Failed to add e.Space: ${err.response?.data?.message || err.message}`);
            } else {
                console.error("Unexpected error", err);
                setError('Failed to add e.Space');
            }
        }
    };
    
    

    const handleDeleteSpace = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found in localStorage");
            }

            console.log('Deleting e.Space with token:', token);

            await axios.delete(`http://localhost:5000/api/espaces/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Deleted e.Space with id:', id);
            setSpaces(spaces.filter(space => space.id !== id));
        } catch (err) {
            console.error("Error deleting e.Space", err);
            setError('Failed to delete e.Space');
        }
    };

    return (
        <div className="espaces-container">
            <div className="espaces-box">
                <h1>e.Spaces</h1>
                <form onSubmit={handleAddSpace}>
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={newSpace.name}
                            onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description:</label>
                        <input
                            type="text"
                            id="description"
                            value={newSpace.description}
                            onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit">Add e.Space</button>
                </form>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <ul>
                    {spaces.length > 0 ? (
                        spaces.map(space => (
                            <li key={space.id}>
                                <h2>{space.name}</h2>
                                <p>{space.description}</p>
                                <button onClick={() => handleDeleteSpace(space.id)}>Delete</button>
                            </li>
                        ))
                    ) : (
                        <p>No spaces available</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ESpaces;
