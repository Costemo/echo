import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signin', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            navigate('/feed');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <Link to="/">Back</Link>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='username'>Username</label>
                        <input type='text' id='username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor='password'>Password:</label>
                        <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;