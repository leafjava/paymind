# 支付咨询费调试指南

## 问题分析

根据错误信息 `evmAsk.js:15:1430 Ue: Unexpected error`,这是一个钱包交互层面的错误。

## 可能的原因

### 1. **网络不匹配**
- 合约部署在哪个网络? (Base Sepolia / Base Mainnet / 其他?)
- 钱包当前连接的是哪个网络?
- **解决方案**: 确保钱包连接到正确的网络

### 2. **钱包 Provider 问题**
- 使用 wagmi 连接但用 window.ethereum 发送交易可能导致不一致
- **已修复**: 代码已更新,增加了更好的错误处理

### 3. **Gas 估算失败**
- 合约函数可能 revert,导致 gas 估算失败
- **已修复**: 增加了固定的 gas limit (300000)

### 4. **合约函数要求不满足**
- `paymentConsultationFee()` 函数要求至少 0.1 ETH 的 USD 等值
- 如果 ETH 价格太低,0.1 ETH 可能不够
- **已修复**: 增加了余额检查

## 调试步骤

### 步骤 1: 检查网络
```javascript
// 在浏览器控制台执行
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
console.log('当前网络 Chain ID:', parseInt(chainId, 16));

// Base Sepolia: 84532
// Base Mainnet: 8453
// Sepolia: 11155111
```

### 步骤 2: 检查余额
```javascript
// 在浏览器控制台执行
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const balance = await window.ethereum.request({
  method: 'eth_getBalance',
  params: [accounts[0], 'latest']
});
console.log('余额:', parseInt(balance, 16) / 1e18, 'ETH');
```

### 步骤 3: 测试合约调用
```javascript
// 在浏览器控制台执行
const contractAddress = '0xb81173637860c9B9Bf9c20b07d1c270A9A434373';
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

// 尝试估算 gas
try {
  const gasEstimate = await window.ethereum.request({
    method: 'eth_estimateGas',
    params: [{
      from: accounts[0],
      to: contractAddress,
      data: '0xb4cb0352',
      value: '0x16345785d8a0000'
    }]
  });
  console.log('✅ Gas 估算成功:', parseInt(gasEstimate, 16));
} catch (error) {
  console.error('❌ Gas 估算失败:', error);
  // 如果这里失败,说明合约会 revert
}
```

### 步骤 4: 检查合约状态
```javascript
// 检查合约的 MINI_USD 要求
const contractAddress = '0xb81173637860c9B9Bf9c20b07d1c270A9A434373';

// 调用 MINI_USD() 函数
const miniUsd = await window.ethereum.request({
  method: 'eth_call',
  params: [{
    to: contractAddress,
    data: '0x6bb3da7a' // MINI_USD() 函数选择器
  }, 'latest']
});
console.log('最低要求 (wei):', parseInt(miniUsd, 16));
console.log('最低要求 (ETH):', parseInt(miniUsd, 16) / 1e18);
```

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| 4001 | 用户拒绝交易 | 用户需要在钱包中确认 |
| -32603 | 内部错误 | 检查 gas、余额、合约状态 |
| -32000 | Gas 不足 | 增加 gas limit |
| -32602 | 参数无效 | 检查交易参数格式 |

## 修复内容

### 1. 增加余额检查
```typescript
const balance = await window.ethereum.request({
  method: 'eth_getBalance',
  params: [address, 'latest']
});

const balanceInEth = parseInt(balance, 16) / 1e18;
if (balanceInEth < 0.15) {
  alert(`余额不足！需要至少 0.15 ETH`);
  return;
}
```

### 2. 增加 Gas Limit
```typescript
gas: '0x493E0', // 300000 gas (之前可能太低)
```

### 3. 增加交易确认等待
```typescript
// 等待交易上链
let receipt = null;
let attempts = 0;
while (!receipt && attempts < 30) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  receipt = await window.ethereum.request({
    method: 'eth_getTransactionReceipt',
    params: [paymentTx]
  });
  attempts++;
}
```

### 4. 详细的错误提示
```typescript
if (error.code === 4001) {
  errorMessage += '❌ 用户取消了交易';
} else if (error.code === -32603) {
  errorMessage += '❌ 内部错误,可能是 gas 不足或合约执行失败';
}
// ... 更多错误处理
```

## 下一步

1. **刷新页面**重新测试
2. **打开浏览器控制台**查看详细日志
3. **确认网络**是否正确
4. **检查余额**是否足够 (至少 0.15 ETH)
5. 如果还是失败,在控制台执行上面的调试步骤

## 可能需要的信息

请提供以下信息以便进一步调试:

- [ ] 合约部署的网络 (Chain ID)
- [ ] 钱包当前连接的网络
- [ ] 钱包余额
- [ ] 完整的错误信息 (浏览器控制台)
- [ ] Gas 估算是否成功

