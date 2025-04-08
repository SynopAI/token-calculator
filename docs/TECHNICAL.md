# LLM Token计算器 - 技术文档

## 1. 产品概述

LLM Token计算器是一款专业工具，用于准确计算和可视化大型语言模型(LLM)的token消耗及相关成本。本工具旨在帮助AI开发者、产品经理和LLM使用者更有效地规划和管理API调用预算。

## 2. 产品定位与背景

### 2.1 背景

随着ChatGPT、Claude和其它大语言模型的广泛应用，精确计算API调用成本成为开发者的迫切需求。不同模型采用不同的token计算方式和计费标准，增加了成本预估的复杂性。

### 2.2 目标用户

- AI应用开发者
- 产品经理和项目管理人员
- 数据科学家和研究人员
- API服务使用者和管理者
- 教育工作者和学生

### 2.3 产品愿景

我们希望通过本工具，降低大语言模型使用者的入门门槛，提高成本透明度，并帮助用户更有效地规划和优化他们的AI模型使用策略。

## 3. 技术架构

### 3.1 总体架构

```python
┌─────────────────────────────────────────────────────┐
│                   Client Browser                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                  Web Server (Nginx)                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Flask Application Server               │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────┐   │
│  │  Web Routes │   │ API Routes  │   │Tokenizers│   │
│  └─────────────┘   └─────────────┘   └──────────┘   │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────┐   │
│  │ Token Utils │   │Cost Calculat│   │ Config   │   │
│  └─────────────┘   └─────────────┘   └──────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 技术栈

- **后端**：
  - Python 3.8+
  - Flask 2.0+
  - Tiktoken (OpenAI tokenizer)
  - Anthropic tokenizer (如可用)
  - Flask-RESTful (API开发)
  - Flask-WTF (表单验证)

- **前端**：
  - Bootstrap 5
  - jQuery
  - Chart.js (可视化)
  - Highlight.js (代码高亮)
  - D3.js (高级可视化)

- **开发工具**：
  - Poetry (依赖管理)
  - Flask-Debug (开发环境)
  - Pytest (测试)
  - Black & Flake8 (代码格式化)

- **部署**：
  - Docker
  - Nginx
  - Gunicorn

## 4. 后端实现

### 4.1 目录结构

```python
token_calculator/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── web_routes.py
│   │   └── api_routes.py
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── templates/
│   │   ├── base.html
│   │   ├── index.html
│   │   ├── api_docs.html
│   │   └── components/
│   ├── tokenizers/
│   │   ├── __init__.py
│   │   ├── gpt_tokenizer.py
│   │   ├── claude_tokenizer.py
│   │   └── llama_tokenizer.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── token_calculator.py
│   │   └── cost_estimator.py
│   └── config.py
├── tests/
│   ├── __init__.py
│   ├── test_tokenizers.py
│   └── test_cost_estimator.py
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── README.md
```

### 4.2 Flask应用初始化

```python
# app/__init__.py
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
```

### 4.3 配置管理

```python
# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    
    # Token算法配置
    AVAILABLE_MODELS = {
        'gpt-3.5-turbo': {'name': 'GPT-3.5 Turbo', 'tokenizer': 'tiktoken', 'encoding': 'cl100k_base'},
        'gpt-4': {'name': 'GPT-4', 'tokenizer': 'tiktoken', 'encoding': 'cl100k_base'},
        'claude-2': {'name': 'Claude 2', 'tokenizer': 'claude', 'encoding': 'claude'},
        'llama-2': {'name': 'Llama 2', 'tokenizer': 'llama', 'encoding': 'llama'},
    }
    
    # 价格配置 (输入/输出, 单位: USD/1000 tokens)
    MODEL_PRICING = {
        'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002},
        'gpt-4': {'input': 0.03, 'output': 0.06},
        'claude-2': {'input': 0.008, 'output': 0.024},
        'llama-2': {'input': 0.0007, 'output': 0.0007},
    }
    
    # 默认汇率
    DEFAULT_EXCHANGE_RATE = 7.2  # 1 USD = 7.2 CNY
