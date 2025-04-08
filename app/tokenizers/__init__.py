# 暂时使用简化实现
def get_tokenizer(model):
    """获取适合的tokenizer"""
    import tiktoken
    
    # 根据模型选择合适的encoding
    model_encoding = {
        # o200k_base编码
        'gpt-4o': 'o200k_base',
        'gpt-4o-mini': 'o200k_base',
        
        # cl100k_base编码
        'gpt-4-turbo': 'cl100k_base',
        'gpt-4': 'cl100k_base',
        'gpt-3.5-turbo': 'cl100k_base',
        'text-embedding-ada-002': 'cl100k_base',
        'text-embedding-3-small': 'cl100k_base',
        'text-embedding-3-large': 'cl100k_base',
        
        # p50k_base编码
        'text-davinci-002': 'p50k_base',
        'text-davinci-003': 'p50k_base',
        
        # r50k_base编码
        'davinci': 'r50k_base'
    }
    
    try:
        # 如果是特定模型，使用对应的encoding
        if model in model_encoding:
            return tiktoken.get_encoding(model_encoding[model])
        # 否则尝试直接获取模型的encoding
        return tiktoken.encoding_for_model(model)
    except:
        # 默认使用cl100k_base编码
        return tiktoken.get_encoding('cl100k_base')