from flask import Blueprint, request, jsonify
import tiktoken

api = Blueprint('api', __name__)

def count_tokens(text, model="gpt-3.5-turbo"):
    """简单的token计算函数"""
    try:
        encoding = tiktoken.encoding_for_model(model)
        tokens = encoding.encode(text)
        return len(tokens), tokens
    except:
        # 如果tiktoken不支持该模型，使用简单的空格分词作为后备
        return len(text.split()), None

@api.route('/calculate', methods=['POST'])
def calculate_tokens():
    data = request.get_json()
    
    if not data or 'text' not in data or 'model' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    text = data['text']
    model = data['model']
    output_tokens = data.get('output_tokens', 0)
    exchange_rate = data.get('exchange_rate', 7.2)
    
    # 计算tokens
    try:
        from app.config import Config
        pricing = Config.MODEL_PRICING.get(model, {'input': 0.0015, 'output': 0.002})
        
        token_count, tokens = count_tokens(text, model)
        
        # 构建token详情
        tokens_detail = []
        if tokens:
            encoding = tiktoken.encoding_for_model(model)
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
                except:
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
        return jsonify({'error': str(e)}), 500

@api.route('/models', methods=['GET'])
def get_models():
    from app.config import Config
    return jsonify({
        'models': {k: v['name'] for k, v in Config.AVAILABLE_MODELS.items()},
        'pricing': Config.MODEL_PRICING
    })