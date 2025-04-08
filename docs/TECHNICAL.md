# LLM Token计算器 - 技术文档

## 1. 技术架构概述

LLM Token计算器是一款基于React的单页面应用(SPA)，采用现代前端技术栈构建。应用使用Material UI作为组件库，提供一致的用户界面体验，并使用自定义的tokenizer服务计算不同语言模型的token。

### 1.1 核心技术栈

- **React**: 用于构建用户界面的JavaScript库
- **Material UI**: React组件库，提供设计良好的UI元素
- **js-tiktoken/自定义tokenizer**: 用于计算和分析文本token
- **Vite**: 现代前端构建工具，提供快速的开发体验

### 1.2 系统架构

应用采用组件化架构，主要分为以下几个部分：

1. **UI组件层**: 处理用户界面的呈现和交互
2. **业务逻辑层**: 处理token计算、成本估算等核心功能
3. **服务层**: 提供tokenizer和价格计算等服务
4. **状态管理**: 使用React Hooks管理应用状态

## 2. 项目结构

```txt
token-calculator/
├── docs/                   # 项目文档
├── public/                 # 静态资源
├── src/
│   ├── components/         # UI组件
│   │   ├── Header.jsx      # 头部导航组件
│   │   ├── TokenInput.jsx  # 文本输入组件
│   │   ├── ModelSelector.jsx # 模型选择组件
│   │   ├── ResultsDisplay.jsx # 结果显示组件
│   │   ├── TokenVisualizer.jsx # token可视化组件
│   │   ├── AdvancedOptions.jsx # 高级选项组件
│   │   ├── ThemeToggle.jsx # 主题切换组件
│   │   └── Footer.jsx      # 页脚组件
│   ├── hooks/              # 自定义React Hooks
│   │   ├── useTheme.jsx    # 主题管理hook
│   │   └── useTokenCalculation.jsx # token计算hook
│   ├── services/           # 核心服务
│   │   ├── tokenizers.jsx  # tokenizer服务
│   │   └── pricingService.jsx # 价格计算服务
│   ├── theme.jsx           # 主题配置
│   ├── App.jsx             # 应用主组件
│   ├── main.jsx           # 应用入口文件
│   └── index.css          # 全局样式
├── vite.config.js         # Vite配置文件
├── package.json           # 项目依赖声明
└── README.md              # 项目说明
```

## 3. 核心模块详解

### 3.1 UI组件

#### 3.1.1 TokenInput.jsx

文本输入组件，支持用户输入文本和导入文件。

**主要功能**:

- 提供多行文本输入区
- 支持文件上传和读取
- 文本清空功能

**关键实现**:

```jsx
// 文件上传处理
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    setText(event.target.result);
  };
  reader.readAsText(file);
};
```

#### 3.1.2 ModelSelector.jsx

模型选择组件，支持用户选择不同的LLM模型。

**主要功能**:

- 展示支持的模型列表
- 提供模型选择功能
- 显示模型提供商信息

**数据结构**:

```jsx
const models = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  // 更多模型...
];
```

#### 3.1.3 ResultsDisplay.jsx

结果显示组件，展示计算的token数量和估算成本。

**主要功能**:

- 显示token总数
- 计算并显示美元和人民币成本
- 处理加载状态

**关键实现**:

```jsx
// 格式化货币显示
const formatCost = (cost) => {
  if (cost < 0.01) {
    return cost.toFixed(6);
  }
  return cost.toFixed(4);
};
```

#### 3.1.4 TokenVisualizer.jsx

token可视化组件，展示文本如何被拆分为tokens。

**主要功能**:

- 显示token拆分结果
- 特殊token高亮
- token详细信息查看

**关键实现**:

```jsx
// Token样式计算
const getTokenStyle = (token) => {
  if (token.isSpecial) {
    return { backgroundColor: '...', color: '...' };
  }
  return { backgroundColor: '...', color: '...' };
};
```

### 3.2 核心服务

#### 3.2.1 tokenizers.jsx

提供token计算服务，将文本解析为tokens。

**主要功能**:

- 文本token化处理
- 支持不同模型的tokenizer规则
- 计算token数量和详情

**关键实现**:

```jsx
// 简化的tokenizer实现
export const tokenizeText = async (text, model) => {
  // 解析文本为tokens
  // 返回token数量和详细信息
};
```

#### 3.2.2 pricingService.jsx

提供价格计算服务，计算不同模型的API调用成本。

**主要功能**:

- 维护不同模型的价格数据
- 计算token对应的成本
- 货币转换功能

**数据结构**:

```jsx
// 模型价格配置
const MODEL_PRICING = {
  'gpt-3.5-turbo': {
    input: 0.0005,
    output: 0.0015
  },
  // 更多模型价格...
};
```

### 3.3 自定义Hooks

#### 3.3.1 useTheme.jsx

管理应用主题状态，支持深色和浅色主题切换。

**主要功能**:

- 读取和保存主题偏好
- 根据系统设置提供默认主题
- 主题状态管理和持久化

**关键实现**:

```jsx
export default function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode];
}
```

#### 3.3.2 useTokenCalculation.jsx

处理token计算逻辑，提供计算结果给UI组件。

**主要功能**:

- 监听输入文本和模型变化
- 调用tokenizer服务计算token
- 防抖处理，避免频繁计算
- 提供计算结果状态

**关键实现**:

