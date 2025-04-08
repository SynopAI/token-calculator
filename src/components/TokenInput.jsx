import React from 'react';
import { Paper, Typography, TextField, Button, Box, Stack } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

const TokenInput = ({ text, setText }) => {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setText(event.target.result);
        };
        reader.readAsText(file);
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">输入文本</Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => setText('')}
                    >
                        清空
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        component="label"
                        startIcon={<UploadFileIcon />}
                    >
                        导入文件
                        <input
                            type="file"
                            accept=".txt,.md,.json"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                </Stack>
            </Box>
            <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入或粘贴文本..."
                multiline
                rows={10}
                fullWidth
                variant="outlined"
                sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50' }}
            />
        </Paper>
    );
};

export default TokenInput;