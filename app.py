from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def calculate():
    # 模拟API响应
    data = request.get_json()
    text = data.get('text', '')
    tokens = len(text.split())  # 简单示例
    
    response = {
        "success": True,
        "input_tokens": tokens,
        "tokens_detail": [
            {"id": i, "token": i+1000, "text": word, "bytes": "00 00"} 
            for i, word in enumerate(text.split())
        ],
        "cost_estimate": {
            "input_tokens": tokens,
            "output_tokens": 800,
            "input_cost_usd": tokens * 0.0015 / 1000,
            "output_cost_usd": 800 * 0.002 / 1000,
            "total_cost_usd": (tokens * 0.0015 + 800 * 0.002) / 1000,
            "total_cost_cny": (tokens * 0.0015 + 800 * 0.002) / 1000 * 7.2,
            "exchange_rate": 7.2
        }
    }
    return jsonify(response)

@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify({
        'models': {
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'gpt-4': 'GPT-4',
            'claude-2': 'Claude 2',
            'llama-2': 'Llama 2'
        },
        'pricing': {
            'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002},
            'gpt-4': {'input': 0.03, 'output': 0.06},
            'claude-2': {'input': 0.008, 'output': 0.024},
            'llama-2': {'input': 0.0007, 'output': 0.0007}
        }
    })

@app.route('/api-docs')
def api_docs():
    return render_template('api_docs.html')

if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # 禁用静态文件缓存
    app.run(debug=True)