import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="glass-bubble">
            <h1>Welcome to Echo</h1>
            <div>
                <Link to="/signin">Sign In</Link> | <Link to="/signup">Sign Up</Link>
            </div>
        </div>
    )
}

export default Home;