// Validation utilities for form inputs

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null && value !== '';
};

export const validateNumber = (value: any): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && isFinite(num);
};

export const validatePositiveNumber = (value: any): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return validateNumber(num) && num > 0;
};

export const validateNonNegativeNumber = (value: any): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return validateNumber(num) && num >= 0;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
};

export const validateAccountName = (name: string): boolean => {
  return name.trim().length >= 2;
};
