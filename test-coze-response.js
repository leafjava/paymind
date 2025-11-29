/**
 * 测试 Coze 响应数据处理
 */

// 模拟 Coze 返回的数据
const cozeResponse = {
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "1000000000000000000",
    "amount_out_min": "2900000000",
    "slippage_bps": 100,
    "route": [{
      "protocol": "uniswap-v3",
      "pool_address": "0xPoolMock1",
      "fee_tier": 3000,
      "portion_bps": 10000,
      "token_in": "ETH",
      "token_out": "USDC",
      "amount_in": "1000000000000000000",
      "amount_out": "2920500000"
    }]
  }
};

// 处理逻辑（与 API 路由相同）
function processCozeResponse(result) {
  if (result.ok && result.data && result.data.route && !result.data.tx) {
    console.log('✅ 检测到 route 字段，开始构建 tx...\n');
    
    const route = result.data.route[0];
    
    // 构建 data 字段
    const amountInHex = BigInt(result.data.amount_in).toString(16).padStart(64, '0');
    const amountOutMinHex = BigInt(result.data.amount_out_min).toString(16).padStart(64, '0');
    const data = '0x38ed1739' + amountInHex + amountOutMinHex;
    
    result.data.tx = {
      to: route.pool_address || '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
      data: data,
      value: result.data.input_token === 'ETH' ? result.data.amount_in : '0x0',
      gas: '210000',
      maxFeePerGas: '2000000000',
      maxPriorityFeePerGas: '150000000'
    };
    
    console.log('📊 构建的交易数据:');
    console.log('  to:', result.data.tx.to);
    console.log('  data:', result.data.tx.data);
    console.log('  value:', result.data.tx.value, '(', parseFloat(result.data.tx.value) / 1e18, 'ETH )');
    console.log('  gas:', result.data.tx.gas);
    console.log('\n📝 数据字段解析:');
    console.log('  函数选择器: 0x38ed1739');
    console.log('  amount_in (hex):', amountInHex);
    console.log('  amount_in (dec):', result.data.amount_in, '(', parseFloat(result.data.amount_in) / 1e18, 'ETH )');
    console.log('  amount_out_min (hex):', amountOutMinHex);
    console.log('  amount_out_min (dec):', result.data.amount_out_min, '(', parseFloat(result.data.amount_out_min) / 1e6, 'USDC )');
  }
  
  return result;
}

// 执行测试
console.log('🧪 测试 Coze 响应数据处理\n');
console.log('📥 输入数据:');
console.log(JSON.stringify(cozeResponse, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

const processedResult = processCozeResponse(cozeResponse);

console.log('\n' + '='.repeat(80) + '\n');
console.log('📤 输出数据:');
console.log(JSON.stringify(processedResult, null, 2));

console.log('\n✅ 测试完成！');
console.log('\n💡 提示:');
console.log('  - amount_out_min 使用了 2900 USDC（考虑了滑点）');
console.log('  - route[0].amount_out 是 2920.5 USDC（预估输出）');
console.log('  - 实际交易会使用 amount_out_min 作为最小接受数量');
