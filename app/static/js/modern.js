$(document).ready(function () {
    // 初始化变量
    let modelPricing = {};
    let defaultModel = 'gpt-4o';
    let currentModel = defaultModel;
    let currentView = 'text'; // 默认视图模式: 'text' 或 'ids'
    let autoCalculate = true; // 是否自动计算

    // 加载模型数据
    $.getJSON('/api/models', function (data) {
        modelPricing = data.pricing;
        updatePriceInputs();

        // 如果有文本，自动计算一次
        const textInput = $('#textInput');
        if (textInput.val().trim() !== '') {
            calculateTokens();
        }
    }).fail(function () {
        // 如果API调用失败，使用默认值
        modelPricing = {
            'gpt-4o': { input: 0.01, output: 0.03 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'claude-2': { input: 0.008, output: 0.024 },
            'llama-2': { input: 0.0007, output: 0.0007 }
        };

        updatePriceInputs();
    });

    // 监听模型选择变化
    $('#modelSelect').on('change', function () {
        currentModel = $(this).val();
        updatePriceInputs();

        if (autoCalculate && $('#textInput').val().trim() !== '') {
            calculateTokens();
        }
    });

    // 更新价格输入框
    function updatePriceInputs() {
        const pricing = modelPricing[currentModel] || { input: 0, output: 0 };
        $('#inputPrice').val(pricing.input);
        $('#outputPrice').val(pricing.output);
    }

    // 可折叠卡片
    $('.card-header.clickable').on('click', function () {
        const targetId = $(this).data('target');
        const card = $(this).closest('.collapsible-card');

        card.toggleClass('collapsed');

        // 平滑动画效果
        if (card.hasClass('collapsed')) {
            $('#' + targetId).slideUp(200);
        } else {
            $('#' + targetId).slideDown(200);
        }
    });

    // 自动监听文本变化并计算tokens
    $('#textInput').on('input', debounce(function () {
        if (autoCalculate) {
            calculateTokens();
        }
    }, 500));

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // 计算按钮点击事件
    $('#calculateBtn').on('click', function () {
        calculateTokens();
    });

    // 导入文件按钮点击事件
    $('#importBtn').on('click', function () {
        $('#fileInput').click();
    });

    // 文件选择处理
    $('#fileInput').on('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            $('#textInput').val(e.target.result);
            if (autoCalculate) {
                calculateTokens();
            }
        };
        reader.readAsText(file);
    });

    // 点击tab按钮
    $('.tab-button').on('click', function () {
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        currentView = $(this).data('view');

        if ($('#resultData').is(':visible')) {
            updateVisualization();
        }
    });

    // 切换主题
    $('#theme-toggle').on('click', function () {
        $('body').toggleClass('light-theme');
    });

    // 计算tokens
    function calculateTokens() {
        const text = $('#textInput').val();
        if (!text || text.trim() === '') {
            $('#resultLoading').hide();
            $('#emptyState').show();
            $('#resultData').hide();
            return;
        }

        const model = currentModel;
        const outputTokens = parseInt($('#outputTokens').val()) || 0;
        const exchangeRate = parseFloat($('#exchangeRate').val()) || 7.2;
        const inputPrice = parseFloat($('#inputPrice').val());
        const outputPrice = parseFloat($('#outputPrice').val());

        // 显示加载状态
        $('#resultLoading').show();
        $('#emptyState').hide();
        $('#resultData').hide();

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
            }),
            success: function (response) {
                displayResults(response);
            },
            error: function (error) {
                console.error('计算出错:', error);
                $('#resultLoading').hide();
                $('#emptyState').show();
                $('#emptyState').find('p').text('计算出错: ' + (error.responseJSON?.error || '未知错误'));
            }
        });
    }

    // 显示结果
    function displayResults(response) {
        const result = response;
        const cost = result.cost_estimate;

        // 更新Token计数
        $('#inputTokenCount').text(result.input_tokens.toLocaleString());
        $('#outputTokenCount').text(cost.output_tokens.toLocaleString());
        $('#totalTokenCount').text((result.input_tokens + cost.output_tokens).toLocaleString());

        // 更新成本显示
        $('#inputCostUSD').text('$' + cost.input_cost_usd.toFixed(5));
        $('#outputCostUSD').text('$' + cost.output_cost_usd.toFixed(5));
        $('#totalCostUSD').text('$' + cost.total_cost_usd.toFixed(5));

        $('#inputCostCNY').text('¥' + (cost.input_cost_usd * cost.exchange_rate).toFixed(5));
        $('#outputCostCNY').text('¥' + (cost.output_cost_usd * cost.exchange_rate).toFixed(5));
        $('#totalCostCNY').text('¥' + cost.total_cost_cny.toFixed(5));

        // 存储token详情
        window.tokensData = result.tokens_detail;

        // 渲染Token可视化
        renderTokenVisualization(result.tokens_detail);

        // 隐藏加载状态，显示结果
        $('#resultLoading').hide();
        $('#resultData').show();
    }

    // 更新可视化
    function updateVisualization() {
        if (window.tokensData) {
            renderTokenVisualization(window.tokensData);
        }
    }

    // Token可视化渲染
    function renderTokenVisualization(tokens) {
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
        $('<style>').text(`
            .token-detail-popup {
                position: absolute;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: var(--radius-md);
                padding: var(--space-md);
                min-width: 250px;
                box-shadow: var(--shadow-lg);
                z-index: 100;
                animation: fadeIn 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .detail-header {
                font-weight: 600;
                margin-bottom: var(--space-sm);
                padding-bottom: var(--space-sm);
                border-bottom: 1px solid var(--border);
                font-size: 15px;
            }
            
            .detail-content {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
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
        `).appendTo('head');

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