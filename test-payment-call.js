// 测试支付咨询费调用
// 在浏览器控制台运行此脚本

async function testPaymentCall() {
  console.log('🧪 开始测试支付咨询费调用...\n');
  
  const contractAddress = '0xb81173637860c9B9Bf9c20b07d1c270A9A434373';
  
  // 1. 检查钱包连接
  if (!window.ethereum) {
    console.error('❌ 未检测到钱包');
    return;
  }
  
  // 2. 获取账户
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  const account = accounts[0];
  console.log('✅ 账户:', account);
  
  // 3. 检查网络
  const chainId = await window.ethereum.request({ 
    method: 'eth_chainId' 
  });
  console.log('✅ 网络 Chain ID:', parseInt(chainId, 16));
  console.log('   (Base Sepolia: 84532, Base Mainnet: 8453)\n');
  
  // 4. 检查余额
  const balance = await window.ethereum.request({
    method: 'eth_getBalance',
    params: [account, 'latest']
  });
  const balanceInEth = parseInt(balance, 16) / 1e18;
  console.log('✅ 余额:', balanceInEth.toFixed(4), 'ETH\n');
  
  // 5. 读取合约的 MINI_USD 要求
  console.log('📖 读取合约最低要求...');
  try {
    const miniUsd = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: '0x6bb3da7a' // MINI_USD() 函数选择器
      }, 'latest']
    });
    const miniUsdValue = parseInt(miniUsd, 16) / 1e18;
    console.log('✅ MINI_USD:', miniUsdValue, 'ETH\n');
  } catch (e) {
    console.error('❌ 读取 MINI_USD 失败:', e.message);
  }
  
  // 6. 尝试估算 gas
  console.log('⛽ 尝试估算 gas...');
  try {
    const gasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [{
        from: account,
        to: contractAddress,
        data: '0xb4cb0352', // paymentConsultationFee()
        value: '0x16345785d8a0000' // 0.1 ETH
      }]
    });
    console.log('✅ Gas 估算成功:', parseInt(gasEstimate, 16));
    console.log('   这意味着交易应该可以成功!\n');
  } catch (error) {
    console.error('❌ Gas 估算失败!');
    console.error('   错误:', error.message);
    console.error('   这意味着合约会 revert\n');
    
    // 尝试解析错误
    if (error.message.includes('didn\'t send enough ETH')) {
      console.error('💡 原因: 发送的 ETH 不满足最低 USD 要求');
      console.error('   解决方案: 增加发送的 ETH 数量 (例如 0.15 ETH)');
    } else if (error.message.includes('execution reverted')) {
      console.error('💡 原因: 合约执行被 revert');
      console.error('   可能是价格预言机问题或其他合约逻辑');
    }
    return;
  }
  
  // 7. 如果 gas 估算成功,可以尝试发送交易
  console.log('✅ 所有检查通过!');
  console.log('💡 可以尝试发送交易了\n');
  
  // 询问是否发送交易
  const shouldSend = confirm('是否发送支付交易? (需要 0.1 ETH + gas 费)');
  if (!shouldSend) {
    console.log('⏸️  用户取消');
    return;
  }
  
  // 8. 发送交易
  console.log('📤 发送交易...');
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: account,
        to: contractAddress,
        data: '0xb4cb0352',
        value: '0x16345785d8a0000', // 0.1 ETH
        gas: '0x493E0' // 300000 gas
      }]
    });
    
    console.log('✅ 交易已发送!');
    console.log('   交易哈希:', txHash);
    console.log('   等待确认...\n');
    
    // 等待确认
    let receipt = null;
    let attempts = 0;
    while (!receipt && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      if (!receipt) {
        console.log('   ⏳ 等待中... (' + (attempts + 1) + '/30)');
      }
      attempts++;
    }
    
    if (receipt) {
      if (receipt.status === '0x1') {
        console.log('✅ 交易成功!');
        console.log('   Gas 使用:', parseInt(receipt.gasUsed, 16));
      } else {
        console.error('❌ 交易失败 (reverted)');
      }
    } else {
      console.log('⚠️  交易已发送但未确认 (超时)');
    }
    
  } catch (error) {
    console.error('❌ 发送交易失败:', error.message);
    if (error.code === 4001) {
      console.error('   原因: 用户取消了交易');
    }
  }
}

// 运行测试
testPaymentCall();
