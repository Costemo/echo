import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted");
        try {
            const response = await axios.post('http://localhost:5000/api/auth/signin', { username, password });
            localStorage.setItem('token', response.data.token);
            navigate('/feed');
        } catch (err) {
            console.error("Error Occured", err);
            setError('Invalid username or password');
        }
    };

    return (
        <div>
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
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;