// src/pages/Login.tsx
import { useState } from 'react';
import { api } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); 
        setToken(null);

        try {
            // Hitting the AuthController we just built
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            
            // If successful, save token to state (and usually localStorage)
            const jwt = response.data.token;
            setToken(jwt);
            localStorage.setItem('jwt', jwt);
            
            console.log("Login successful! Token:", jwt);
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.response?.data?.message || "Invalid credentials or server error");
        }
    };

    return (
        <div>
            <h2>Test Authentication</h2>
            
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email: </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <div>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <button type="submit">Login</button>
            </form>

            {/* Display Results */}
            <div style={{ marginTop: '20px' }}>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                {token && (
                    <div>
                        <p style={{ color: 'green' }}>Success! JWT Received:</p>
                        <textarea 
                            readOnly 
                            value={token} 
                            rows={5} 
                            cols={50} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}