# LLM Token计算器 - 技术文档

## 1. 项目概述

本项目是一个基于Flask的Web应用，用于计算各种LLM模型的token数量和成本。支持多种主流LLM模型，包括GPT-3.5/4、Claude 2和Llama 2等。

## 2. 技术栈

- 后端：Python + Flask
- 前端：HTML + CSS + JavaScript
- 开发工具：Docker (可选)

## 3. 项目结构

```txt
.
├── app.py              # 主应用入口
├── app/                # 应用核心目录
│   ├── static/         # 静态资源
│   ├── templates/      # 模板文件
│   ├── tokenizers/     # 分词器实现
│   └── utils/          # 工具类
├── docs/              # 文档
├── static/            # 全局静态资源
├── templates/         # 全局模板
└── tests/             # 测试用例
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
