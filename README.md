# LLM Token计算器

一个基于Python Flask和Bootstrap的Web应用，用于计算和可视化大型语言模型(LLM)的token消耗及相关成本。

## 功能特点

- 精确计算LLM模型的token数量
- 支持多种主流模型（GPT-3.5、GPT-4、Claude等）
- 实时成本估算（USD/CNY）
- Token可视化展示
- 提供REST API接口

## 技术栈

- Backend: Python Flask
- Frontend: Bootstrap
- Token计算: tiktoken
- 表单处理: Flask-WTF

## 快速开始

1. 克隆仓库

    ```bash
    git clone https://github.com/yourusername/token-calculator.git
    cd token-calculator
    ```

2. 安装依赖

    ```bash
    pip install -r requirements.txt
    ```

3. 运行应用

```bash
python app.py
```

访问 [http://localhost:5000](http://localhost:5000) 开始使用

## API使用

### 计算Tokens

```bash
curl -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, World!","model":"gpt-3.5-turbo"}'
```

## 文档

- [产品文档](docs/PRODUCT.md)
- [技术文档](docs/TECHNICAL.md)

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- GitHub Issues: [提交问题](https://github.com/synopai/token-calculator/issues)
- Email: [snychng@gmail.com](mailto:snychng@gmail.com)