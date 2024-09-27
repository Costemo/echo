import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Posts.css';

type Comment = {
    id: number;
    userId: number;
    comment: string;
};

type Post = {
    id: number;
    userId: number;
    username: string;
    title: string;
    body: string;
    comments?: Comment[];
    liked?: boolean;
    disliked?: boolean;
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
    const [comment, setComment] = useState('');

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.get('http://localhost:5000/api/posts', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(response.data.map((post: any) => ({
                ...post,
                userId: post.user_id,
                comments: post.comments || [] 
            })));
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

            setPosts(prevPosts => [{ ...response.data, userId, comments: [] }, ...prevPosts]);
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

    const handleLikePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { ...post, liked: true } : post
            ));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDislikePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/dislike`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { ...post, disliked: true } : post
            ));
        } catch (error) {
            console.error('Error disliking post:', error);
        }
    };

    const handleCommentPost = async (postId: number) => {
        if (!comment) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, { comment }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { ...post, comments: [...(post.comments || []), response.data] } : post
            ));
            setComment('');
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };

    const handleSharePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
    
            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/share`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            const sharedPost = response.data;
    
            
            const currentUserUsername = localStorage.getItem('username');
            
            
            setPosts(prevPosts => [
                {
                    ...sharedPost,
                    sharedBy: currentUserUsername, 
                    originalUser: sharedPost.originalUser || sharedPost.user, 
                },
                ...prevPosts
            ]);
    
            console.log('Post shared successfully');
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };
    

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div>
            {creatingPost ? (
                <div>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newPost.title}
                        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Body"
                        value={newPost.body}
                        onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                    />
                    <button onClick={handleCreatePost}>Create Post</button>
                    <button onClick={() => setCreatingPost(false)}>Cancel</button>
                </div>
            ) : (
                <button onClick={() => setCreatingPost(true)}>New Post</button>
            )}

            {posts.map(post => (
                <div key={post.id} className="post-container">
                    <div className="post-username">{post.username}</div>
                    <div className="post-title">{post.title}</div>
                    <div className="post-body">{post.body}</div>
                    <div className="post-actions">
                        <button onClick={() => handleLikePost(post.id)}>Like</button>
                        <button onClick={() => handleDislikePost(post.id)}>Dislike</button>
                        <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                        <button onClick={() => handleSharePost(post.id)}>Share</button>
                    </div>
                    <div className="post-comments">
                        {post.comments && post.comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <div className="comment-username">{comment.userId}</div>
                                <div className="comment-text">{comment.comment}</div>
                            </div>
                        ))}
                        <input
                            type="text"
                            placeholder="Add a comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <button onClick={() => handleCommentPost(post.id)}>Comment</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Posts;
