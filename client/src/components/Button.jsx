import React from 'react';

// Minimal Button component to satisfy tests in client/src/tests/unit/Button.test.jsx
const variantClass = (variant) => {
  switch (variant) {
    case 'secondary':
      return 'btn-secondary';
    case 'danger':
      return 'btn-danger';
    default:
      return 'btn-primary';
  }
};

const sizeClass = (size) => {
  switch (size) {
    case 'sm':
      return 'btn-sm';
    case 'md':
      return 'btn-md';
    case 'lg':
      return 'btn-lg';
    default:
      return 'btn-md';
  }
};

const Button = ({ children, variant = 'primary', size = 'md', disabled = false, onClick, className = '', ...rest }) => {
  const classes = [variantClass(variant), sizeClass(size), disabled ? 'btn-disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
