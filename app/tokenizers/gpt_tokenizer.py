# app/tokenizers/gpt_tokenizer.py
import tiktoken

class GPTTokenizer:
    def __init__(self, model="gpt-4o"):
        self.model = model
        self.encoding = tiktoken.encoding_for_model(model)
    
    def count_tokens(self, text):
        """计算文本的token数"""
        print(f"Using encoding: {self.encoding.name}")
        return len(self.encoding.encode(text))
    
    def tokenize(self, text):
        """返回文本的token详情"""
        # Use the official OpenAI method to convert text to tokens
        tokens = self.encoding.encode(text)
        
        result = []
        for i, token in enumerate(tokens):
            # Get the text representation for this token
            token_text = self.encoding.decode([token])
            
            # Calculate the bytes directly from the text representation
            token_bytes = token_text.encode('utf-8')
            
            result.append({
                'id': i,
                'token': token,
                'text': token_text,
                'bytes': ' '.join(f'{b:02x}' for b in token_bytes)
            })
        
        return result