import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

export default function Debug() {
    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4">调试页面</Typography>
                <Typography variant="body1" sx={{ my: 2 }}>
                    如果你能看到这个页面，基本渲染是正常的
                </Typography>
                <Button variant="contained" color="primary">
                    测试按钮
                </Button>
            </Paper>
        </Box>
    );
}