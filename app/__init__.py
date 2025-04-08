from flask import Flask
from app.config import Config

def create_app(config_class=Config):
    # 明确指定静态文件夹和模板文件夹的路径
    app = Flask(__name__,
                static_folder='static',  # 相对于app包的路径
                template_folder='templates')  # 相对于app包的路径
    
    app.config.from_object(config_class)
    
    # 注册蓝图
    from app.routes.web_routes import web
    from app.routes.api_routes import api
    
    app.register_blueprint(web)
    app.register_blueprint(api, url_prefix='/api')
    
    return app