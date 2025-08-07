import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost' }>=({ className='', variant, ...props })=>{
  const base = variant==='primary' ? 'btn btn-primary' : 'btn';
  return <button className={`${base} ${className}`} {...props}/>;
};
