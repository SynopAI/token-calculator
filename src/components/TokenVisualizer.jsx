import React, { useState } from 'react';
import { Paper, Typography, Box, Tooltip, Fade, Grid } from '@mui/material';

const TokenVisualizer = ({ tokens, isCalculating }) => {
    const [hoveredToken, setHoveredToken] = useState(null);

    // Token的样式
    const getTokenStyle = (token) => {
        // 特殊字符使用不同颜色
        if (token.isSpecial) {
            return {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#8B4513' : '#FFF8DC',
                color: (theme) => theme.palette.mode === 'dark' ? '#FFD700' : '#8B4513'
            };
        }
        // 普通字符使用基本颜色
        return {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0D47A1' : '#E3F2FD',
            color: (theme) => theme.palette.mode === 'dark' ? '#90CAF9' : '#0D47A1'
        };
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Token 可视化</Typography>

            {isCalculating ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography color="text.secondary">正在分析tokens...</Typography>
                </Box>
            ) : tokens.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">请输入文本以查看token分析</Typography>
                </Box>
            ) : (
                <>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            maxHeight: '200px',
                            overflow: 'auto',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                            {tokens.map((token, index) => (
                                <Tooltip
                                    key={index}
                                    title={`ID: ${token.id} | 类型: ${token.isSpecial ? '特殊字符' : '标准字符'}`}
                                    arrow
                                    placement="top"
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 300 }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            px: 0.75,
                                            py: 0.25,
                                            mx: 0.25,
                                            my: 0.25,
                                            borderRadius: 1,
                                            display: 'inline-block',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                            },
                                            ...getTokenStyle(token)
                                        }}
                                        onClick={() => setHoveredToken(token)}
                                    >
                                        {token.text || ' '}
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </Paper>

                    {hoveredToken && (
                        <Paper
                            variant="outlined"
                            sx={{ mt: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50' }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Token详情</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        文本: <Box component="span" sx={{ px: 0.5, py: 0.25, bgcolor: 'background.paper', borderRadius: 0.5 }}>
                                            {hoveredToken.text ? hoveredToken.text.replace(/\n/g, '⏎') : '[空白]'}
                                        </Box>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: <Box component="span" sx={{ px: 0.5, py: 0.25, bgcolor: 'background.paper', borderRadius: 0.5 }}>
                                            {hoveredToken.id}
                                        </Box>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        类型: <Box component="span" sx={{ color: hoveredToken.isSpecial ? 'warning.main' : 'primary.main' }}>
                                            {hoveredToken.isSpecial ? '特殊字符' : '标准字符'}
                                        </Box>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}
                </>
            )}
        </Paper>
    );
};

export default TokenVisualizer;