import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './SpaceDetail.css'; 

import ESpacePosts from '../components/ESpacePosts';


interface Space {
    id: number;
    name: string;
    description: string;
}

const SpaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [space, setSpace] = useState<Space | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            console.error('Error fetching space:', err);
            setError('Failed to fetch space');
        }
    };

    useEffect(() => {
        fetchSpace();
    }, [id]);

    return (
        <div className="space-detail-container">
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {space ? (
                <>
                    <header className="space-detail-header">
                        <h1>{space.name}</h1>
                        <p>{space.description}</p>
                    </header>
                    <main className="space-detail-posts">
                        <ESpacePosts spaceId={parseInt(id)} />
                    </main>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default SpaceDetail;
