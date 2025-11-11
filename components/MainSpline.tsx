'use client';

import dynamic from 'next/dynamic';

// 使用与 SplineScene 相同的导入方式
const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => null,
});

interface MainSplineProps {
  scene: string;
  style?: React.CSSProperties;
}

export default function MainSpline({ scene, style }: MainSplineProps) {
  return <Spline scene={scene} style={style} />;
}

