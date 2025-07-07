import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css"; // Reusing the same CSS as Login for consistency
import logo from './img/b984c4dcf6e3893d59d7027b6c4d05c02525baad.png';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in both email and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        navigate('/');
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.11 18.11 0 0 1 5.24-5.88" />
      <path d="M1 1l22 22" />
    </svg>
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img
            src={logo}
            alt="PINTAR Smart Parking Logo"
            className="logo"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>

          <button type="submit">Sign Up</button>
        </form>

        <p className="copyright-text">
          &copy; 2025 PINTAR Smart Parking. Copyright Reserved.
        </p>
      </div>
    </div>
  );
}