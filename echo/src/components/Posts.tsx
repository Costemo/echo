/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Posts.css';
import { FaThumbsUp, FaThumbsDown, FaShareSquare, FaComment, FaTrashAlt, FaReply } from 'react-icons/fa';


type Comment = {
    id: number;
    userId: number;
    username: string;
    comment: string;
    likes: number;
    dislikes: number;
    parentId?: number;
    replies?: Comment[];
    profilePicture: string;
};

type Post = {
    id: number;
    userId: number;
    username: string;
    title: string;
    body: string;
    comments?: Comment[];
    likeCount?: number; 
    dislikeCount?: number;
    profilePicture: string; 
    
};

type NewPost = {
    title: string;
    body: string;
};

type PostsProps = {
    userId: number;
    isProfile: boolean; 
};

const Posts: React.FC<PostsProps> = ({ userId, isProfile }) => {
    const [creatingPost, setCreatingPost] = useState(false);
    const [newPost, setNewPost] = useState<NewPost>({ title: '', body: '' });
    const [posts, setPosts] = useState<Post[]>([]);
    const [comment, setComment] = useState('');
    const [reply, setReply] = useState<{ [key: number]: string }>({});
    const [commentVisible, setCommentVisible] = useState<{ [key: number]: boolean }>({});

   
const fetchFeedPosts = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get('http://localhost:5000/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        setPosts(response.data.map((post: any) => ({
            ...post,
            userId: post.user_id,
            username: post.username,
            profilePicture: post.profile_picture,
            comments: post.comments.map((comment: any) => ({
                ...comment,
                userId: comment.user_id,
                username: comment.comment_username,
                profilePicture: comment.comment_profile_picture, 
                comment: comment.comment, 
                replies: comment.replies.map((reply: any) => ({
                    ...reply,
                    userId: reply.user_id,
                    username: reply.reply_username,
                    profilePicture: reply.reply_profile_picture,
                    comment: reply.reply, 
                })) || [],
                likes: comment.likes || 0,
                dislikes: comment.dislikes || 0,
            })) || [],
            likeCount: post.like_count || 0,
            dislikeCount: post.dislike_count || 0,
        })));
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
};


const fetchUserPosts = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        
        const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        setPosts(response.data.map((post: any) => ({
            ...post,
            userId: post.user_id,
            username: post.username,
            profilePicture: post.profile_picture,
            comments: post.comments.map((comment: any) => ({
                ...comment,
                userId: comment.user_id,
                username: comment.comment_username,
                profilePicture: comment.comment_profile_picture,
                comment: comment.comment,
                replies: comment.replies.map((reply: any) => ({
                    ...reply,
                    userId: reply.user_id,
                    username: reply.reply_username,
                    profilePicture: reply.reply_profile_picture,
                    comment: reply.reply,
                })) || [],
                likes: comment.likes || 0,
                dislikes: comment.dislikes || 0,
            })) || [],
            likeCount: post.like_count || 0,
            dislikeCount: post.dislike_count || 0,
        })));
    } catch (error) {
        console.error('Error fetching user posts:', error);
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
            if (error.response) {
                console.error('Error deleting post:', error.response.data.message);
                alert(error.response.data.message); 
            } else {
                console.error('Error deleting post:', error.message);
            }
        }
    };

    const handleLikePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            isProfile ? fetchUserPosts() : fetchFeedPosts();
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

            isProfile ? fetchUserPosts() : fetchFeedPosts(); 
        } catch (error) {
            console.error('Error disliking post:', error);
        }
    };

    const handleCommentPost = async (postId: number) => {
        if (!comment) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, 
            { comment }, 
            {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId ? { 
                    ...post, 
                    comments: [...(post.comments || []), { ...response.data, likes: 0, dislikes: 0 }] 
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
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/comments/${commentId}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            isProfile ? fetchUserPosts() : fetchFeedPosts();
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleDislikeComment = async (postId: number, commentId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/comments/${commentId}/dislike`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            isProfile ? fetchUserPosts() : fetchFeedPosts(); 
        } catch (error) {
            console.error('Error disliking comment:', error);
        }
    };

    const handleReplyToComment = async (postId: number, commentId: number, replyText: string) => {
        if (!replyText) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const response = await axios.post(`http://localhost:5000/api/posts/${postId}/comments/${commentId}/reply`, 
                { reply: replyText }, 
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
        if (isProfile) {
            fetchUserPosts();
        } else {
            fetchFeedPosts(); 
        }
    }, [isProfile, userId]);

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
                    <button onClick={handleCreatePost}>Submit Post</button>
                </div>
            )}
            {posts.map(post => (
                <div key={post.id} className="post">
                    <div className="post-header">
                        <img src={post.profilePicture} alt={post.username} className="profile-pic" />
                        <span className="username">{post.username}</span>
                        <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                            <FaTrashAlt />
                        </button>
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                    <div className="post-actions">
                        <button onClick={() => handleLikePost(post.id)}><FaThumbsUp /> {post.likeCount}</button>
                        <button onClick={() => handleDislikePost(post.id)}><FaThumbsDown /> {post.dislikeCount}</button>
                        <button onClick={() => handleToggleComment(post.id)}><FaComment /> Comment</button>
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
            <p><strong className="username">{comment.username}</strong>: {comment.comment}</p>
        </div>
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
                    <p><strong className="username">{reply.username}</strong>: {reply.comment}</p> 
                </div>
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

export default Posts;
