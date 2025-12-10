import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const { user: loggedInUser } = await authService.login(username, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
