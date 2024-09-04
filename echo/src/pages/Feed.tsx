import React from 'react';
import { Link } from 'react-router-dom';

const Feed = () => {
    return (
        <div>
            <h1>Welcome to the Feed</h1>
            <p>This is where the posts will appear</p>
            <Link to="/">Logout</Link>
        </div>
    )
}

export default Feed;