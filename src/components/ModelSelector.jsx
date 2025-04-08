import React from 'react';
import { Paper, Typography, Grid, Button, Box } from '@mui/material';

const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'claude-2', name: 'Claude 2', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    { id: 'wenxin', name: '文心一言', provider: '百度' },
    { id: 'chatglm', name: 'ChatGLM', provider: '智谱' },
];

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>选择LLM模型</Typography>
            <Grid container spacing={1.5}>
                {models.map((model) => (
                    <Grid item xs={6} sm={4} key={model.id}>
                        <Button
                            fullWidth
                            variant={selectedModel === model.id ? "contained" : "outlined"}
                            color="primary"
                            onClick={() => setSelectedModel(model.id)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                p: 1,
                                textTransform: 'none'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {model.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {model.provider}
                            </Typography>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default ModelSelector;