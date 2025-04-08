import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    Collapse,
    Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AdvancedOptions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(7.2);
    const [inputPrice, setInputPrice] = useState('');
    const [outputPrice, setOutputPrice] = useState('');

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Typography variant="h6">高级选项</Typography>
                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 3, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        自定义价格（USD/1K tokens）
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="输入"
                                variant="outlined"
                                type="number"
                                size="small"
                                value={inputPrice}
                                onChange={(e) => setInputPrice(e.target.value)}
                                inputProps={{ min: 0, step: 0.0001 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="输出"
                                variant="outlined"
                                type="number"
                                size="small"
                                value={outputPrice}
                                onChange={(e) => setOutputPrice(e.target.value)}
                                inputProps={{ min: 0, step: 0.0001 }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 3, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        汇率设置
                    </Typography>
                    <TextField
                        label="USD 至 CNY 汇率"
                        variant="outlined"
                        type="number"
                        size="small"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">1 USD =</InputAdornment>,
                            endAdornment: <InputAdornment position="end">CNY</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: '250px' }}
                    />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary">
                        应用设置
                    </Button>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default AdvancedOptions;