// Strong password validation rules and criteria calculation
export const checkPasswordStrength = (pwd = '') => {
  const value = pwd || '';
  const hasMinLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

  const criteria = [
    { id: 'length', label: '8+ characters', met: hasMinLength },
    { id: 'upper', label: 'Uppercase letter (A-Z)', met: hasUpper },
    { id: 'lower', label: 'Lowercase letter (a-z)', met: hasLower },
    { id: 'number', label: 'At least one number (0-9)', met: hasNumber },
    { id: 'special', label: 'Special symbol (@, #, $, !...)', met: hasSpecial }
  ];

  let score = 0;
  if (value.length > 0) {
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
  }

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Single smart dynamic hint explaining exactly what is missing
  let hint = '';
  if (value.length === 0) {
    hint = 'Minimum 8 chars with uppercase, number & symbol';
  } else if (!hasMinLength) {
    hint = `Need ${8 - value.length} more characters (min 8)`;
  } else if (!hasUpper) {
    hint = 'Add at least one uppercase letter (A-Z)';
  } else if (!hasLower) {
    hint = 'Add at least one lowercase letter (a-z)';
  } else if (!hasNumber) {
    hint = 'Add at least one number (0-9)';
  } else if (!hasSpecial) {
    hint = 'Add at least one symbol (e.g. @, #, $, !)';
  } else {
    hint = 'Password meets all security rules';
  }

  let label = 'Weak';
  let barColor = 'bg-rose-500';
  let textColor = 'text-rose-600';

  if (score === 2) {
    label = 'Fair';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (score === 3) {
    label = 'Good';
    barColor = 'bg-blue-500';
    textColor = 'text-blue-600';
  } else if (score === 4 && isValid) {
    label = 'Strong';
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  }

  return { criteria, score, isValid, hint, label, barColor, textColor };
};
