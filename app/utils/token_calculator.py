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
        if exchange_rate is None:
            exchange_rate = Config.DEFAULT_EXCHANGE_RATE
        
        pricing = Config.MODEL_PRICING.get(model, {'input': 0, 'output': 0})
        
        input_cost_usd = (input_tokens / 1000) * pricing['input']
        output_cost_usd = (output_tokens / 1000) * pricing['output']
        total_cost_usd = input_cost_usd + output_cost_usd
        
        return {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'input_cost_usd': input_cost_usd,
            'output_cost_usd': output_cost_usd,
            'total_cost_usd': total_cost_usd,
            'total_cost_cny': total_cost_usd * exchange_rate,
            'exchange_rate': exchange_rate
        }