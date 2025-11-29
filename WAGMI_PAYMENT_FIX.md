# ✅ 使用 Wagmi 修复支付问题

## 问题原因

之前的代码使用 `wagmi` 连接钱包,但使用 `window.ethereum.request()` 发送交易,导致冲突:
- Wagmi 使用自己的 provider
- 直接调用 `window.ethereum` 可能与 wagmi 的状态不同步
- 导致 `evmAsk.js: Unexpected error`

## 解决方案

使用 wagmi 的 `useWriteContract` hook 来发送交易,保持一致性。

## 修改内容

### 1. 导入 wagmi hooks
```typescript
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
```

### 2. 使用 wagmi hooks
```typescript
const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  hash,
});
```

### 3. 定义合约信息
```typescript
const CONTRACT_ADDRESS = '0xb81173637860c9B9Bf9c20b07d1c270A9A434373' as `0x${string}`;

const FUNDME_ABI = [
  {
    type: 'function',
    name: 'paymentConsultationFee',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
] as const;
```

### 4. 修改支付函数
```typescript
const handlePayConsultation = () => {
  if (!isConnected) {
    alert('请先连接钱包');
    return;
  }

  if (!result) {
    alert('请先进行分析');
    return;
  }

  try {
    console.log('💰 开始支付咨询费...');
    
    // 使用 wagmi 的 writeContract 发送交易
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FUNDME_ABI,
      functionName: 'paymentConsultationFee',
      value: parseEther('0.1'), // 0.1 ETH
    });
    
    console.log('✅ 交易请求已发送到钱包,请在钱包中确认');
    
  } catch (error: any) {
    console.error('❌ 支付失败:', error);
    alert(`支付失败: ${error.message || '请重试'}`);
  }
};
```

### 5. 监听交易状态
```typescript
// 监听交易确认状态
if (isConfirmed && showPayment && hash) {
  console.log('✅ 支付成功! 交易哈希:', hash);
  setShowPayment(false);
  setTxHash(hash);
  alert('✅ 支付成功！\n\n现在可以执行兑换了。');
}

if (writeError) {
  console.error('❌ 交易错误:', writeError);
  // 错误处理...
}
```

## 优势

1. ✅ **与 wagmi 完全兼容** - 不再有 provider 冲突
2. ✅ **自动处理交易状态** - wagmi 自动跟踪交易状态
3. ✅ **更好的类型安全** - TypeScript 类型检查
4. ✅ **更简洁的代码** - 不需要手动轮询交易状态
5. ✅ **更好的错误处理** - wagmi 提供详细的错误信息

## 测试步骤

1. **刷新页面** (Ctrl+F5)
2. **连接钱包** (确保使用 MetaMask)
3. **输入兑换需求** (例如: "把1ETH转换成USDC")
4. **点击"开始分析"**
5. **点击"支付咨询费"**
6. **在 MetaMask 中确认交易**
7. **等待交易确认**

## 预期行为

1. 点击"支付咨询费"后,MetaMask 会弹出确认窗口
2. 确认后,交易会被发送到区块链
3. wagmi 会自动跟踪交易状态
4. 交易确认后,会显示成功提示并隐藏支付界面

## 如果还是失败

如果使用 wagmi 后还是失败,可能的原因:

1. **网络不匹配** - 确保钱包连接到正确的网络
2. **余额不足** - 确保有足够的 ETH (至少 0.15 ETH)
3. **合约问题** - 合约的 `paymentConsultationFee()` 函数可能 revert

可以在浏览器控制台查看详细的错误信息。

