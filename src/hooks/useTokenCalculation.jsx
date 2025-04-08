import { useState, useEffect } from 'react';
import { tokenizeText } from '../services/tokenizers';
import { calculateCost, convertCurrency } from '../services/pricingService';

export default function useTokenCalculation(text, model) {
    const [results, setResults] = useState({
        tokenCount: 0,
        tokens: [],
        costUSD: 0,
        costCNY: 0,
        isCalculating: false,
    });

    useEffect(() => {
        const calculateTokens = async () => {
            if (!text.trim()) {
                setResults({
                    tokenCount: 0,
                    tokens: [],
                    costUSD: 0,
                    costCNY: 0,
                    isCalculating: false,
                });
                return;
            }

            setResults(prev => ({ ...prev, isCalculating: true }));

            try {
                // 计算延迟，防止大文本阻塞UI
                await new Promise(r => setTimeout(r, 10));

                const { count, tokens } = await tokenizeText(text, model);
                const costUSD = calculateCost(count, model, 'input');
                const costCNY = convertCurrency(costUSD, 'CNY');

                setResults({
                    tokenCount: count,
                    tokens,
                    costUSD,
                    costCNY,
                    isCalculating: false,
                });
            } catch (error) {
                console.error('Token calculation error:', error);
                setResults(prev => ({ ...prev, isCalculating: false }));
            }
        };

        const timeoutId = setTimeout(calculateTokens, 300); // 防抖
        return () => clearTimeout(timeoutId);
    }, [text, model]);

    return results;
}