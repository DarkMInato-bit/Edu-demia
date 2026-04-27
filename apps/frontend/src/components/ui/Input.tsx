import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input 
        className={`input-field ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-error mt-1 text-sm">{error}</p>}
    </div>
  );
};
