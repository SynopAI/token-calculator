import React from 'react';
import { AppBar, Toolbar, Typography, Link, Box } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

const Header = () => {
    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CodeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold' }}>
                        LLM Token计算器
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Link
                    href="https://github.com/yourusername/llm-token-calculator"
                    color="inherit"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ fontSize: '0.875rem' }}
                >
                    GitHub
                </Link>
            </Toolbar>
        </AppBar>
    );
};

export default Header;