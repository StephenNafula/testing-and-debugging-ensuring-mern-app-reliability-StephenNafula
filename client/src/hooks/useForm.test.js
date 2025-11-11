// client/src/hooks/useForm.test.js
// Unit tests for useForm custom hook

import { renderHook, act } from '@testing-library/react';
import useForm from './useForm';

describe('useForm Custom Hook', () => {
  it('should initialize with provided values', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should handle input changes', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John', type: 'text' },
      });
    });

    expect(result.current.values.name).toBe('John');
  });

  it('should handle checkbox changes', () => {
    const initialValues = { agreed: false };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.handleChange({
        target: { name: 'agreed', type: 'checkbox', checked: true },
      });
    });

    expect(result.current.values.agreed).toBe(true);
  });

  it('should mark field as touched on blur', () => {
    const initialValues = { name: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.handleBlur({ target: { name: 'name' } });
    });

    expect(result.current.touched.name).toBe(true);
  });

  it('should clear error when field is modified', () => {
    const initialValues = { email: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    // Manually set an error
    act(() => {
      result.current.setFieldError('email', 'Invalid email');
    });

    expect(result.current.errors.email).toBe('Invalid email');

    // Change the field
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com', type: 'text' },
      });
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('should call onSubmit with form values', async () => {
    const initialValues = { name: 'John', email: 'john@example.com' };
    const onSubmit = jest.fn().mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(onSubmit).toHaveBeenCalledWith(initialValues);
  });

  it('should handle submission errors', async () => {
    const initialValues = { email: '' };
    const error = new Error('Validation failed');
    error.data = { errors: { email: 'Invalid email' } };
    const onSubmit = jest.fn().mockRejectedValueOnce(error);
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('should set isSubmitting during submission', async () => {
    const initialValues = { name: '' };
    let submittingDuringCall = false;
    const onSubmit = jest.fn(async () => {
      submittingDuringCall = true;
      return new Promise(resolve => setTimeout(resolve, 10));
    });
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    expect(result.current.isSubmitting).toBe(false);

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(submittingDuringCall).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should reset form to initial values', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.handleChange({ target: { name: 'name', value: 'John', type: 'text' } });
      result.current.handleBlur({ target: { name: 'name' } });
      result.current.setFieldError('email', 'Invalid');
    });

    expect(result.current.values.name).toBe('John');
    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.email).toBe('Invalid');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should allow manual field value updates', () => {
    const initialValues = { name: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.setFieldValue('name', 'Updated');
    });

    expect(result.current.values.name).toBe('Updated');
  });

  it('should allow manual error setting', () => {
    const initialValues = { name: '' };
    const { result } = renderHook(() => useForm(initialValues, jest.fn()));

    act(() => {
      result.current.setFieldError('name', 'Name is required');
    });

    expect(result.current.errors.name).toBe('Name is required');
  });

  it('should handle generic form errors from onSubmit', async () => {
    const initialValues = { name: '' };
    const error = new Error('Something went wrong');
    const onSubmit = jest.fn().mockRejectedValueOnce(error);
    const { result } = renderHook(() => useForm(initialValues, onSubmit));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });

    expect(result.current.errors.form).toBe('Something went wrong');
  });
});
