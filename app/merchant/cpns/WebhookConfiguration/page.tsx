import React from 'react';

// 组件 Props 接口
interface WebhookConfigurationProps {
  webhookUrl: string;
  onChange: (url: string) => void;
  onTest: () => void;
}

export const WebhookConfiguration = ({ webhookUrl, onChange, onTest }: WebhookConfigurationProps) => (
  <div className="space-y-6">
    <input type="url" value={webhookUrl} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="https://api.yoursite.com/webhook" />
    <button onClick={onTest} className="px-4 py-2 border border-gray-300 rounded-lg text-black">测试Webhook</button>
  </div>
);