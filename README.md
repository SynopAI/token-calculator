# LLM Token计算器

![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![许可证](https://img.shields.io/badge/许可证-MIT-green)

LLM Token计算器是一款专业工具，用于准确计算和可视化大型语言模型(LLM)的token消耗及相关成本，帮助AI开发者和用户更有效地规划和管理API调用预算。

![应用截图](https://via.placeholder.com/800x450?text=LLM+Token计算器截图)

## ✨ 功能特点

- 📊 **精确计算Token**: 支持多种主流大语言模型的token计算方式
- 💰 **成本估算**: 自动计算API调用成本(美元和人民币)
- 🔍 **Token可视化**: 直观展示文本如何被拆分为tokens
- 🌓 **深色/浅色主题**: 支持两种显示模式，适应不同使用场景
- 📁 **文件导入**: 支持导入文本文件进行token分析
- ⚙️ **高级选项**: 自定义价格和汇率设置

## 🚀 快速开始

### 前置要求

- Node.js 16.0或更高版本
- npm 7.0或更高版本

### 安装步骤

1. 克隆仓库

    ```bash
    git clone https://github.com/SynopAI/token-calculator.git
    cd token-calculator
    ```

2. 安装依赖

    ```bash
    npm install
    ```

3. 启动开发服务器

    ```bash
    npm run dev
    ```

4. 打开浏览器访问 [http://localhost:5173](http://localhost:5173)

### 生产构建

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中，可部署到任何静态网站服务器。

## 📖 使用指南

### 基础使用

1. **输入文本**: 在文本输入区域输入或粘贴您想分析的文本
2. **选择模型**: 从模型列表中选择需要计算的语言模型
3. **查看结果**: 应用将实时显示token数量及预估成本
4. **查看token拆分**: 在Token可视化区域查看文本如何被拆分成tokens

### 高级功能

1. **导入文件**: 点击"导入文件"按钮，上传.txt、.md或.json文本文件
2. **自定义价格**: 在高级选项区域设置自定义的token价格
3. **调整汇率**: 修改USD与CNY之间的汇率
4. **切换主题**: 点击右上角的主题按钮，在深色和浅色主题之间切换

## 🧰 技术栈

- **React**: 用户界面构建
- **Material UI**: UI组件库和设计系统
- **js-tiktoken/自定义tokenizer**: token计算服务
- **Vite**: 前端构建工具

## 🤝 贡献指南

我们欢迎并感谢任何形式的贡献！如果您想为项目做出贡献，请遵循以下步骤：

1. Fork此仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

请确保您的代码遵循现有的风格规范，并添加适当的测试。

## 📚 更多文档

- [产品文档](./PRODUCT.md) - 详细的产品功能描述和使用指南
- [技术文档](./TECHNICAL.md) - 技术架构和实现细节

## 📄 许可证

本项目采用MIT许可证 - 详见 [LICENSE](../LICENSE) 文件

## 📬 联系方式

如有问题、建议或反馈，请通过以下方式联系我们：

- GitHub Issues: [https://github.com/SynopAI/token-calculator/issues](https://github.com/SynopAI/token-calculator/issues)
- Email: [snychng@gmail.com](mailto:snychng@gmail.com)
