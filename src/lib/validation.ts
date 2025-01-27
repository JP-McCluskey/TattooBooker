// Phone number validation and formatting
export const validatePhone = (phone: string): boolean => {
  // Allow empty phone numbers
  if (!phone) return true;
  
  // Remove all non-numeric characters except leading +
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // Must start with + and have 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(cleanedPhone);
};

export const formatPhoneE164 = (phone: string): string => {
  // Remove all non-numeric characters except leading +
  return phone.replace(/[^\d+]/g, '');
};

// Name validation
export const validateFullName = (name: string): boolean => {
  if (!name) return false;
  
  // Remove extra spaces and trim
  const cleanedName = name.replace(/\s+/g, ' ').trim();
  
  // Must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/;
  return nameRegex.test(cleanedName);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain a number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Must contain a special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Image file validation
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be JPG, JPEG or PNG'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { isValid: true };
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Rate limiting check
export const checkRateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(key) || '[]') as number[];
  
  // Filter attempts within the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  // Store updated attempts
  localStorage.setItem(key, JSON.stringify([...recentAttempts, now]));
  
  return recentAttempts.length < maxAttempts;
};

// Social media handle validation
export const validateSocialHandle = (handle: string, platform: 'instagram' | 'twitter' | 'facebook'): boolean => {
  if (!handle) return true; // Allow empty handles
  
  switch (platform) {
    case 'instagram':
      // Must start with @ and contain only letters, numbers, dots, and underscores
      return /^@[a-zA-Z0-9._]{1,30}$/.test(handle);
    case 'twitter':
      // Must start with @ and contain only letters, numbers, and underscores
      return /^@[a-zA-Z0-9_]{1,15}$/.test(handle);
    case 'facebook':
      // Can be a username or full URL
      return /^[a-zA-Z0-9.]{5,}$/.test(handle) || validateURL(handle);
    default:
      return false;
  }
};

// Postal code validation
export const validatePostalCode = (postalCode: string, countryCode: string): boolean => {
  if (!postalCode) return true; // Allow empty postal codes
  
  const postalRegexes: { [key: string]: RegExp } = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    // Add more country formats as needed
  };

  return postalRegexes[countryCode]?.test(postalCode) ?? true;
};

// Currency validation
export const validateCurrency = (amount: string): boolean => {
  // Allow numbers with up to 2 decimal places
  return /^\d+(\.\d{0,2})?$/.test(amount);
};

// Date validation
export const validateDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Time validation (24-hour format)
export const validateTime = (time: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};