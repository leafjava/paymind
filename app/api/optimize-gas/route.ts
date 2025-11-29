import { NextRequest, NextResponse } from 'next/server';
import { sendCozeMessage } from '../../../lib/coze-api';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userAddress } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: '请提供兑换需求描述', data: null },
        { status: 400 }
      );
    }

    // 使用现有的 Coze API 实现
    console.log('使用 Coze API 进行优化分析...');
    console.log('用户需求:', prompt);
    console.log('用户地址:', userAddress);
    
    try {
      // 调用 Coze API
      const cozeResponse = await sendCozeMessage(prompt, userAddress || 'anonymous');
      console.log('Coze API 原始响应:', cozeResponse);
      
      // 尝试解析 JSON 响应
      let result;
      try {
        result = JSON.parse(cozeResponse);
        console.log('解析后的结果:', result);
      } catch (parseError) {
        console.error('解析 Coze 响应失败:', parseError);
        console.log('原始响应内容:', cozeResponse);
        // 如果解析失败，使用模拟数据
        return NextResponse.json(getMockOptimization(prompt));
      }
      
      // 如果返回的数据包含 route 但没有 tx，需要构建 tx 数据
      if (result.ok && result.data && result.data.route && !result.data.tx) {
        console.log('AI 返回了路由信息，构建交易数据...');
        
        // 从路由信息构建交易数据
        const route = result.data.route[0]; // 使用第一个路由
        result.data.tx = {
          to: route.pool_address || '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
          data: '0x38ed1739' + result.data.amount_in.slice(2).padStart(64, '0') + result.data.amount_out_min.slice(2).padStart(64, '0'),
          value: result.data.input_token === 'ETH' ? result.data.amount_in : '0x0',
          gas: '210000',
          maxFeePerGas: '2000000000',
          maxPriorityFeePerGas: '150000000'
        };
        console.log('构建的交易数据:', result.data.tx);
      }
      
      return NextResponse.json(result);
    } catch (cozeError: any) {
      console.error('Coze API 调用失败:', cozeError);
      // 使用模拟数据作为备用
      console.log('使用模拟数据作为备用方案');
      return NextResponse.json(getMockOptimization(prompt));
    }

  } catch (error: any) {
    console.error('优化失败:', error);
    return NextResponse.json(
      { ok: false, error: error.message || '优化失败，请重试', data: null },
      { status: 500 }
    );
  }
}

// 模拟数据（用于测试）
function getMockOptimization(prompt: string) {
  // 简单解析用户输入
  const ethMatch = prompt.match(/(\d+\.?\d*)\s*ETH/i);
  const amount = ethMatch ? ethMatch[1] : '1';
  const amountInWei = (parseFloat(amount) * 1e18).toString();
  const estimatedUSDC = (parseFloat(amount) * 2920.5).toFixed(2);
  const amountOutMin = (parseFloat(estimatedUSDC) * 1e6).toString();

  return {
    ok: true,
    error: null,
    data: {
      chain_id: 8453,
      input_token: 'ETH',
      output_token: 'USDC',
      amount_in: amountInWei,
      amount_out_min: amountOutMin,
      slippage_bps: 100,
      tx: {
        to: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        data: '0x38ed173900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000',
        value: amountInWei,
        gas: '210000',
        maxFeePerGas: '2000000000',
        maxPriorityFeePerGas: '150000000'
      }
    }
  };
}
