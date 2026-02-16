import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMe = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const { data } = await api.get('/auth/me');
                    if (data.success) {
                        const userData = { ...data.data, token: JSON.parse(storedUser).token };
                        setUser(userData);
                    }
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        fetchMe();
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await api.post('/auth/login', credentials);

            if (data.success) {
                const userResponse = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${data.token}` }
                });

                const userData = { ...userResponse.data.data, token: data.token, mustChangePassword: data.mustChangePassword };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                if (userData.role === 'superadmin') navigate('/superadmin');
                else if (userData.role === 'admin') navigate('/admin');
                else if (userData.role === 'teacher') navigate('/teacher');
                else if (userData.role === 'administration') navigate('/administration');
                else navigate('/student');

                return { success: true };
            }
        } catch (error) {
            console.error('Login error:', error.response?.data?.error || error.message);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const changePassword = async (passwords) => {
        try {
            const { data } = await api.put('/auth/changepassword', passwords);
            if (data.success) {
                const { data: userData } = await api.get('/auth/me');
                setUser({ ...userData.data, token: user.token });
                return { success: true };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to change password' };
        }
    };

    const registerSchool = async (registrationData) => {
        try {
            const { data } = await api.post('/auth/register-school', registrationData);

            if (data.success) {
                const userResponse = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${data.token}` }
                });

                const userData = { ...userResponse.data.data, token: data.token, mustChangePassword: true };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                navigate('/admin');
                return { success: true };
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data?.error || error.message);
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, registerSchool, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
