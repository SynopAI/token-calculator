$(document).ready(function () {
    // 初始化变量
    let modelPricing = {};
    let currentModel = $('#modelSelect').val();
    let currentView = 'text'; // 默认视图模式: 'text' 或 'ids'

    // RGB值对象，用于计算样式
    const rgbValues = {
        '--accent-blue-rgb': '10, 132, 255',
        '--accent-purple-rgb': '191, 90, 242',
        '--accent-pink-rgb': '255, 55, 95',
        '--accent-orange-rgb': '255, 159, 10',
        '--accent-yellow-rgb': '255, 214, 10',
        '--accent-green-rgb': '48, 209, 88',
        '--accent-teal-rgb': '100, 210, 255'
    };

    // 为根元素添加RGB变量
    const root = document.documentElement;
    Object.entries(rgbValues).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // 加载模型数据
    $.getJSON('/api/models', function (data) {
        modelPricing = data.pricing;
        updatePriceInputs();
    }).fail(function () {
        // 如果API调用失败，使用默认值
        modelPricing = {
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'gpt-4': { input: 0.03, output: 0.06 },
            'claude-2': { input: 0.008, output: 0.024 },
            'llama-2': { input: 0.0007, output: 0.0007 }
        };
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

    // 监听模型选择变化
    $('#modelSelect').on('change', function () {
        currentModel = $(this).val();
        updatePriceInputs();
    });

    // 高级设置展开/收起
    $('.settings-header').on('click', function () {
        $('#advancedSettings').toggleClass('show');
        $(this).find('.chevron-icon').toggleClass('rotated');
    });

    // 表单提交计算Token
    $('#tokenForm').on('submit', function (e) {
        e.preventDefault();
        calculateTokens();
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
        };
        reader.readAsText(file);
    });

    // 切换视图模式（文本/Token IDs）
    $('.tab-button').on('click', function () {
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        currentView = $(this).data('view');

        // 如果已有结果，则更新可视化
        if ($('#resultData').is(':visible')) {
            updateVisualization();
        }
    });

    // 计算tokens
    function calculateTokens() {
        const text = $('#textInput').val();
        if (!text || text.trim() === '') {
            showNotification('请输入文本', 'error');
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
                custom_pricing: customPricing
            }),
            success: function (response) {
                displayResults(response);
            },
            error: function (error) {
                console.error('计算出错:', error);
                showNotification('计算出错: ' + (error.responseJSON?.error || '未知错误'), 'error');
                $('#resultLoading').hide();
                $('#emptyState').show();
            }
        });
    }

    // 显示通知提示
    function showNotification(message, type = 'info') {
        // 这里可以实现一个简单的通知组件
        // 为简洁起见，暂时使用alert
        alert(message);
    }

    // 显示计算结果
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

        // 存储token详情用于视图切换
        window.tokensData = result.tokens_detail;

        // 渲染Token可视化
        renderTokenVisualization(result.tokens_detail);

        // 隐藏加载状态，显示结果
        $('#resultLoading').hide();
        $('#resultData').show();
    }

    // 更新可视化（在视图模式切换时调用）
    function updateVisualization() {
        if (window.tokensData) {
            renderTokenVisualization(window.tokensData);
        }
    }

    // Token可视化
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

    // 文本视图渲染
    function renderTextView(tokens, container) {
        // 创建可视化元素
        tokens.forEach(token => {
            const tokenType = getTokenType(token);

            const el = $('<span>')
                .addClass('token-item')
                .addClass(tokenType)
                .attr('data-token-id', token.id)
                .attr('data-token-value', token.token)
                .attr('title', `Token: ${token.token}\n类型: ${tokenType.replace('token-type-', '')}\n字节: ${token.bytes}`)
                .text(token.text);

            container.append(el);
        });

        // 添加交互行为
        $('.token-item').hover(
            function () {
                $(this).css('transform', 'translateY(-2px)');
                $(this).css('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.3)');
            },
            function () {
                $(this).css('transform', 'translateY(0)');
                $(this).css('box-shadow', 'none');
            }
        ).click(function () {
            const tokenId = $(this).data('token-id');
            const token = tokens[tokenId];

            // 创建弹窗显示token详情
            const detailHTML = `
                <div class="token-detail-popup">
                    <div class="detail-row"><span>Token ID:</span> <strong>${token.id}</strong></div>
                    <div class="detail-row"><span>Token值:</span> <strong>${token.token}</strong></div>
                    <div class="detail-row"><span>文本:</span> <strong>"${escapeHtml(token.text)}"</strong></div>
                    <div class="detail-row"><span>字节:</span> <strong>${token.bytes}</strong></div>
                </div>
            `;

            // 显示详情（此处可以改为更优雅的弹窗）
            alert(`Token ID: ${token.id}\nToken值: ${token.token}\n文本: "${token.text}"\n字节: ${token.bytes}`);
        });
    }

    // Token IDs视图渲染
    function renderIdsView(tokens, container) {
        const table = $('<table class="token-id-table">');
        const thead = $('<thead>').appendTo(table);
        const tbody = $('<tbody>').appendTo(table);

        // 表头
        thead.append(`
            <tr>
                <th>ID</th>
                <th>Token</th>
                <th>文本</th>
                <th>字节</th>
            </tr>
        `);

        // 表内容
        tokens.forEach(token => {
            const row = $('<tr>');
            row.append(`<td>${token.id}</td>`);
            row.append(`<td>${token.token}</td>`);
            row.append(`<td class="token-text">${escapeHtml(token.text)}</td>`);
            row.append(`<td class="token-bytes">${token.bytes}</td>`);
            tbody.append(row);
        });

        container.append(table);

        // 添加样式
        container.find('.token-id-table').css({
            'width': '100%',
            'border-collapse': 'collapse',
            'font-size': '14px'
        });

        container.find('th, td').css({
            'padding': '8px',
            'text-align': 'left',
            'border-bottom': '1px solid var(--border)'
        });

        container.find('th').css({
            'position': 'sticky',
            'top': '0',
            'background-color': 'rgba(30, 30, 30, 0.9)',
            'z-index': '1'
        });

        container.find('tbody > tr').hover(
            function () {
                $(this).css('background-color', 'rgba(60, 60, 60, 0.3)');
            },
            function () {
                $(this).css('background-color', 'transparent');
            }
        );
    }

    // 获取token类型
    function getTokenType(token) {
        // 这里根据token特征确定类型，用于css样式
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

    // 主题切换
    $('#theme-toggle').on('click', function () {
        $('body').toggleClass('light-theme');

        if ($('body').hasClass('light-theme')) {
            // 切换到浅色主题的逻辑
            root.style.setProperty('--background', '#f2f2f7');
            root.style.setProperty('--surface', 'rgba(240, 240, 247, 0.8)');
            root.style.setProperty('--surface-hover', 'rgba(220, 220, 230, 0.8)');
            root.style.setProperty('--border', 'rgba(200, 200, 200, 0.8)');
            root.style.setProperty('--text-primary', 'rgba(0, 0, 0, 0.9)');
            root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.65)');
            root.style.setProperty('--text-tertiary', 'rgba(0, 0, 0, 0.45)');
        } else {
            // 切换回暗色主题的逻辑
            root.style.setProperty('--background', '#0a0a0a');
            root.style.setProperty('--surface', 'rgba(40, 40, 40, 0.6)');
            root.style.setProperty('--surface-hover', 'rgba(60, 60, 60, 0.8)');
            root.style.setProperty('--border', 'rgba(80, 80, 80, 0.6)');
            root.style.setProperty('--text-primary', 'rgba(255, 255, 255, 0.9)');
            root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.65)');
            root.style.setProperty('--text-tertiary', 'rgba(255, 255, 255, 0.45)');
        }
    });
});