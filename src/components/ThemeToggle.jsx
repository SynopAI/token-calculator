import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggle = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <Tooltip title={isDarkMode ? "切换至浅色模式" : "切换至深色模式"}>
            <IconButton
                onClick={() => setIsDarkMode(!isDarkMode)}
                color="inherit"
                aria-label="Toggle dark mode"
                sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;