```

### 4.4 Tokenizer实现

```python
# app/tokenizers/gpt_tokenizer.py
import tiktoken

class GPTTokenizer:
    def __init__(self, model="gpt-3.5-turbo"):
        self.model = model
        self.encoding = tiktoken.encoding_for_model(model)
    
    def count_tokens(self, text):
        """计算文本的token数"""
        return len(self.encoding.encode(text))
    
    def tokenize(self, text):
        """返回文本的token详情"""
        tokens = self.encoding.encode(text)
        token_bytes = [self.encoding.decode_single_token_bytes(token) for token in tokens]
        token_text = [tb.decode('utf-8', errors='replace') for tb in token_bytes]
        
        result = []
        for i, (token, text) in enumerate(zip(tokens, token_text)):
            result.append({
                'id': i,
                'token': token,
                'text': text,
                'bytes': ' '.join(f'{b:02x}' for b in token_bytes[i])
            })
        
        return result
```

### 4.5 Token计算工具

```python
# app/utils/token_calculator.py
from app.tokenizers import get_tokenizer
from app.config import Config

class TokenCalculator:
    def __init__(self):
        self.tokenizers = {}
    
    def get_tokenizer(self, model):
        if model not in self.tokenizers:
            self.tokenizers[model] = get_tokenizer(model)
        return self.tokenizers[model]
    
    def calculate(self, text, model):
        """计算给定文本的token数"""
        tokenizer = self.get_tokenizer(model)
        return tokenizer.count_tokens(text)
    
    def get_tokens_detail(self, text, model):
        """获取文本的token详细信息"""
        tokenizer = self.get_tokenizer(model)
        return tokenizer.tokenize(text)
    
    def estimate_cost(self, input_tokens, output_tokens, model, exchange_rate=None):
        """估算API调用成本"""
        if exchange_rate is None:
            exchange_rate = Config.DEFAULT_EXCHANGE_RATE
        
        pricing = Config.MODEL_PRICING.get(model, {'input': 0, 'output': 0})
        
        input_cost_usd = (input_tokens / 1000) * pricing['input']
        output_cost_usd = (output_tokens / 1000) * pricing['output']
        total_cost_usd = input_cost_usd + output_cost_usd
        
        return {
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'input_cost_usd': input_cost_usd,
            'output_cost_usd': output_cost_usd,
            'total_cost_usd': total_cost_usd,
            'total_cost_cny': total_cost_usd * exchange_rate,
            'exchange_rate': exchange_rate
        }
```

### 4.6 API路由

```python
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
```

### 4.7 Web路由

```python
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
```

## 5. 前端实现

### 5.1 基础模板

```html
<!-- app/templates/base.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}LLM Token计算器{% endblock %}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}">
    {% block extra_css %}{% endblock %}
</head>
<body data-bs-theme="light">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="{{ url_for('web.index') }}">LLM Token计算器</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="{{ url_for('web.index') }}">首页</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ url_for('web.api_docs') }}">API文档</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <button id="theme-toggle" class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-moon"></i> 切换主题
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container py-4">
        {% block content %}{% endblock %}
    </main>

    <footer class="footer mt-auto py-3 bg-light">
        <div class="container text-center">
            <span class="text-muted">© 2024 LLM Token计算器 | 版本 1.0.0</span>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

### 5.2 主页实现

