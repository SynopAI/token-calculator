// 这里我们使用简单实现，因为真实的tokenizer可能需要Wasm支持
// 如果您想使用真实的tokenizer，可以参考之前的代码

// 模拟支持的模型及编码映射
const MODEL_ENCODINGS = {
    'gpt-3.5-turbo': 'cl100k_base',
    'gpt-4': 'cl100k_base',
    'claude-2': 'cl100k_base',
    'gemini-pro': 'cl100k_base',
    'wenxin': 'cl100k_base',
    'chatglm': 'cl100k_base',
};

// 对文本进行Token化 - 简易实现
export const tokenizeText = async (text, model) => {
    try {
        if (!text) return { count: 0, tokens: [] };

        // 简单拆分文本为单词、空格和标点符号
        const tokenRegex = /\b\w+\b|\s+|[^\w\s]/g;
        const matches = text.match(tokenRegex) || [];

        // 创建token对象
        const tokens = matches.map(match => {
            return {
                id: Math.floor(Math.random() * 50000), // 模拟token ID
                text: match,
                isSpecial: /^[\p{P}\p{S}]|^\s+$/u.test(match) || !isPrintableASCII(match),
            };
        });

        // 实际token估计 (实际tokenizer会有不同的算法)
        const count = model.includes('gpt-4')
            ? Math.ceil(text.length / 3.5)
            : Math.ceil(text.length / 4);

        return {
            count,
            tokens
        };
    } catch (error) {
        console.error('Tokenization error:', error);
        return {
            count: Math.ceil(text.length / 4),
            tokens: []
        };
    }
};

// 检查是否为可打印ASCII字符
function isPrintableASCII(text) {
    return /^[\x20-\x7E]*$/.test(text);
}