```jsx
// 防抖计算功能
useEffect(() => {
  const calculateTokens = async () => {
    // 计算token逻辑
  };

  const timeoutId = setTimeout(calculateTokens, 300); // 300ms防抖
  return () => clearTimeout(timeoutId);
}, [text, model]);
```

## 4. 数据流与状态管理

### 4.1 状态管理策略

应用使用React Hooks管理状态，主要包括:

1. **文本输入状态**: 在App组件中维护，通过props传递
2. **选择的模型**: 在App组件中维护，通过props传递
3. **计算结果**: 使用useTokenCalculation钩子计算和管理
4. **UI状态**: 如主题设置、高级选项展开状态等，在各自组件中维护

### 4.2 主要数据流

```txt
用户输入 -> TokenInput组件 -> App组件状态更新 -> useTokenCalculation钩子
       -> tokenizers服务计算 -> 更新结果状态 -> ResultsDisplay & TokenVisualizer展示
```

## 5. 关键算法实现

### 5.1 Token计算逻辑

Token计算是应用的核心功能，实现方式有两种:

1. **使用第三方库**: 如tiktoken、js-tiktoken等
2. **简易实现**: 使用正则表达式和规则估算token

简易实现示例:

```jsx
// 使用正则表达式拆分token
const tokenRegex = /\b\w+\b|\s+|[^\w\s]/g;
const matches = text.match(tokenRegex) || [];
// 处理token...
```

### 5.2 特殊字符识别

识别特殊字符和非ASCII字符的Token:

```jsx
// 检查是否为特殊字符
const isSpecial = /^[\p{P}\p{S}]|^\s+$/u.test(decoded) || !isPrintableASCII(decoded);

// 检查是否为可打印ASCII
function isPrintableASCII(text) {
  return /^[\x20-\x7E]*$/.test(text);
}
```

## 6. 性能优化策略

### 6.1 已实施的优化

1. **输入防抖**: 使用setTimeout实现300ms防抖，避免频繁计算
2. **延迟计算**: 大文本计算前增加短暂延迟，防止UI阻塞
3. **分批处理**: 大文本分批解析和渲染
4. **条件渲染**: 根据数据状态条件渲染组件
5. **持久化缓存**: 使用localStorage缓存用户偏好设置

### 6.2 潜在的进一步优化

1. **Web Worker**: 将token计算移至Web Worker中，避免主线程阻塞
2. **虚拟列表**: 大量token展示时使用虚拟列表优化渲染
3. **缓存计算结果**: 缓存相同文本的计算结果
4. **延迟加载**: 非核心功能和组件的延迟加载

## 7. 扩展开发指南

### 7.1 添加新的模型支持

要添加新的语言模型支持，需要更新以下文件:

1. **ModelSelector.jsx**: 添加新模型到模型列表

   ```jsx
   const models = [
     // 现有模型...
     { id: 'new-model', name: 'New Model', provider: 'Provider Name' },
   ];
   ```

2. **pricingService.jsx**: 添加新模型的价格信息

   ```jsx
   const MODEL_PRICING = {
     // 现有模型...
     'new-model': {
       input: 0.001,
       output: 0.002
     },
   };
   ```

3. **tokenizers.jsx**: 为新模型添加对应的tokenizer支持

   ```jsx
   const MODEL_ENCODINGS = {
     // 现有映射...
     'new-model': 'encoding_name',
   };
   ```

### 7.2 自定义主题

可以通过修改theme.jsx文件自定义应用主题:

```jsx
export const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#YOUR_COLOR_CODE',
    },
    // 其他颜色设置...
  },
  // 字体、间距等其他设置...
});
```

## 8. 已知问题与解决方案

### 8.1 WebAssembly兼容性问题

**问题**: 某些tokenizer库依赖WebAssembly，在某些环境中可能不兼容。

**解决方案**:

1. 使用Vite插件处理WebAssembly: vite-plugin-wasm和vite-plugin-top-level-await
2. 提供降级选项，使用纯JavaScript实现的简易tokenizer

### 8.2 大文本性能问题

**问题**: 处理极大文本(>10万字符)时可能出现性能延迟。

**解决方案**:

1. 实现分块处理，每次处理固定大小的文本块
2. 添加进度指示器，提高用户体验
3. 考虑使用Web Worker进行后台计算

## 9. 部署指南

### 9.1 生产构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 9.2 推荐的部署平台

- **Vercel**: 简单快捷，自动集成CI/CD
- **Netlify**: 类似Vercel，提供免费套餐
- **GitHub Pages**: 适合静态网站部署
- **AWS S3 + CloudFront**: 企业级部署选项

### 9.3 环境要求

- Node.js 16.0或更高版本
- 现代浏览器支持(Chrome, Firefox, Safari, Edge的最新版本)

## 10. 贡献指南

### 10.1 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/llm-token-calculator.git
cd llm-token-calculator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 10.2 提交规范

- 使用语义化版本控制
- 提交信息格式: `类型(范围): 描述`，例如 `feat(tokenizer): 添加Claude模型支持`
- 类型包括: feat, fix, docs, style, refactor, test, chore

### 10.3 代码风格

- 使用ESLint和Prettier保持代码风格一致
- 组件使用函数式组件和Hooks
- 文件命名采用PascalCase(组件)和camelCase(非组件)

---

© 2024 LLM Token计算器 | 技术文档版本 1.0.0
