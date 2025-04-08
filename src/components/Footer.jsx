import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                mt: 'auto',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100'
            }}
        >
            <Container maxWidth="lg">
                <Divider sx={{ mb: 3 }} />
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, md: 0 } }}>
                        LLM Token计算器 &copy; {new Date().getFullYear()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link href="#" variant="body2" color="text.secondary" underline="hover">
                            关于
                        </Link>
                        <Link href="#" variant="body2" color="text.secondary" underline="hover">
                            使用条款
                        </Link>
                        <Link href="#" variant="body2" color="text.secondary" underline="hover">
                            隐私政策
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;