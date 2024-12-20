import xss from "xss";
export function validateUserInput(input: string): {
  isValid: boolean;
  sanitizedInput?: string; // Include sanitized input
  message: string;
} {
  // Check if the input is null, undefined, or only contains whitespace
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      message: "Input cannot be empty or whitespace only.",
    };
  }
  // Minimum and maximum length for the input
  const minLength = 3;
  const maxLength = 40;
  if (input.length < minLength) {
    return {
      isValid: false,
      message: `Input must be at least ${minLength} characters long.`,
    };
  }
  if (input.length > maxLength) {
    return {
      isValid: false,
      message: `Input must not exceed ${maxLength} characters.`,
    };
  }
  // Allow alphanumeric characters and spaces
  const validPattern = /^[a-zA-Z0-9 ]+$/;
  if (!validPattern.test(input)) {
    return {
      isValid: false,
      message: "Input can only contain letters, numbers, and spaces.",
    };
  }
  // Sanitize the input to remove any potential XSS payloads
  const sanitizedInput = xss(input);
  return {
    isValid: true,
    sanitizedInput, // Provide sanitized input for safe use
    message: "Valid input.",
  };
}
