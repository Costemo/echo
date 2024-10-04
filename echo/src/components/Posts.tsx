import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Posts.css';
import { FaThumbsUp, FaThumbsDown, FaShareSquare, FaComment } from 'react-icons/fa';

type Comment = {
    id: number;
    userId: number;
    username: string;
    comment: string;
    likes: number;
    dislikes: number;
    parentId?: number;
    replies?: Comment[];
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
    const [reply, setReply] = useState<{ [key: number]: string }>({});
    const [commentVisible, setCommentVisible] = useState<{ [key: number]: boolean }>({});

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
                username: post.username,
                comments: post.comments.map((comment: any) => ({
                    ...comment,
                    userId: comment.user_id,
                    username: comment.comment_username,
                    replies: comment.replies.map((reply: any) => ({
                        ...reply,
                        userId: reply.user_id,
                        username: reply.reply_username,
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

            fetchPosts(); 
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

            fetchPosts();
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

            fetchPosts(); 
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

            fetchPosts(); 
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
                        comment.id === commentId ? { 
                            ...comment, 
                            replies: [...(comment.replies || []), newReply] 
                        } : comment
                    )
                } : post
            ));
            setReply(prev => ({ ...prev, [commentId]: '' })); 
        } catch (error) {
            console.error('Error replying to comment:', error);
        }
    };

    const handleSharePost = async (postId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.post(`http://localhost:5000/api/posts/${postId}/share`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            console.log('Post shared successfully');
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const toggleComments = (postId: number) => {
        setCommentVisible(prev => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    return (
        <div className="posts">
            {/*  */}
            <div className="new-post">
                <button onClick={() => setCreatingPost(true)}>New Post</button>
            </div>

            {/*  */}
            {creatingPost && (
                <div className="new-post-form">
                    <input
                        type="text"
                        placeholder="Title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                    <textarea
                        placeholder="What's on your mind?"
                        value={newPost.body}
                        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                    ></textarea>
                    <button onClick={handleCreatePost}>Submit</button>
                    <button onClick={() => setCreatingPost(false)}>Cancel</button>
                </div>
            )}

            {posts.map((post) => (
                <div key={post.id} className="post">
                    <p className="post-name">{post.username}</p>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                    <div className="post-actions">
                        <button onClick={() => handleLikePost(post.id)}>
                            <FaThumbsUp /> {post.likeCount || 0}
                        </button>
                        <button onClick={() => handleDislikePost(post.id)}>
                            <FaThumbsDown /> {post.dislikeCount || 0}
                        </button>
                        
                        {/*  */}
                        <button onClick={() => toggleComments(post.id)}>
                            <FaComment /> {commentVisible[post.id] ? 'Hide Comments' : 'Show Comments'}
                        </button>
                        
                        <button onClick={() => handleSharePost(post.id)}>
                            <FaShareSquare /> Share
                        </button>
                    </div>

                    {/*  */}
                    {commentVisible[post.id] && (
                        <div className="comment-input">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                            />
                            <button onClick={() => handleCommentPost(post.id)}>Comment</button>
                        </div>
                    )}

                    {/*  */}
                    {commentVisible[post.id] && (
                        <div className="comments">
                            <h4>Comments</h4>
                            {post.comments?.map((comment) => (
                                <div key={comment.id} className="comment">
                                    <p><strong>{comment.username}</strong>: {comment.comment}</p>
                                    <div className="comment-actions">
                                        <button onClick={() => handleLikeComment(post.id, comment.id)}>
                                            <FaThumbsUp /> {comment.likes || 0}
                                        </button>
                                        <button onClick={() => handleDislikeComment(post.id, comment.id)}>
                                            <FaThumbsDown /> {comment.dislikes || 0}
                                        </button>
                                    </div>
                                    <div className="reply-input-container">
                                        <input
                                            type="text"
                                            value={reply[comment.id] || ''}
                                            onChange={(e) => setReply({ ...reply, [comment.id]: e.target.value })}
                                            placeholder="Reply..."
                                        />
                                        <button onClick={() => handleReplyToComment(post.id, comment.id, reply[comment.id])}>
                                            Reply
                                        </button>
                                    </div>
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="replies">
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="reply">
                                                    <p><strong>{reply.username}</strong>: {reply.reply}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/*  */}
                    <button onClick={() => handleDeletePost(post.id)}>Delete Post</button>

                </div>
            ))}
        </div>
    );
};

export default Posts;
