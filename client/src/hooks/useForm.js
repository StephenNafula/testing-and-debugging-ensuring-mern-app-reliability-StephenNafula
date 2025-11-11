/**
 * useForm Custom Hook
 * 
 * Manages form state, validation, and submission with utilities for
 * handling field changes, blur events, and form reset functionality.
 * Simplifies form logic in React components and reduces boilerplate code.
 */

import { useState, useCallback } from 'react';

/**
 * Custom Hook for Form State Management
 * 
 * Handles form state, validation, field tracking, and submission logic.
 * Provides methods for field updates, error handling, and form reset.
 * Automatically clears field errors when the field is modified by the user.
 * 
 * @param {Object} initialValues - Initial state for form fields
 * @param {function} onSubmit - Async callback function when form is submitted
 * @returns {Object} Form state and handler methods
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit } = useForm(
 *   { email: '', password: '' },
 *   async (values) => {
 *     await submitForm(values);
 *   }
 * );
 * 
 * @returns {Object} Object containing:
 *   - values: {Object} Current form field values
 *   - errors: {Object} Field error messages
 *   - touched: {Object} Fields that have been blurred
 *   - isSubmitting: {boolean} Whether form submission is in progress
 *   - handleChange: {function} Change event handler for inputs
 *   - handleBlur: {function} Blur event handler for inputs
 *   - handleSubmit: {function} Form submission handler
 *   - resetForm: {function} Reset form to initial state
 *   - setFieldValue: {function} Programmatically set field value
 *   - setFieldError: {function} Programmatically set field error
 */
function useForm(initialValues, onSubmit) {
  // Form field values
  const [values, setValues] = useState(initialValues);

  // Field error messages
  const [errors, setErrors] = useState({});

  // Track which fields have been focused/blurred
  const [touched, setTouched] = useState({});

  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form field value changes
   * 
   * Updates form state with new field value.
   * Clears any existing error for the modified field.
   * Handles both text inputs and checkboxes correctly.
   * 
   * @param {React.ChangeEvent} e - Change event from input element
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      // Update field value
      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Clear error when user modifies field
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  /**
   * Handle form field blur events
   * 
   * Marks field as touched when user leaves the field.
   * Used to conditionally display validation errors after user interaction.
   * 
   * @param {React.FocusEvent} e - Blur event from input element
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  /**
   * Handle form submission
   * 
   * Prevents default form behavior and calls the onSubmit callback.
   * Manages submission state and handles validation errors from the server.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        // Handle server-side validation errors
        if (error.data && error.data.errors) {
          setErrors(error.data.errors);
        } else {
          setErrors({ form: error.message || 'An error occurred' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  /**
   * Reset form to initial state
   * 
   * Clears all form values, errors, and touched fields.
   * Useful after successful submission or when user wants to start over.
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Programmatically set a field value
   * 
   * Updates a specific field value without triggering change events.
   * Useful when you need to update form state outside of input handlers.
   * 
   * @param {string} name - Field name
   * @param {any} value - New field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Programmatically set a field error
   * 
   * Sets error message for a specific field.
   * Used when you need to update validation errors outside of form submission.
   * 
   * @param {string} name - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
}

export default useForm;
