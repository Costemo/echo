import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

interface ESpacePostsProps {
    spaceId: number;
}

const ESpacePosts: React.FC<ESpacePostsProps> = ({ spaceId }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchESpacePosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found in localStorage');
            }

            const response = await axios.get<Post[]>(`http://localhost:5000/api/espaces/${spaceId}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching eSpace posts:', err);
            setError('Failed to fetch eSpace posts');
        }
    };

    const createESpacePost = async () => {
        if (!title && !body) {
            setError('Post must have a title or body');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts`, { title, body }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setTitle('');
            setBody('');
            fetchESpacePosts();
        } catch (err) {
            console.error('Error creating eSpace post:', err);
            setError('Failed to create eSpace post');
        }
    };

    useEffect(() => {
        fetchESpacePosts();
    }, [spaceId]);

    return (
        <div>
            <h2>eSpace Posts</h2>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title"
            />
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Post Body"
            />
            <button onClick={createESpacePost}>Create Post</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {posts.map((post) => (
                    <li key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.body}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ESpacePosts;
