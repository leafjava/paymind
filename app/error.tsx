'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isMainPage = pathname === '/main';

  useEffect(() => {
    // 在 main 页面显示所有错误，用于调试
    if (isMainPage) {
      console.error('Error caught on main page:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
    } else {
      // 其他页面保持原有逻辑（可选：也可以显示所有错误）
      console.log('Error caught:', error);
    }
  }, [error, isMainPage]);

  // 在 main 页面显示所有错误，包括 async/await 相关错误
  if (isMainPage) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#1a1a1a', 
        color: '#fff', 
        minHeight: '100vh',
        fontFamily: 'monospace'
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>错误详情（调试模式）</h2>
        <div style={{ marginBottom: '20px' }}>
          <strong>错误消息:</strong>
          <pre style={{ 
            background: '#2a2a2a', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '10px'
          }}>{error.message}</pre>
        </div>
        {error.stack && (
          <div style={{ marginBottom: '20px' }}>
            <strong>错误堆栈:</strong>
            <pre style={{ 
              background: '#2a2a2a', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              marginTop: '10px',
              fontSize: '12px'
            }}>{error.stack}</pre>
          </div>
        )}
        {error.digest && (
          <div style={{ marginBottom: '20px' }}>
            <strong>错误摘要:</strong>
            <pre style={{ 
              background: '#2a2a2a', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              marginTop: '10px'
            }}>{error.digest}</pre>
          </div>
        )}
        <button 
          onClick={() => reset()} 
          style={{
            padding: '10px 20px',
            background: '#4a9eff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          重试
        </button>
      </div>
    );
  }

  // 其他页面的错误处理（保持原有逻辑）
  if (error.message?.includes('async/await is not yet supported in Client Components') ||
      error.message?.includes('A component was suspended by an uncached promise') ||
      error.message?.includes('Creating promises inside a Client Component')) {
    return null; // 不渲染任何内容，静默处理
  }

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