```html
<!-- app/templates/index.html -->
{% extends "base.html" %}

{% block title %}LLM Token计算器 - 准确计算GPT、Claude等模型的token{% endblock %}

{% block extra_css %}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.css">
{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col">
        <h1 class="display-5">LLM Token计算器</h1>
        <p class="lead">精确计算大语言模型的token消耗量和API调用成本</p>
    </div>
</div>

<div class="row">
    <!-- 输入区域 -->
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title">文本输入</h5>
            </div>
            <div class="card-body">
                <form id="tokenForm">
                    <div class="mb-3">
                        <label for="textInput" class="form-label">输入文本</label>
                        <textarea class="form-control" id="textInput" rows="10" placeholder="在此粘贴或输入文本..."></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label for="modelSelect" class="form-label">选择模型</label>
                        <select class="form-select" id="modelSelect">
                            {% for model_id, model_name in models.items() %}
                                <option value="{{ model_id }}">{{ model_name }}</option>
                            {% endfor %}
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="outputTokens" class="form-label">预估响应Token数</label>
                        <input type="number" class="form-control" id="outputTokens" value="800">
                        <div class="form-text">用于成本计算的预估输出token数量</div>
                    </div>
                    
                    <div class="mb-3">
                        <button class="btn btn-primary" type="submit" id="calculateBtn">计算Token</button>
                        <button class="btn btn-outline-secondary" type="button" id="importBtn">导入文件</button>
                        <input type="file" id="fileInput" accept=".txt,.md,.json" style="display: none;">
                    </div>
                    
                    <div class="accordion" id="advancedOptions">
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#advancedSettings">
                                    高级设置
                                </button>
                            </h2>
                            <div id="advancedSettings" class="accordion-collapse collapse">
                                <div class="accordion-body">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="inputPrice" class="form-label">输入价格($/1K tokens)</label>
                                            <input type="number" class="form-control" id="inputPrice" step="0.0001">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="outputPrice" class="form-label">输出价格($/1K tokens)</label>
                                            <input type="number" class="form-control" id="outputPrice" step="0.0001">
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="exchangeRate" class="form-label">汇率 (USD to CNY)</label>
                                        <input type="number" class="form-control" id="exchangeRate" value="{{ default_exchange_rate }}" step="0.01">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- 结果区域 -->
    <div class="col-lg-6 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title">计算结果</h5>
            </div>
            <div class="card-body">
                <div id="resultLoading" style="display: none;">
                    <div class="d-flex justify-content-center my-5">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">计算中...</span>
                        </div>
                    </div>
                </div>
                
                <div id="resultContent">
                    <div class="alert alert-info" role="alert">
                        输入文本将在此处展示计算结果
                    </div>
                    
                    <div id="resultData" style="display: none;">
                        <div class="card mb-4">
                            <div class="card-header">Token数量</div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="p-3 border bg-light rounded text-center">
                                            <h3 id="inputTokenCount">0</h3>
                                            <small>输入Token</small>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="p-3 border bg-light rounded text-center">
                                            <h3 id="outputTokenCount">0</h3>
                                            <small>输出Token</small>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="p-3 border bg-light rounded text-center">
                                            <h3 id="totalTokenCount">0</h3>
                                            <small>总计Token</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mb-4">
                            <div class="card-header">成本估算</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered">
                                        <thead>
                                            <tr>
                                                <th>费用类型</th>
                                                <th>USD</th>
                                                <th>CNY</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>输入费用</td>
                                                <td id="inputCostUSD">$0.000</td>
                                                <td id="inputCostCNY">¥0.000</td>
                                            </tr>
                                            <tr>
                                                <td>输出费用</td>
                                                <td id="outputCostUSD">$0.000</td>
                                                <td id="outputCostCNY">¥0.000</td>
                                            </tr>
                                            <tr class="table-primary">
                                                <td><strong>总计费用</strong></td>
                                                <td id="totalCostUSD"><strong>$0.000</strong></td>
                                                <td id="totalCostCNY"><strong>¥0.000</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span>Token可视化</span>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary" id="toggleVisualization">
                                        切换视图
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="tokenVisualization" class="mb-2 p-3 border rounded" style="min-height: 100px; max-height: 300px; overflow: auto;">
                                    <div class="text-center text-muted">计算后显示token可视化</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
<script src="{{ url_for('static', filename='js/token-calculator.js') }}"></script>
{% endblock %}
```

