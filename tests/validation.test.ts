import {
  isValidEmail,
  isValidPassword,
  validateRegisterInput,
  validateRecipeInput,
} from '@/lib/validation';

describe('validation helpers', () => {
  it('validates email addresses correctly', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('validates password length', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
  });

  it('validates register input', () => {
    expect(validateRegisterInput('', 'password', 'Name')).toBe('Email, password, and name are required');
    expect(validateRegisterInput('invalid-email', 'password', 'Name')).toBe('Email must be valid');
    expect(validateRegisterInput('user@example.com', '123', 'Name')).toBe('Password must be at least 6 characters');
    expect(validateRegisterInput('user@example.com', 'secure123', 'Name')).toBeNull();
  });

  it('validates recipe input requirements', () => {
    expect(validateRecipeInput({ title: '', ingredients: 'egg', instructions: 'mix' }, true)).toBe('Title, ingredients, and instructions are required');
    expect(validateRecipeInput({ title: 'Pie', ingredients: '', instructions: 'mix' }, true)).toBe('Title, ingredients, and instructions are required');
    expect(validateRecipeInput({ title: 'Pie', ingredients: 'egg', instructions: '' }, true)).toBe('Title, ingredients, and instructions are required');
    expect(validateRecipeInput({ title: 'Pie', ingredients: 'egg', instructions: 'mix' }, true)).toBeNull();
  });
});
