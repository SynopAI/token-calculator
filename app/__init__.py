from flask import Flask
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # 注册蓝图
    from app.routes.web_routes import web
    from app.routes.api_routes import api
    
    app.register_blueprint(web)
    app.register_blueprint(api, url_prefix='/api')
    
    return app