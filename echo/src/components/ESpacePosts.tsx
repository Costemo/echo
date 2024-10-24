import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaThumbsUp, FaThumbsDown, FaComment, FaShareSquare, FaReply } from 'react-icons/fa';
import './ESpacePosts.css'; // Ensure to import the same CSS file

interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
    profilePicture: string; // Added for user profile picture
    username: string; // Added for username
    likeCount: number; // Added for like count
    dislikeCount: number; // Added for dislike count
    comments?: Comment[];
}

interface Comment {
    id: number;
    body: string; // Changed from 'body' to 'comment' for consistency
    userId: number;
    profilePicture: string; // Added for user profile picture
    username: string; // Added for username
    likes: number; // Added for like count
    dislikes: number; // Added for dislike count
    replies?: Reply[];
}

interface Reply {
    id: number;
    body: string; // Changed from 'body' to 'reply' for consistency
    userId: number;
    profilePicture: string; // Added for user profile picture
    username: string; // Added for username
}

interface ESpacePostsProps {
    spaceId: number;
}

const ESpacePosts: React.FC<ESpacePostsProps> = ({ spaceId }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState({ title: '', body: '' }); // Added state for new post
    const [error, setError] = useState<string | null>(null);
    const [comment, setComment] = useState<string>('');
    const [reply, setReply] = useState<{ [key: number]: string }>({});
    const [commentVisible, setCommentVisible] = useState<{ [key: number]: boolean }>({});
    const [creatingPost, setCreatingPost] = useState(false); // Added state for creating post

    const fetchESpacePosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.get<Post[]>(`http://localhost:5000/api/espaces/${spaceId}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching eSpace posts:', err);
            setError('Failed to fetch eSpace posts');
        }
    };

    const createESpacePost = async () => {
        if (!newPost.title && !newPost.body) {
            setError('Post must have a title or body');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts`, { title: newPost.title, body: newPost.body }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNewPost({ title: '', body: '' });
            fetchESpacePosts();
        } catch (err) {
            console.error('Error creating eSpace post:', err);
            setError('Failed to create eSpace post');
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error.message);
        }
    };

    const handleLikePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchESpacePosts();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDislikePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/dislike`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchESpacePosts(); 
        } catch (error) {
            console.error('Error disliking post:', error);
        }
    };

    const handleCommentPost = async (postId: number) => {
        if (!comment) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/comment`, 
            { body: comment }, // Changed to match Comment interface
            {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { 
                    ...post, 
                    comments: [...(post.comments || []), { ...response.data, replies: [] }] 
                } : post
            ));
            setComment('');
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };

    const handleLikeComment = async (postId: number, commentId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/comments/${commentId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            // Update the local state to reflect the like
            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId 
                ? { 
                    ...post, 
                    comments: post.comments?.map(comment => 
                        comment.id === commentId 
                        ? { ...comment, likes: comment.likes + 1 } // Increment like count
                        : comment
                    ) 
                } 
                : post
            ));
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };
    

    const handleDislikeComment = async (postId: number, commentId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/comments/${commentId}/dislike`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchESpacePosts(); 
        } catch (error) {
            console.error('Error disliking comment:', error);
        }
    };

    const handleReplyToComment = async (postId: number, commentId: number) => {
        const replyText = reply[commentId];
        if (!replyText) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5000/api/espaces/${spaceId}/posts/${postId}/comments/${commentId}/reply`, 
                { body: replyText }, // Changed to match Reply interface
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const newReply = response.data;

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { 
                    ...post, 
                    comments: post.comments?.map(comment => 
                        comment.id === commentId 
                            ? { ...comment, replies: [...(comment.replies || []), newReply] } 
                            : comment
                    ) 
                } : post
            ));
            setReply(prev => ({ ...prev, [commentId]: '' }));
        } catch (error) {
            console.error('Error replying to comment:', error);
        }
    };

    const handleToggleComment = (postId: number) => {
        setCommentVisible(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    useEffect(() => {
        fetchESpacePosts();
    }, [spaceId]);

    return (
        <div className="posts-container">
            <button className="create-post-button" onClick={() => setCreatingPost(!creatingPost)}>
                {creatingPost ? 'Cancel' : 'Create Post'}
            </button>
            {creatingPost && (
                <div className="create-post-form">
                    <input
                        type="text"
                        placeholder="Post Title"
                        value={newPost.title}
                        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Post Body"
                        value={newPost.body}
                        onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                    />
                    <button onClick={createESpacePost}>Submit Post</button>
                </div>
            )}
            {posts.map(post => (
                <div key={post.id} className="post">
                    <div className="post-header">
                        <img src={post.profilePicture} alt={post.username} className="profile-pic" />
                        <span className="username">{post.username} ➔ eSpace {spaceId}</span>
                        <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                            <FaTrashAlt />
                        </button>
                    </div>
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-body">{post.body}</p>
                    <div className="post-actions">
                        <button onClick={() => handleLikePost(post.id)}><FaThumbsUp /> {post.likeCount}</button>
                        <button onClick={() => handleDislikePost(post.id)}><FaThumbsDown /> {post.dislikeCount}</button>
                        <button onClick={() => handleToggleComment(post.id)}><FaComment /> {post.comments?.length || 0}</button>
                        <button><FaShareSquare /> Share</button>
                    </div>
                    {commentVisible[post.id] && (
                        <div className="comment-section">
                            <div className="comment-input-container">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                                <button onClick={() => handleCommentPost(post.id)}><FaReply /></button>
                            </div>
                            {post.comments?.map(comment => (
                                <div key={comment.id} className="comment">
                                    <div className="comment-header">
                                        <img src={comment.profilePicture} alt={comment.username} className="profile-pic" />
                                        <span className="username">{comment.username}</span>
                                    </div>
                                    <p className="comment-body">{comment.body}</p>
                                    <div className="comment-actions">
                                        <div className="like-dislike">
                                            <button onClick={() => handleLikeComment(post.id, comment.id)}>
                                                <FaThumbsUp /> {comment.likes}
                                            </button>
                                            <button onClick={() => handleDislikeComment(post.id, comment.id)}>
                                                <FaThumbsDown /> {comment.dislikes}
                                            </button>
                                        </div>
                                        <div className="reply-container">
                                            <input
                                                type="text"
                                                placeholder="Reply..."
                                                value={reply[comment.id] || ''}
                                                onChange={e => setReply(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                            />
                                            <button className="reply-button" onClick={() => handleReplyToComment(post.id, comment.id, reply[comment.id] || '')}>
                                                <FaReply />
                                            </button>
                                        </div>
                                    </div>
                                    {comment.replies?.map(reply => (
                                        <div key={reply.id} className="reply">
                                            <div className="reply-header">
                                                <img src={reply.profilePicture} alt={reply.username} className="profile-pic" />
                                                <span className="username">{reply.username}</span>
                                            </div>
                                            <p className="reply-body">{reply.body}</p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

};

export default ESpacePosts;
