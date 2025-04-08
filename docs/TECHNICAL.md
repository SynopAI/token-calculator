# LLM Token计算器 - 技术文档

## 1. 项目概述

本项目是一个基于Flask的Web应用，用于计算各种LLM模型的token数量和成本。支持多种主流LLM模型，包括GPT-3.5/4、Claude 2和Llama 2等。

## 2. 技术栈

- 后端：Python + Flask
- 前端：HTML + CSS + JavaScript
- 开发工具：Docker (可选)

## 3. 项目结构

```txt
./token-calculator
├── app
│   ├── __pycache__
│   │   ├── __init__.cpython-312.pyc
│   │   └── config.cpython-312.pyc
│   ├── routes
│   │   ├── __pycache__
│   │   │   ├── __init__.cpython-312.pyc
│   │   │   ├── api_routes.cpython-312.pyc
│   │   │   └── web_routes.cpython-312.pyc
│   │   ├── __init__.py
│   │   ├── api_routes.py
│   │   └── web_routes.py
│   ├── static
│   │   ├── css
│   │   │   └── styles.css
│   │   └── js
│   │       └── token-calculator.js
│   ├── templates
│   │   ├── components
│   │   ├── api_docs.html
│   │   ├── base.html
│   │   └── index.html
│   ├── tokenizers
│   │   ├── __init__.py
│   │   ├── claude_tokenizer.py
│   │   ├── gpt_tokenizer.py
│   │   └── llama_tokenizer.py
│   ├── utils
│   │   ├── __init__.py
│   │   ├── cost_estimator.py
│   │   └── token_calculator.py
│   ├── __init__.py
│   └── config.py
├── docs
│   ├── PRODUCT.md
│   └── TECHNICAL.md
├── tests
│   ├── __init__.py
│   ├── test_cost_estimator.py
│   └── test_tokenizers.py
├── Dockerfile
├── README.md
├── app.py
├── docker-compose.yml
├── pyproject.toml
└── requirements.txt
```

## 4. 核心功能实现

### 4.1 API接口

#### 计算Tokens (`/api/calculate`)

```python
@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    text = data.get('text', '')
    tokens = len(text.split())  # 简单示例
    
    response = {
        "success": True,
        "input_tokens": tokens,
        "tokens_detail": [...],
        "cost_estimate": {...}
    }
    return jsonify(response)
```

#### 获取支持的模型 (`/api/models`)

```python
@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify({
        'models': {
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'gpt-4': 'GPT-4',
            'claude-2': 'Claude 2',
            'llama-2': 'Llama 2'
        },
        'pricing': {...}
    })
```

### 4.2 成本计算

成本计算基于以下因素：

- 输入token数量
- 输出token数量（预估）
- 模型单价（input/output各不相同）
- 汇率（USD到CNY的转换）

## 5. 部署说明

### 5.1 本地开发

1. 安装依赖：

   ```bash
   pip install -r requirements.txt
   ```

2. 启动服务：

   ```bash
   python app.py
   ```

### 5.2 Docker部署

1. 构建镜像：

   ```bash
   docker build -t token-calculator .
   ```

2. 运行容器：

   ```bash
   docker run -p 5000:5000 token-calculator
   ```

## 6. 注意事项

- 目前token计算采用简单的分词方式，实际应用中应该使用专门的tokenizer
- 成本计算使用固定汇率，可以考虑接入实时汇率API
- 建议添加缓存机制优化性能
