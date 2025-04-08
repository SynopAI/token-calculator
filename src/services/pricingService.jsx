// 模型定价 (每1000个token的价格，单位：美元)
const MODEL_PRICING = {
    'gpt-3.5-turbo': {
        input: 0.0005,
        output: 0.0015
    },
    'gpt-4': {
        input: 0.03,
        output: 0.06
    },
    'claude-2': {
        input: 0.008,
        output: 0.024
    },
    'gemini-pro': {
        input: 0.0002,
        output: 0.0002
    },
    'wenxin': {
        input: 0.0005,
        output: 0.0005
    },
    'chatglm': {
        input: 0.0005,
        output: 0.0005
    }
};

// 计算费用
export const calculateCost = (tokenCount, model, type = 'input') => {
    if (!MODEL_PRICING[model]) return 0;
    const rate = MODEL_PRICING[model][type];
    return (tokenCount / 1000) * rate;
};

// 汇率转换 (假设1美元=7.2人民币)
export const convertCurrency = (usdAmount, targetCurrency = 'CNY') => {
    const rates = {
        'CNY': 7.2,
        'USD': 1,
    };

    return usdAmount * (rates[targetCurrency] || 1);
};