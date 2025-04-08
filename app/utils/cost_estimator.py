# app/utils/cost_estimator.py
from app.config import Config

class CostEstimator:
    @staticmethod
    def estimate_cost(input_tokens, output_tokens, model, exchange_rate=None):
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