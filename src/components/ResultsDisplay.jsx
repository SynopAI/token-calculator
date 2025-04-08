import React from 'react';
import { Paper, Typography, Grid, Box, CircularProgress } from '@mui/material';

const ResultsDisplay = ({ results, model }) => {
    const { tokenCount, costUSD, costCNY, isCalculating } = results;

    const formatCost = (cost) => {
        if (cost < 0.01) {
            return cost.toFixed(6);
        }
        return cost.toFixed(4);
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>计算结果</Typography>

            {isCalculating ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">总Token数</Typography>
                            <Typography
                                variant="h4"
                                color="primary"
                                sx={{ mt: 1, fontWeight: 'bold' }}
                            >
                                {tokenCount.toLocaleString()}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">预估费用 (USD)</Typography>
                            <Typography
                                variant="h4"
                                sx={{ mt: 1, fontWeight: 'bold', color: '#2e7d32' }}
                            >
                                ${formatCost(costUSD)}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">预估费用 (CNY)</Typography>
                            <Typography
                                variant="h4"
                                sx={{ mt: 1, fontWeight: 'bold', color: '#2e7d32' }}
                            >
                                ¥{formatCost(costCNY)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    * 价格基于 {model} 模型的当前计费标准
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                    * 仅计算输入文本的token，输出token会另外计费
                </Typography>
            </Box>
        </Paper>
    );
};

export default ResultsDisplay;