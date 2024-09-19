// src/pages/SpaceDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Space {
    id: number;
    name: string;
    description: string;
}

const SpaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [space, setSpace] = useState<Space | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found in localStorage');
                }

                const response = await axios.get<Space>(`http://localhost:5000/api/espaces/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setSpace(response.data);
            } catch (err) {
                console.error('Error fetching e.Space:', err);
                setError('Failed to fetch e.Space');
            }
        };

        fetchSpace();
    }, [id]);

    return (
        <div className="space-detail-container">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {space ? (
                <div>
                    <h1>{space.name}</h1>
                    <p>{space.description}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default SpaceDetail;
