# app/tokenizers/gpt_tokenizer.py
import tiktoken

class GPTTokenizer:
    def __init__(self, model="gpt-3.5-turbo"):
        self.model = model
        self.encoding = tiktoken.encoding_for_model(model)
    
    def count_tokens(self, text):
        """计算文本的token数"""
        return len(self.encoding.encode(text))
    
    def tokenize(self, text):
        """返回文本的token详情"""
        tokens = self.encoding.encode(text)
        token_bytes = [self.encoding.decode_single_token_bytes(token) for token in tokens]
        token_text = [tb.decode('utf-8', errors='replace') for tb in token_bytes]
        
        result = []
        for i, (token, text) in enumerate(zip(tokens, token_text)):
            result.append({
                'id': i,
                'token': token,
                'text': text,
                'bytes': ' '.join(f'{b:02x}' for b in token_bytes[i])
            })
        
        return result