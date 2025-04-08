# app/utils/token_calculator.py
from app.tokenizers import get_tokenizer
from app.config import Config

class TokenCalculator:
    def __init__(self):
        self.tokenizers = {}
    
    def get_tokenizer(self, model):
        if model not in self.tokenizers:
            self.tokenizers[model] = get_tokenizer(model)
        return self.tokenizers[model]
    
    def calculate(self, text, model):
        """计算给定文本的token数"""
        tokenizer = self.get_tokenizer(model)
        return tokenizer.count_tokens(text)
    
    def get_tokens_detail(self, text, model):
        """获取文本的token详细信息"""
        tokenizer = self.get_tokenizer(model)
        return tokenizer.tokenize(text)
    
    def estimate_cost(self, input_tokens, output_tokens, model, exchange_rate=None):
        """估算API调用成本"""
        from app.utils.cost_estimator import CostEstimator
        return CostEstimator.estimate_cost(input_tokens, output_tokens, model, exchange_rate)