### 5.3 主要JavaScript功能

```javascript
// app/static/js/token-calculator.js
$(document).ready(function() {
    // 初始化变量
    let modelPricing = {};
    let currentModel = $('#modelSelect').val();

    // 加载模型数据
    $.getJSON('/api/models', function(data) {
        modelPricing = data.pricing;
        updatePriceInputs();
    });

    // 监听模型选择变化
    $('#modelSelect').on('change', function() {
        currentModel = $(this).val();
        updatePriceInputs();
    });

    // 更新价格输入框
    function updatePriceInputs() {
        const pricing = modelPricing[currentModel];
        if (pricing) {
            $('#inputPrice').val(pricing.input);
            $('#outputPrice').val(pricing.output);
        }
    }

    // 表单提交
    $('#tokenForm').on('submit', function(e) {
        e.preventDefault();
        calculateTokens();
    });

    // 导入文件
    $('#importBtn').on('click', function() {
        $('#fileInput').click();
    });

    $('#fileInput').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            $('#textInput').val(e.target.result);
        };
        reader.readAsText(file);
    });

    // 计算tokens
    function calculateTokens() {
        const text = $('#textInput').val();
        if (!text) {
            alert('请输入文本');
            return;
        }

        const model = currentModel;
        const outputTokens = parseInt($('#outputTokens').val()) || 0;
        const exchangeRate = parseFloat($('#exchangeRate').val()) || 7.2;
        const customPricing = {
            input: parseFloat($('#inputPrice').val()),
            output: parseFloat($('#outputPrice').val())
        };

        // 显示加载状态
        $('#resultLoading').show();
        $('#resultContent').hide();

        // 发送API请求
        $.ajax({
            url: '/api/calculate',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                text: text,
                model: model,
                output_tokens: outputTokens,
                exchange_rate: exchangeRate,
                custom_pricing: customPricing
            }),
            success: function(response) {
                displayResults(response, text);
            },
            error: function(error) {
                console.error('计算出错:', error);
                alert('计算出错: ' + (error.responseJSON?.error || '未知错误'));
            },
            complete: function() {
                $('#resultLoading').hide();
                $('#resultContent').show();
            }
        });
    }

    // 显示计算结果
    function displayResults(response, text) {
        const result = response;
        const cost = result.cost_estimate;
        
        // 更新Token计数
        $('#inputTokenCount').text(result.input_tokens);
        $('#outputTokenCount').text(cost.output_tokens);
        $('#totalTokenCount').text(result.input_tokens + cost.output_tokens);
        
        // 更新成本显示
        $('#inputCostUSD').text('$' + cost.input_cost_usd.toFixed(5));
        $('#outputCostUSD').text('$' + cost.output_cost_usd.toFixed(5));
        $('#totalCostUSD').text('$' + cost.total_cost_usd.toFixed(5));
        
        $('#inputCostCNY').text('¥' + (cost.input_cost_usd * cost.exchange_rate).toFixed(5));
        $('#outputCostCNY').text('¥' + (cost.output_cost_usd * cost.exchange_rate).toFixed(5));
        $('#totalCostCNY').text('¥' + cost.total_cost_cny.toFixed(5));
        
        // 显示结果区域
        $('#resultData').show();
        
        // 渲染Token可视化
        renderTokenVisualization(result.tokens_detail, text);
    }
    
    // Token可视化
    function renderTokenVisualization(tokens, originalText) {
        const container = $('#tokenVisualization');
        container.empty();
        
        if (!tokens || tokens.length === 0) {
            container.html('<div class="text-center text-muted">无token数据</div>');
            return;
        }
        
        // 创建可视化元素
        const tokenElements = tokens.map(token => {
            const el = $('<span>')
                .addClass('token-item')
                .attr('data-token-id', token.id)
                .attr('title', `Token: ${token.token}\nBytes: ${token.bytes}`)
                .text(token.text);
                
            // 特殊字符高亮
            if (token.text.trim() === '' || /[\u0000-\u001F\u007F-\u009F]/.test(token.text)) {
                el.addClass('token-special');
            }
            
            return el;
        });
        
        // 添加到容器
        container.append(tokenElements);
        
        // 添加交互行为
        $('.token-item').hover(
            function() {
                $(this).addClass('token-hover');
            },
            function() {
                $(this).removeClass('token-hover');
            }
        ).click(function() {
            const tokenId = $(this).data('token-id');
            const token = tokens[tokenId];
            
            alert(`Token ID: ${token.id}\nToken值: ${token.token}\n文本: "${token.text}"\n字节: ${token.bytes}`);
        });
    }

    // 切换可视化视图
    $('#toggleVisualization').on('click', function() {
        const container = $('#tokenVisualization');
        container.toggleClass('token-grid-view');
    });
});
```

