from flask import Blueprint, request, jsonify
import tiktoken

api = Blueprint('api', __name__)

def count_tokens(text, model="gpt-3.5-turbo"):
    """准确的token计算函数"""
    try:
        model_config = Config.AVAILABLE_MODELS.get(model, {})
        encoding_name = model_config.get('encoding', None)
        
        if not encoding_name:
            raise ValueError(f"模型{model}未配置编码方案")
            
        encoding = tiktoken.get_encoding(encoding_name)
        print(f"正在使用编码方案: {encoding.name}")
        tokens = encoding.encode(text)
        return len(tokens), tokens, encoding.name
    except Exception as e:
        print(f"Tiktoken错误: {e}")
        return len(text.split()), None, 'fallback'

from app.config import Config

@api.route('/models', methods=['GET'])
def get_models():
    """获取可用的模型列表和价格信息"""
    return jsonify({
        'models': {k: v['name'] for k, v in Config.AVAILABLE_MODELS.items()},
        'pricing': Config.MODEL_PRICING
    })

@api.route('/calculate', methods=['POST'])
def calculate_tokens():
    data = request.get_json()
    
    if not data or 'text' not in data or 'model' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    text = data['text']
    model = data['model']
    output_tokens = data.get('output_tokens', 0)
    exchange_rate = data.get('exchange_rate', 7.2)
    
    # 确保text非空
    if not text or text.strip() == "":
        return jsonify({
            'success': True,
            'input_tokens': 0,
            'tokens_detail': [],
            'cost_estimate': {
                'input_tokens': 0,
                'output_tokens': output_tokens,
                'input_cost_usd': 0,
                'output_cost_usd': 0,
                'total_cost_usd': 0,
                'total_cost_cny': 0,
                'exchange_rate': exchange_rate
            }
        })
    
    # 计算tokens
    try:
        from app.config import Config
        pricing = Config.MODEL_PRICING.get(model, {'input': 0.0015, 'output': 0.002})
        
        token_count, tokens, _ = count_tokens(text, model)
        
        # 调试输出
        print(f"输入文本: {text[:50]}... (长度: {len(text)})")
        print(f"计算得到token数: {token_count}")
        
        # 构建token详情
        tokens_detail = []
        
        # 初始化model_config在访问之前
        model_config = Config.AVAILABLE_MODELS.get(model, {})
        encoding_name = model_config.get('encoding', None)
        
        if not encoding_name:
            raise ValueError(f"模型{model}未配置编码方案")
        
        if tokens is not None:
            encoding = tiktoken.get_encoding(encoding_name)
            for i, token in enumerate(tokens):
                try:
                    token_bytes = encoding.decode_single_token_bytes(token)
                    token_text = token_bytes.decode('utf-8', errors='replace')
                    token_bytes_hex = ' '.join(f'{b:02x}' for b in token_bytes)
                    tokens_detail.append({
                        'id': i,
                        'token': int(token),
                        'text': token_text,
                        'bytes': token_bytes_hex
                    })
                except Exception as e:
                    print(f"处理token {i}时出错: {e}")
                    tokens_detail.append({
                        'id': i,
                        'token': int(token),
                        'text': '�',
                        'bytes': '??'
                    })
        else:
            # Fallback when tiktoken fails
            words = text.split()
            tokens_detail = [{'id': i, 'token': 1000 + i, 'text': word, 'bytes': '??'} for i, word in enumerate(words)]
        
        # 计算成本
        input_cost_usd = (token_count / 1000) * pricing['input']
        output_cost_usd = (output_tokens / 1000) * pricing['output']
        total_cost_usd = input_cost_usd + output_cost_usd
        
        cost_estimate = {
            'input_tokens': token_count,
            'output_tokens': output_tokens,
            'input_cost_usd': input_cost_usd,
            'output_cost_usd': output_cost_usd,
            'total_cost_usd': total_cost_usd,
            'total_cost_cny': total_cost_usd * exchange_rate,
            'exchange_rate': exchange_rate
        }
        
        return jsonify({
            'success': True,
            'input_tokens': token_count,
            'tokens_detail': tokens_detail,
            'cost_estimate': cost_estimate
        })
    
    except Exception as e:
        import traceback
        print(f"计算token时出错: {e}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500