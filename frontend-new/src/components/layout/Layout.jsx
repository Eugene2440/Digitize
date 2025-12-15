import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
