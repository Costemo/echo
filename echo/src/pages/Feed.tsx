import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import './Feed.css';

type User = {
    id: number;
    username: string;
};

const Feed = () => {
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [creatingPost, setCreatingPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', body: '' });
    const [posts, setPosts] = useState<{ id: number; userId: number; username: string; title: string; body: string }[]>([]);

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

    const handleCreatePost = async () => {
        if (!newPost.title && !newPost.body) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.post('http://localhost:5000/api/posts', newPost, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Include userId in the newly created post
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
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const response = await axios.get('http://localhost:5000/api/posts', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                // Ensure posts include userId for comparison
                setPosts(response.data.map(post => ({ ...post, userId: post.user_id })));
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="feed-container">
            <header className="header">
                <h1>Echo Feed</h1>
                <div className="button-container">
                    <button className="toggle-sidebar-button" onClick={toggleSidebar}>☰</button>
                    <button className={`feed-button ${!showSearch ? 'active' : ''}`} onClick={() => setShowSearch(false)}>Feed</button>
                    <button className={`feed-button ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(true)}>Search</button>
                    <button className="feed-button" onClick={() => setCreatingPost(prev => !prev)}>+</button>
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
                )}
            </main>
        </div>
    );
};

export default Feed;
