import { useState, useEffect } from 'react';

export default function useTheme() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' ||
            (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return [isDarkMode, setIsDarkMode];
}