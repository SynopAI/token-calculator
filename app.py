from flask import Flask, render_template, request, jsonify
from flask_bootstrap import Bootstrap
from flask_wtf import FlaskForm
from wtforms import TextAreaField, SelectField, SubmitField
import tiktoken
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
Bootstrap(app)

class TokenForm(FlaskForm):
    text = TextAreaField('输入文本')
    model = SelectField('选择模型', choices=[
        ('gpt-3.5-turbo', 'GPT-3.5 Turbo'),
        ('gpt-4', 'GPT-4'),
        ('claude-2', 'Claude 2')
    ])
    submit = SubmitField('计算Token')

MODEL_PRICING = {
    'gpt-3.5-turbo': {'input': 0.0005, 'output': 0.0015},
    'gpt-4': {'input': 0.03, 'output': 0.06},
    'claude-2': {'input': 0.008, 'output': 0.024}
}

def calculate_tokens(text, model_name):
    try:
        encoding = tiktoken.encoding_for_model(model_name)
        tokens = encoding.encode(text)
        token_count = len(tokens)
        
        # 计算成本
        cost_usd = token_count * MODEL_PRICING[model_name]['input']
        cost_cny = cost_usd * 7.2  # 假设汇率1:7.2
        
        return {
            'token_count': token_count,
            'cost_usd': cost_usd,
            'cost_cny': cost_cny,
            'tokens': [str(t) for t in tokens]
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/', methods=['GET', 'POST'])
def index():
    form = TokenForm()
    result = None
    
    if form.validate_on_submit():
        text = form.text.data
        model = form.model.data
        result = calculate_tokens(text, model)
    
    return render_template('index.html', form=form, result=result)

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    data = request.get_json()
    text = data.get('text', '')
    model = data.get('model', 'gpt-3.5-turbo')
    
    result = calculate_tokens(text, model)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)