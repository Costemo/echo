import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted");
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { username, password });
            navigate('/feed');
        } catch (err) {
            console.error("Error Occured", err);
            setError('Failed to create account');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <Link to="/">Back</Link>
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='username'>Username:</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor='password'>Password:</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> 
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default SignUp;