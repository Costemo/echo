import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Post = {
    id: number;
    userId: number;
    username: string;
    title: string;
    body: string;
};

type NewPost = {
    title: string;
    body: string;
};

type PostsProps = {
    userId: number;
};

const Posts: React.FC<PostsProps> = ({ userId }) => {
    const [creatingPost, setCreatingPost] = useState(false);
    const [newPost, setNewPost] = useState<NewPost>({ title: '', body: '' });
    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.get('http://localhost:5000/api/posts', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(response.data.map((post: any) => ({ ...post, userId: post.user_id })));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title && !newPost.body) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.post('http://localhost:5000/api/posts', newPost, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => [{ ...response.data, userId }, ...prevPosts]);
            setCreatingPost(false);
            setNewPost({ title: '', body: '' });
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            {creatingPost && (
                <div className="post-bubble">
                    <input
                        type="text"
                        placeholder="Optional title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Post body"
                        value={newPost.body}
                        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    />
                    <button onClick={handleCreatePost}>Submit</button>
                </div>
            )}
            <div className="posts-container">
                {posts.map(post => (
                    <div key={post.id} className="post">
                        <p className="post-username">{post.username}</p>
                        <p className="post-title">{post.title}</p>
                        <p className="post-body">{post.body}</p>
                        {post.userId === userId && (
                            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
            <button className="feed-button" onClick={() => setCreatingPost(prev => !prev)}>+</button>
        </div>
    );
};

export default Posts;
