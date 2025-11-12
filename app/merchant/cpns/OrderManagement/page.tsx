import React from 'react';
import { Order } from '../CreateOrder/page';

// 组件 Props 接口
interface OrderManagementProps {
  orders: Order[];
}

// 订单管理
export const OrderManagement = ({ orders }: OrderManagementProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
        <div className="text-sm text-gray-600">订单数</div>
      </div>
      <div className="bg-white border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">${orders.reduce((s, o) => s + parseFloat(o.amount || '0'), 0).toFixed(2)}</div>
        <div className="text-sm text-gray-600">总额</div>
      </div>
      <div className="bg-white border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">98.2%</div>
        <div className="text-sm text-gray-600">成功率</div>
      </div>
    </div>
  </div>
);