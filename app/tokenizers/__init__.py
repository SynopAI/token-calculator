# app/tokenizers/__init__.py
from app.config import Config
from app.tokenizers.gpt_tokenizer import GPTTokenizer
from app.tokenizers.claude_tokenizer import ClaudeTokenizer
from app.tokenizers.llama_tokenizer import LlamaTokenizer

def get_tokenizer(model):
    """获取适合的tokenizer"""
    # 获取模型配置
    model_config = Config.AVAILABLE_MODELS.get(model, {})
    tokenizer_type = model_config.get('tokenizer', 'tiktoken')
    
    # 根据配置选择合适的tokenizer
    if tokenizer_type == 'claude':
        return ClaudeTokenizer(model)
    elif tokenizer_type == 'llama':
        return LlamaTokenizer(model)
    else:
        # 默认使用GPT tokenizer
        return GPTTokenizer(model)