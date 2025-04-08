# 暂时使用简化实现
def get_tokenizer(model):
    """获取适合的tokenizer"""
    import tiktoken
    try:
        return tiktoken.encoding_for_model(model)
    except:
        return tiktoken.encoding_for_model("gpt-3.5-turbo")  # 默认使用gpt-3.5-turbo的tokenizer