import os
from dotenv import load_dotenv

# 尝试加载.env文件，如果存在的话
try:
    load_dotenv()
except:
    pass

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    
    # 默认模型
    DEFAULT_MODEL = 'gpt-4o'
    
    # Token算法配置
    AVAILABLE_MODELS = {
        'gpt-3.5-turbo': {'name': 'GPT-3.5 Turbo', 'tokenizer': 'tiktoken', 'encoding': 'cl100k_base'},
        'gpt-4': {'name': 'GPT-4', 'tokenizer': 'tiktoken', 'encoding': 'cl100k_base'},
        'gpt-4o': {'name': 'GPT-4o', 'tokenizer': 'tiktoken', 'encoding': 'o200k_base'},
        'gpt-4o-mini': {'name': 'GPT-4o Mini', 'tokenizer': 'tiktoken', 'encoding': 'o200k_base'},
        'gpt-4-turbo': {'name': 'GPT-4 Turbo', 'tokenizer': 'tiktoken', 'encoding': 'cl100k_base'},
        'claude-2': {'name': 'Claude 2', 'tokenizer': 'claude', 'encoding': 'claude'},
        'llama-2': {'name': 'Llama 2', 'tokenizer': 'llama', 'encoding': 'llama'},
    }
    
    # 价格配置 (输入/输出, 单位: USD/1000 tokens)
    MODEL_PRICING = {
        'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002},
        'gpt-4': {'input': 0.03, 'output': 0.06},
        'gpt-4-turbo': {'input': 0.01, 'output': 0.03},
        'gpt-4o': {'input': 0.01, 'output': 0.03},
        'gpt-4o-mini': {'input': 0.01, 'output': 0.03},
        'claude-2': {'input': 0.008, 'output': 0.024},
        'llama-2': {'input': 0.0007, 'output': 0.0007},
    }
    
    # 默认汇率
    DEFAULT_EXCHANGE_RATE = 7.2  # 1 USD = 7.2 CNY