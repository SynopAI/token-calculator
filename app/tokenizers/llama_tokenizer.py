# app/tokenizers/llama_tokenizer.py
import re

class LlamaTokenizer:
    def __init__(self, model="llama-2"):
        self.model = model
        # 使用简化实现，不依赖于sentencepiece
        self.use_fallback = True
    
    def count_tokens(self, text):
        """计算文本的token数"""
        # 使用简化估算
        # Llama使用sentencepiece分词器，大约每3-4个字符一个token
        return len(text) // 3 + 1
    
    def tokenize(self, text):
        """返回文本的token详情"""
        # 使用简化分词
        tokens = []
        words = re.findall(r'\b\w+\b|[^\w\s]|\s+', text)
        
        token_id = 0
        for word in words:
            # 估计每个单词或标点的token数
            estimated_tokens = max(1, len(word) // 3)
            
            for i in range(estimated_tokens):
                # 创建一个模拟的token
                part = word[i * 3:min((i + 1) * 3, len(word))] if estimated_tokens > 1 else word
                
                tokens.append({
                    'id': token_id,
                    'token': 20000 + token_id,  # 模拟token ID
                    'text': part,
                    'bytes': ' '.join(f'{b:02x}' for b in part.encode('utf-8'))
                })
                token_id += 1
        
        return tokens