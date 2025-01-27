export const validateFullName = (name: string): boolean => {
  return /^[a-zA-Z\s]{2,}$/.test(name.trim());
};

export const validatePhone = (phone: string): boolean => {
  // E.164 format validation
  return /^\+[1-9]\d{1,14}$/.test(phone.trim());
};

export const formatPhoneE164 = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming US/Canada)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Return formatted number or original if invalid
  return digits.startsWith('1') ? `+${digits}` : `+${digits}`;
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, JPEG and PNG files are allowed'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { isValid: true };
};