export const validateName = (name) => {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters long';
  if (!/^[a-zA-Z\s]*$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  if (password.includes(' ')) return 'Password cannot contain spaces';
  return null;
};

export const validateContact = (contact) => {
  const contactRegex = /^[0-9]{10}$/;
  if (!contact || !contactRegex.test(contact)) return 'Contact number must be exactly 10 digits';
  return null;
};

// Utility to trim all string values in an object (whitespace remover)
export const sanitizeForm = (formData) => {
  const sanitized = { ...formData };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // For email, password, and contact we can remove all spaces.
      // For name, we just trim start and end spaces and remove extra spaces between words.
      if (['email', 'password', 'newPassword', 'verifyPassword', 'rePassword', 'contact'].includes(key)) {
        sanitized[key] = sanitized[key].replace(/\s+/g, '');
      } else {
        sanitized[key] = sanitized[key].trim().replace(/\s{2,}/g, ' ');
      }
    }
  }
  return sanitized;
};
