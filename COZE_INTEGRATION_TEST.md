# Coze API 集成测试指南

## ✅ 已完成的集成

现在 Gas 优化器已经使用项目中现有的 Coze API 实现（`lib/coze-api.ts`），与 AI 智能助手使用相同的 API 调用方式。

## 🔧 配置

### 环境变量

在 `.env.local` 中配置（已在 `lib/config.ts` 中定义）:

```bash
# Coze API 配置
NEXT_PUBLIC_COZE_API_TOKEN=pat_XUph8jnpqmx82WegBQAhfEHqT9yll9YmE2XjCltmXiCYLKVju3QP7RaQ6kc6B6wH
NEXT_PUBLIC_COZE_BOT_ID=7578017691110621230
```

**注意**: 配置文件中已经有默认值，如果你的 Token 不同，需要更新。

## 📡 API 调用流程

### 1. 前端请求

```
用户输入 → http://localhost:3000/api/optimize-gas
```

### 2. 后端处理

```typescript
// app/api/optimize-gas/route.ts
import { sendCozeMessage } from '../../../lib/coze-api';

// 调用 Coze API（非流式）
const cozeResponse = await sendCozeMessage(prompt, userAddress);
```

### 3. Coze API 调用

```typescript
// lib/coze-api.ts
// 使用轮询模式（非流式）
POST https://api.coze.cn/v3/chat
{
  "bot_id": "7578017691110621230",
  "user_id": "用户地址",
  "additional_messages": [{
    "role": "user",
    "content": "帮我把 1 ETH 换成 USDC",
    "content_type": "text"
  }],
  "stream": false,
  "auto_save_history": true,
  "conversation_id": "会话ID"
}
```

### 4. 轮询等待完成

```typescript
// 查询对话状态
GET https://api.coze.cn/v3/chat/retrieve?chat_id=xxx&conversation_id=xxx

// 等待状态变为 "completed"
```

### 5. 获取最终回复

```typescript
// 获取消息列表
GET https://api.coze.cn/v3/chat/message/list?chat_id=xxx&conversation_id=xxx

// 提取助手回复（role=assistant, type=answer）
```

## 🧪 测试步骤

### 步骤 1: 启动开发服务器

```bash
npm run dev
```

### 步骤 2: 访问 Gas 优化器

```
http://localhost:3000/gas-optimizer
```

### 步骤 3: 输入测试需求

```
帮我把 1 ETH 换成 USDC
```

### 步骤 4: 查看终端日志

你应该看到：

```
使用 Coze API 进行优化分析...
用户需求: 帮我把 1 ETH 换成 USDC
用户地址: 0x...
Coze API 原始响应: {"ok":true,"error":null,"data":{...}}
解析后的结果: { ok: true, data: { ... } }
```

### 步骤 5: 验证响应格式

#### 格式 1: 包含 route 字段

```json
{
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "1000000000000000000",
    "amount_out_min": "1",
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
}
```

**后端自动处理**: 会自动构建 `tx` 字段

#### 格式 2: 包含 tx 字段（完整）

```json
{
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "1000000000000000000",
    "amount_out_min": "2920500000",
    "slippage_bps": 100,
    "tx": {
      "to": "0x...",
      "data": "0x...",
      "value": "1000000000000000000",
      "gas": "210000",
      "maxFeePerGas": "2000000000",
      "maxPriorityFeePerGas": "150000000"
    }
  }
}
```

**直接使用**: 前端可以直接使用 `tx` 字段发送交易

## 🔍 调试技巧

### 1. 查看完整的 API 调用

在 `lib/coze-api.ts` 中，`_pollingChat` 方法会：
1. 发送消息
2. 轮询等待完成
3. 获取最终回复

### 2. 检查 Coze Bot 配置

访问你的 Bot 页面：
```
https://www.coze.cn/open/playground/chat_v3?bot_id=7578017691110621230
```

确保 Bot 配置正确返回 JSON 格式。

### 3. 测试 Coze API

使用 curl 直接测试：

```bash
curl -X POST https://api.coze.cn/v3/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bot_id": "7578017691110621230",
    "user_id": "test",
    "additional_messages": [{
      "role": "user",
      "content": "帮我把 1 ETH 换成 USDC",
      "content_type": "text"
    }],
    "stream": false,
    "auto_save_history": true
  }'
```

### 4. 查看浏览器网络请求

打开开发者工具（F12）→ Network 标签：
- 查找 `optimize-gas` 请求
- 查看 Response 内容
- 检查是否返回了正确的 JSON

## ❌ 常见问题

### 问题 1: 返回模拟数据而不是 Coze 响应

**原因**: 
- Coze API Token 未配置或无效
- Coze API 调用失败
- Coze 返回的不是 JSON 格式

**解决方案**:
1. 检查 `NEXT_PUBLIC_COZE_API_TOKEN` 是否正确
2. 查看终端日志中的错误信息
3. 确认 Coze Bot 配置正确

### 问题 2: 解析 JSON 失败

**原因**: Coze 返回的是文本而不是 JSON

**解决方案**:
1. 在 Coze Bot 中添加 System Prompt，要求返回 JSON 格式
2. 检查 Bot 的输出格式设置

### 问题 3: 缺少 tx 字段

**原因**: Coze 只返回了 `route` 字段

**解决方案**: 
- 后端会自动构建 `tx` 字段
- 查看终端日志确认是否执行了构建逻辑

## 📊 性能对比

### 轮询模式（当前使用）

- **优点**: 稳定可靠，适合服务端
- **缺点**: 需要等待完成，延迟较高
- **适用场景**: 后端 API，不需要实时反馈

### 流式模式（AI 智能助手使用）

- **优点**: 实时反馈，用户体验好
- **缺点**: 需要处理流式数据
- **适用场景**: 前端聊天界面

## 🔄 切换到流式模式（可选）

如果需要实时反馈，可以修改为流式模式：

```typescript
// app/api/optimize-gas/route.ts
import { sendCozeMessageStream } from '../../../lib/coze-api';

// 使用流式模式
let fullResponse = '';
const cozeResponse = await sendCozeMessageStream(
  prompt,
  userAddress || 'anonymous',
  (chunk) => {
    fullResponse += chunk;
    console.log('收到数据块:', chunk);
  },
  true // 启用流式模式
);
```

## ✅ 验证清单

- [ ] 环境变量配置正确
- [ ] 开发服务器正常启动
- [ ] 访问 Gas 优化器页面
- [ ] 输入测试需求
- [ ] 查看终端日志
- [ ] 验证返回的 JSON 格式
- [ ] 检查是否自动构建了 tx 字段
- [ ] 测试支付咨询费功能
- [ ] 测试执行兑换功能

## 📝 总结

现在 Gas 优化器使用与 AI 智能助手相同的 Coze API 实现：

1. ✅ 使用 `lib/coze-api.ts` 中的 `sendCozeMessage` 函数
2. ✅ 支持轮询模式（非流式）
3. ✅ 自动处理 `route` 和 `tx` 两种格式
4. ✅ 失败时自动降级到模拟数据
5. ✅ 完整的日志记录和错误处理

**测试成功后，你应该看到 Coze AI 返回的真实优化方案！** 🎉
