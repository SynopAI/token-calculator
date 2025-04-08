# app/routes/web_routes.py
from flask import Blueprint, render_template, request
from app.utils.token_calculator import TokenCalculator
from app.config import Config

web = Blueprint('web', __name__)
calculator = TokenCalculator()

@web.route('/', methods=['GET', 'POST'])
def index():
    models = {k: v['name'] for k, v in Config.AVAILABLE_MODELS.items()}
    pricing = Config.PRICING
    
    return render_template(
        'index.html', 
        models=models,
        pricing=pricing,
        default_exchange_rate=Config.DEFAULT_EXCHANGE_RATE
    )

@web.route('/api-docs')
def api_docs():
    return render_template('api_docs.html')