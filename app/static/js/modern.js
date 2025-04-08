$(document).ready(function () {
    // 初始化变量
    let modelPricing = {};
    let defaultModel = 'gpt-4o';
    let currentModel = defaultModel;
    let currentView = 'text'; // 默认视图模式: 'text' 或 'ids'
    let autoCalculate = true; // 是否自动计算
    let apiCallInProgress = false; // 防止并发API调用
    let lastText = ''; // 上次处理的文本
    let tokensData = null; // 缓存令牌数据

    // 初始化页面状态
    initializePage();

    // 初始化页面
    function initializePage() {
        // 初始UI状态
        $('#resultLoading').hide();
        $('#resultData').hide();
        $('#emptyState').show();

        // 加载模型数据
        $.getJSON('/api/models')
            .done(function (data) {
                modelPricing = data.pricing;
                updatePriceInputs();

                // 如果有文本，初始计算一次
                checkInitialText();
            })
            .fail(function () {
                console.warn("无法加载模型数据，使用默认值");
                modelPricing = {
                    'gpt-4o': { input: 0.01, output: 0.03 },
                    'gpt-4-turbo': { input: 0.01, output: 0.03 },
                    'gpt-4': { input: 0.03, output: 0.06 },
                    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
                };
                updatePriceInputs();

                // 如果有文本，初始计算一次
                checkInitialText();
            });

        // 监听输入事件 - 使用防抖函数
        $('#textInput').on('input', debounce(function () {
            const text = $(this).val().trim();

            // 忽略空文本
            if (!text) {
                updateEmptyState();
                return;
            }

            // 处理文本变化
            handleTextChange(text);
        }, 600)); // 使用较长的延迟以减少API调用

        // 只在按钮点击时才显示加载状态
        $('#calculateBtn').on('click', function (e) {
            e.preventDefault(); // 防止表单提交

            const text = $('#textInput').val().trim();
            if (!text) {
                updateEmptyState();
                return;
            }

            // 强制进行新的计算
            forcedCalculation(text);
        });

        // 监听模型选择变化
        $('#modelSelect').on('change', function () {
            currentModel = $(this).val();
            updatePriceInputs();

            const text = $('#textInput').val().trim();
            if (text) {
                handleTextChange(text, true);
            }
        });

        // 监听输出token数量变化
        $('#outputTokens').on('change', function () {
            if (tokensData) {
                updateCostDisplay();
            }
        });

        // 高级设置展开/折叠
        $('.card-header.clickable').on('click', function () {
            const targetId = $(this).data('target');
            const card = $(this).closest('.collapsible-card');

            card.toggleClass('collapsed');
            if (card.hasClass('collapsed')) {
                $('#' + targetId).slideUp(200);
            } else {
                $('#' + targetId).slideDown(200);
            }
        });

        // 导入文件
        $('#importBtn').on('click', function () {
            $('#fileInput').click();
        });

        $('#fileInput').on('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                $('#textInput').val(e.target.result);
                const text = e.target.result.trim();
                if (text) {
                    forcedCalculation(text);
                }
            };
            reader.readAsText(file);
        });

        // 处理视图切换
        $('.tab-button').on('click', function () {
            $('.tab-button').removeClass('active');
            $(this).addClass('active');
            currentView = $(this).data('view');

            if (tokensData) {
                updateTokenVisualization();
            }
        });

        // 处理主题切换
        $('#theme-toggle').on('click', function () {
            $('body').toggleClass('light-theme');
        });
    }

    // 检查页面加载时是否已有文本
    function checkInitialText() {
        const text = $('#textInput').val().trim();
        if (text) {
            handleTextChange(text, true);
        }
    }

    // 更新价格输入框
    function updatePriceInputs() {
        const pricing = modelPricing[currentModel] || { input: 0, output: 0 };
        $('#inputPrice').val(pricing.input);
        $('#outputPrice').val(pricing.output);
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }

    // 处理文本变化
    function handleTextChange(text, forceUpdate = false) {
        // 如果文本没有变化且不是强制更新，忽略
        if (text === lastText && !forceUpdate) {
            return;
        }

        // 更新上次处理的文本
        lastText = text;

        // 如果自动计算开启，调用API
        if (autoCalculate) {
            calculateTokens(text, false); // 不显示加载状态
        }
    }

    // 强制计算 - 用于按钮点击时
    function forcedCalculation(text) {
        calculateTokens(text, true); // 显示加载状态
    }

    // 计算tokens
    function calculateTokens(text, showLoading) {
        // 防止并发API调用
        if (apiCallInProgress) {
            return;
        }

        // 标记API调用正在进行
        apiCallInProgress = true;

        // 如果需要显示加载状态
        if (showLoading) {
            // 保留当前结果，只显示半透明加载层
            if (!$('#resultData').is(':visible')) {
                $('#emptyState').hide();
            }
            $('#resultLoading').fadeIn(100);
        }

        // 准备请求数据
        const model = currentModel;
        const outputTokens = parseInt($('#outputTokens').val()) || 0;
        const exchangeRate = parseFloat($('#exchangeRate').val()) || 7.2;
        const inputPrice = parseFloat($('#inputPrice').val());
        const outputPrice = parseFloat($('#outputPrice').val());

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
                custom_pricing: {
                    input: inputPrice,
                    output: outputPrice
                }
            })
        })
            .done(function (response) {
                // 存储结果
                tokensData = response;

                // 更新UI
                updateResultsUI();

                // 首次加载时显示结果
                if (!$('#resultData').is(':visible')) {
                    $('#emptyState').hide();
                    $('#resultData').fadeIn(200);
                }
            })
            .fail(function (error) {
                console.error('计算出错:', error);

                // 如果结果区域不可见，显示错误提示
                if (!$('#resultData').is(':visible')) {
                    $('#emptyState').show();
                    $('#emptyState').find('p').text('计算出错: ' + (error.responseJSON?.error || '未知错误'));
                }
            })
            .always(function () {
                // 完成API调用
                apiCallInProgress = false;

                // 隐藏加载状态
                $('#resultLoading').fadeOut(100);
            });
    }

    // 更新UI为空状态
    function updateEmptyState() {
        $('#resultData').hide();
        $('#emptyState').show();
        $('#emptyState').find('p').text('输入文本并点击计算按钮\n查看Token详细信息');
    }

    // 更新结果UI
    function updateResultsUI() {
        if (!tokensData) return;

        // 更新Token计数
        updateTokenCount();

        // 更新成本估算
        updateCostDisplay();

        // 更新Token可视化
        updateTokenVisualization();
    }

    // 更新Token计数显示
    function updateTokenCount() {
        const result = tokensData;
        const cost = result.cost_estimate;

        $('#inputTokenCount').text(result.input_tokens.toLocaleString());
        $('#outputTokenCount').text(cost.output_tokens.toLocaleString());
        $('#totalTokenCount').text((result.input_tokens + cost.output_tokens).toLocaleString());
    }

    // 更新成本显示
    function updateCostDisplay() {
        if (!tokensData) return;

        const result = tokensData;
        const cost = result.cost_estimate;

        // 如果输出token数量已更改，重新计算成本
        const currentOutputTokens = parseInt($('#outputTokens').val()) || 0;
        if (currentOutputTokens !== cost.output_tokens) {
            // 重新计算输出成本
            const outputPrice = parseFloat($('#outputPrice').val());
            const exchangeRate = parseFloat($('#exchangeRate').val()) || 7.2;

            // 更新输出和总成本
            cost.output_tokens = currentOutputTokens;
            cost.output_cost_usd = (currentOutputTokens / 1000) * outputPrice;
            cost.total_cost_usd = cost.input_cost_usd + cost.output_cost_usd;
            cost.total_cost_cny = cost.total_cost_usd * exchangeRate;
        }

        // 更新UI显示
        $('#inputCostUSD').text('$' + cost.input_cost_usd.toFixed(5));
        $('#outputCostUSD').text('$' + cost.output_cost_usd.toFixed(5));
        $('#totalCostUSD').text('$' + cost.total_cost_usd.toFixed(5));

        $('#inputCostCNY').text('¥' + (cost.input_cost_usd * cost.exchange_rate).toFixed(5));
        $('#outputCostCNY').text('¥' + (cost.output_cost_usd * cost.exchange_rate).toFixed(5));
        $('#totalCostCNY').text('¥' + cost.total_cost_cny.toFixed(5));
    }

    // 更新Token可视化
    function updateTokenVisualization() {
        if (!tokensData) return;

        const tokens = tokensData.tokens_detail;
        const container = $('#tokenVisualization');
        container.empty();

        if (!tokens || tokens.length === 0) {
            container.html('<div class="text-center">无token数据</div>');
            return;
        }

        // 根据视图模式渲染不同内容
        if (currentView === 'text') {
            renderTextView(tokens, container);
        } else {
            renderIdsView(tokens, container);
        }
    }

    // 文本视图
    function renderTextView(tokens, container) {
        tokens.forEach(token => {
            const tokenType = getTokenType(token);

            const el = $('<span>')
                .addClass('token-item')
                .addClass(tokenType)
                .attr('data-token-id', token.id)
                .attr('data-token-value', token.token)
                .attr('title', `Token: ${token.token}`)
                .text(token.text);

            container.append(el);
        });

        // Token点击事件
        $('.token-item').click(function () {
            const tokenId = $(this).data('token-id');
            const token = tokens[tokenId];

            // 创建一个优雅的弹出提示
            showTokenDetail(token, this);
        });
    }

    // ID视图
    function renderIdsView(tokens, container) {
        const table = $('<table class="token-id-table">');
        const thead = $('<thead>').appendTo(table);
        const tbody = $('<tbody>').appendTo(table);

        thead.append(`
            <tr>
                <th>ID</th>
                <th>Token</th>
                <th>文本</th>
                <th>字节</th>
            </tr>
        `);

        tokens.forEach(token => {
            const row = $('<tr>');
            row.append(`<td>${token.id}</td>`);
            row.append(`<td>${token.token}</td>`);
            row.append(`<td>${escapeHtml(token.text)}</td>`);
            row.append(`<td>${token.bytes}</td>`);
            tbody.append(row);
        });

        container.append(table);
    }

    // 显示Token详情
    function showTokenDetail(token, element) {
        // 移除任何已存在的Token详情
        $('.token-detail-popup').remove();

        // 创建详情弹窗
        const popup = $('<div class="token-detail-popup">');
        popup.html(`
            <div class="detail-header">Token详情</div>
            <div class="detail-content">
                <div class="detail-row"><span>ID:</span> <strong>${token.id}</strong></div>
                <div class="detail-row"><span>值:</span> <strong>${token.token}</strong></div>
                <div class="detail-row"><span>文本:</span> <strong>"${escapeHtml(token.text)}"</strong></div>
                <div class="detail-row"><span>字节:</span> <strong>${token.bytes || 'N/A'}</strong></div>
            </div>
            <div class="detail-close">×</div>
        `);

        // 添加样式
        $('head').append(`
            <style>
                .token-detail-popup {
                    position: absolute;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px;
                    min-width: 250px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 100;
                    animation: fadeIn 0.2s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .detail-header {
                    font-weight: 600;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border);
                    font-size: 15px;
                }
                
                .detail-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                }
                
                .detail-row span {
                    color: var(--text-secondary);
                }
                
                .detail-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 18px;
                    color: var(--text-secondary);
                    border-radius: 50%;
                }
                
                .detail-close:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
            </style>
        `);

        // 添加到页面并定位
        $('body').append(popup);

        // 计算位置
        const rect = element.getBoundingClientRect();
        const popupHeight = popup.outerHeight();
        const popupWidth = popup.outerWidth();
        const windowHeight = $(window).height();
        const windowWidth = $(window).width();

        // 检查是否有足够空间在下方显示
        let top = rect.bottom + 5;
        if (top + popupHeight > windowHeight) {
            top = rect.top - popupHeight - 5;
        }

        // 检查左右位置
        let left = rect.left;
        if (left + popupWidth > windowWidth) {
            left = windowWidth - popupWidth - 5;
        }

        // 设置位置
        popup.css({
            top: top + 'px',
            left: left + 'px'
        });

        // 关闭按钮事件
        $('.detail-close').on('click', function () {
            popup.remove();
        });

        // 点击任意位置关闭
        $(document).on('click', function (e) {
            if (!$(e.target).closest('.token-detail-popup, .token-item').length) {
                popup.remove();
            }
        });
    }

    // 确定Token类型
    function getTokenType(token) {
        const text = token.text;

        if (!text || text.trim() === '') {
            return 'token-type-whitespace';
        }

        if (/^[0-9.]+$/.test(text)) {
            return 'token-type-number';
        }

        if (/^[.,!?;:'"\-()[\]{}]$/.test(text)) {
            return 'token-type-punctuation';
        }

        if (/[\u0000-\u001F\u007F-\u009F]/.test(text) || /^\s+$/.test(text)) {
            return 'token-type-special';
        }

        if (/^[a-zA-Z]+$/.test(text)) {
            return 'token-type-word';
        }

        return 'token-type-default';
    }

    // HTML转义
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});