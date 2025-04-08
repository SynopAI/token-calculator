# app/routes/api_routes.py
from flask import Blueprint, request, jsonify
from app.utils.token_calculator import TokenCalculator

api = Blueprint('api', __name__)
calculator = TokenCalculator()

@api.route('/calculate', methods=['POST'])
def calculate_tokens():
    data = request.get_json()
    
    if not data or 'text' not in data or 'model' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    text = data['text']
    model = data['model']
    output_tokens = data.get('output_tokens', 0)
    exchange_rate = data.get('exchange_rate', None)
    
    try:
        input_tokens = calculator.calculate(text, model)
        tokens_detail = calculator.get_tokens_detail(text, model)
        cost_estimate = calculator.estimate_cost(
            input_tokens, 
            output_tokens,
            model, 
            exchange_rate
        )
        
        return jsonify({
            'success': True,
            'input_tokens': input_tokens,
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