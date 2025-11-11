/**
 * Button Component
 * 
 * Reusable button component with support for different variants, sizes, and states.
 * Handles disabled state and click events with flexible styling through CSS classes.
 */

import React from 'react';

/**
 * Get CSS class for button variant styling
 * 
 * Maps variant prop to corresponding CSS class for visual styling.
 * 
 * @param {string} variant - Button variant ('primary', 'secondary', 'danger')
 * @returns {string} CSS class name for the variant
 */
const getVariantClass = (variant) => {
  switch (variant) {
    case 'secondary':
      return 'btn-secondary';
    case 'danger':
      return 'btn-danger';
    default:
      return 'btn-primary';
  }
};

/**
 * Get CSS class for button size styling
 * 
 * Maps size prop to corresponding CSS class for dimensional styling.
 * Supports small (sm), medium (md), and large (lg) sizes.
 * 
 * @param {string} size - Button size ('sm', 'md', 'lg')
 * @returns {string} CSS class name for the size
 */
const getSizeClass = (size) => {
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

/**
 * Button Component
 * 
 * Renders a button element with flexible styling and event handling.
 * Prevents click events when disabled to improve UX.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button text or content
 * @param {string} [props.variant='primary'] - Button variant ('primary', 'secondary', 'danger')
 * @param {string} [props.size='md'] - Button size ('sm', 'md', 'lg')
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {function} [props.onClick] - Click handler function
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {Object} props.rest - Additional button HTML attributes
 * @returns {React.ReactElement} Button element with applied styling and handlers
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * 
 * @example
 * <Button variant="danger" size="sm" disabled>
 *   Delete
 * </Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...rest
}) => {
  // Combine all CSS classes
  const classes = [
    getVariantClass(variant),
    getSizeClass(size),
    disabled ? 'btn-disabled' : '',
    className,
  ]
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