### 5.4 CSS样式

```css
/* app/static/css/styles.css */
/* 基础样式 */
body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1 0 auto;
}

/* Token可视化样式 */
#tokenVisualization {
    line-height: 1.7;
    word-break: break-word;
}

.token-item {
    display: inline-block;
    padding: 2px 4px;
    margin: 2px;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.token-hover {
    background-color: #e9ecef;
}

.token-special {
    background-color: #fff3cd;
    border-color: #ffeeba;
}

.token-grid-view .token-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin: 3px;
    text-align: center;
    overflow: hidden;
}

/* 深色模式 */
[data-bs-theme="dark"] {
    --bs-body-bg: #212529;
    --bs-body-color: #f8f9fa;
}

[data-bs-theme="dark"] .bg-light {
    background-color: #343a40 !important;
}

[data-bs-theme="dark"] .text-muted {
    color: #adb5bd !important;
}

[data-bs-theme="dark"] .token-item {
    border-color: #495057;
}

[data-bs-theme="dark"] .token-hover {
    background-color: #495057;
}

[data-bs-theme="dark"] .token-special {
    background-color: #664d03;
    border-color: #997404;
}
```

## 6. 部署指南

### 6.1 Docker部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  token-calculator:
    build: .
    container_name: token-calculator
    restart: always
    environment:
      - FLASK_APP=run.py
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY:-default-secret-key}
    volumes:
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    command: gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 "app:create_app()"
```

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建非root用户
RUN useradd -m appuser
USER appuser

# 运行应用
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "app:create_app()"]
```

### 6.2 使用Nginx作为反向代理

```nginx
# nginx配置
server {
    listen 80;
    server_name token-calculator.example.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /path/to/app/static;
        expires 30d;
    }
}
```

### 6.3 部署步骤

1. **准备环境**

   ```bash
   git clone https://github.com/your-repo/token-calculator.git
   cd token-calculator
   cp .env.example .env
   # 编辑.env文件设置必要的环境变量
   ```

2. **使用Docker部署**

   ```bash
   docker-compose up -d
   ```

