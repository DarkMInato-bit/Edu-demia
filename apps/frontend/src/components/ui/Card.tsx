import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', animate = true, style }) => {
  return (
    <div className={`glass card ${animate ? 'fade-in' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
};
