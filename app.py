from flask import render_template, request, jsonify
from app import create_app

app = create_app()


if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # 禁用静态文件缓存
    app.run(debug=True)