3. **传统部署**

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # 开发环境
   flask run
   
   # 生产环境
   gunicorn --bind 0.0.0.0:8000 --workers 4 "app:create_app()"
   ```

## 7. API文档

### 7.1 计算Token数量

**请求:**

```txt
POST /api/calculate
Content-Type: application/json
```

**请求体:**

```json
{
  "text": "需要计算token的文本",
  "model": "gpt-3.5-turbo",
  "output_tokens": 800,
  "exchange_rate": 7.2,
  "custom_pricing": {
    "input": 0.0015,
    "output": 0.002
  }
}
```

**响应:**

```json
{
  "success": true,
  "input_tokens": 42,
  "tokens_detail": [
    {
      "id": 0,
      "token": 12345,
      "text": "需",
      "bytes": "e9 9c 80"
    },
    // ...更多token
  ],
  "cost_estimate": {
    "input_tokens": 42,
    "output_tokens": 800,
    "input_cost_usd": 0.000063,
    "output_cost_usd": 0.0016,
    "total_cost_usd": 0.001663,
    "total_cost_cny": 0.01197,
    "exchange_rate": 7.2
  }
}
```

### 7.2 获取模型列表

**请求:**

```txt
GET /api/models
```

**响应:**

```json
{
  "models": {
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
    "gpt-4": "GPT-4",
    "claude-2": "Claude 2",
    "llama-2": "Llama 2"
  },
  "pricing": {
    "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
    "gpt-4": {"input": 0.03, "output": 0.06},
    "claude-2": {"input": 0.008, "output": 0.024},
    "llama-2": {"input": 0.0007, "output": 0.0007}
  }
}
```

## 8. 开发者指南

### 8.1 开发环境设置

1. 克隆代码库

   ```bash
   git clone https://github.com/your-repo/token-calculator.git
   cd token-calculator
   ```

2. 创建虚拟环境

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. 安装依赖

   ```bash
   pip install -r requirements.txt
   ```

4. 配置环境变量

   ```bash
   cp .env.example .env
   # 编辑.env文件
   ```

5. 启动开发服务器

   ```bash
   flask run --debug
   ```

### 8.2 添加新的Tokenizer

要添加新的模型支持，需要以下步骤：

1. 在`app/tokenizers`目录下创建新的tokenizer实现：

   ```python
   # app/tokenizers/new_model_tokenizer.py
   class NewModelTokenizer:
       def __init__(self, model):
           self.model = model
           # 初始化tokenizer
       
       def count_tokens(self, text):
           # 实现token计数逻辑
           pass
       
       def tokenize(self, text):
           # 实现tokenization逻辑
           return []  # 返回token详情列表
   ```

2. 在`app/tokenizers/__init__.py`中注册新的tokenizer：

   ```python
   from .gpt_tokenizer import GPTTokenizer
   from .claude_tokenizer import ClaudeTokenizer
   from .new_model_tokenizer import NewModelTokenizer
   
   def get_tokenizer(model):
       model_info = Config.AVAILABLE_MODELS.get(model)
       
       if not model_info:
           raise ValueError(f"不支持的模型: {model}")
       
       tokenizer_type = model_info['tokenizer']
       
       if tokenizer_type == 'tiktoken':
           return GPTTokenizer(model)
       elif tokenizer_type == 'claude':
           return ClaudeTokenizer(model)
       elif tokenizer_type == 'new_model':
           return NewModelTokenizer(model)
       else:
           raise ValueError(f"未知的tokenizer类型: {tokenizer_type}")
   ```

3. 在`app/config.py`中添加新模型配置：

   ```python
   AVAILABLE_MODELS = {
       # 现有模型...
       'new-model': {'name': 'New Model', 'tokenizer': 'new_model', 'encoding': 'new_model'},
   }
   
   MODEL_PRICING = {
       # 现有价格...
       'new-model': {'input': 0.001, 'output': 0.001},
   }
   ```

### 8.3 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_tokenizers.py

# 运行特定测试用例
pytest tests/test_tokenizers.py::test_gpt_tokenizer
```

### 8.4 代码规范

项目使用Black进行代码格式化，使用Flake8进行代码规范检查：

```bash
# 格式化代码
black app tests

# 检查代码规范
flake8 app tests
```

## 9. 联系与支持

如有问题、建议或反馈，请通过以下方式联系我们：

- GitHub Issue: [https://github.com/synopai/token-calculator/issues](https://github.com/synopai/token-calculator/issues)
- Email: [snychng@gmail.com](mailto:snychng@gmail.com)

---

© 2024 LLM Token计算器 | 版本 1.0.0
