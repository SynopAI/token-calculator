# app/routes/api_routes.py
from flask import Blueprint, request, jsonify
from app.config import Config
from app.utils.token_calculator import TokenCalculator
from app.utils.cost_estimator import CostEstimator

api = Blueprint('api', __name__)

# 创建全局的TokenCalculator实例
token_calculator = TokenCalculator()

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
    exchange_rate = data.get('exchange_rate', Config.DEFAULT_EXCHANGE_RATE)
    
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
        # 使用TokenCalculator计算token数量
        token_count = token_calculator.calculate(text, model)
        
        # 获取token详情
        tokens_detail = token_calculator.get_tokens_detail(text, model)
        
        # 调试输出
        print(f"输入文本: {text[:50]}... (长度: {len(text)})")
        print(f"计算得到token数: {token_count}")
        
        # 使用CostEstimator计算成本
        cost_estimate = CostEstimator.estimate_cost(token_count, output_tokens, model, exchange_rate)
        
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