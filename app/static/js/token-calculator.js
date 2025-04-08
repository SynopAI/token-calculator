// app/static/js/token-calculator.js
$(document).ready(function () {
    // 初始化变量
    let modelPricing = {};
    let currentModel = $('#modelSelect').val();

    // 加载模型数据
    $.getJSON('/api/models', function (data) {
        modelPricing = data.pricing;
        updatePriceInputs();
    });

    // 监听模型选择变化
    $('#modelSelect').on('change', function () {
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
            success: function (response) {
                displayResults(response, text);
            },
            error: function (error) {
                console.error('计算出错:', error);
                alert('计算出错: ' + (error.responseJSON?.error || '未知错误'));
            },
            complete: function () {
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
            function () {
                $(this).addClass('token-hover');
            },
            function () {
                $(this).removeClass('token-hover');
            }
        ).click(function () {
            const tokenId = $(this).data('token-id');
            const token = tokens[tokenId];

            alert(`Token ID: ${token.id}\nToken值: ${token.token}\n文本: "${token.text}"\n字节: ${token.bytes}`);
        });
    }

    // 切换可视化视图
    $('#toggleVisualization').on('click', function () {
        const container = $('#tokenVisualization');
        container.toggleClass('token-grid-view');
    });
});