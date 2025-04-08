from flask import Blueprint, render_template
from app.config import Config

web = Blueprint('web', __name__)

@web.route('/')
def index():
    models = {k: Config.AVAILABLE_MODELS[k]['name'] for k in Config.MODEL_PRICING}
    pricing = Config.MODEL_PRICING
    
    return render_template(
        'index.html', 
        models=models,
        pricing=pricing,
        default_exchange_rate=Config.DEFAULT_EXCHANGE_RATE,
        default_model=Config.DEFAULT_MODEL
    )

@web.route('/api-docs')
def api_docs():
    return render_template('api_docs.html')