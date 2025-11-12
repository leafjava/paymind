import { useState } from "react";
import React from "react";

// 订单数据接口
interface OrderData {
  amount: string;
  currency: string;
  productName: string;
  customerEmail: string;
}

// 订单接口（创建后的订单）
export interface Order extends OrderData {
  id: string;
  status: string;
}

// 组件 Props 接口
interface CreateOrderProps {
  onOrderCreate: (order: Order) => void;
}

// 创建订单
export const CreateOrder = ({ onOrderCreate }: CreateOrderProps) => {
  const [orderData, setOrderData] = useState<OrderData>({ 
    amount: '29.99', 
    currency: 'USD', 
    productName: 'AI写作助手', 
    customerEmail: 'customer@example.com' 
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" value={orderData.productName} onChange={(e) => setOrderData({ ...orderData, productName: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="产品名称" />
        <input type="number" value={orderData.amount} onChange={(e) => setOrderData({ ...orderData, amount: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" step="0.01" placeholder="金额" />
      </div>
      <button onClick={() => onOrderCreate({ id: 'ord_' + Math.random().toString(36).substr(2, 9), ...orderData, status: 'created' })} className="w-full py-3 bg-blue-600 text-white rounded-lg">创建订单</button>
    </div>
  );
};