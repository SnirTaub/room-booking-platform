type ErrorContext = "login" | "register" | "search" | "booking" | "ai";

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export function getFriendlyErrorMessage(err: unknown, context: ErrorContext): string {
  const anyErr = err as any;

  // Network / connectivity issues
  if (!anyErr?.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  const payload: ApiErrorPayload | undefined = anyErr.response?.data;
  const code = payload?.error?.code;

  if (!code) {
    return defaultMessageForContext(context);
  }

  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Email or password is incorrect.";
    case "EMAIL_ALREADY_EXISTS":
      return "An account with this email already exists.";
    case "USER_CREATION_FAILED":
      return "We couldn't create your account. Please try again in a moment.";
    case "ROOM_ALREADY_BOOKED":
      return "This room is already booked for that time. Please pick a different slot.";
    case "ROOM_NOT_FOUND":
      return "We couldn't find that room. It may have been removed.";
    case "RATE_LIMIT_EXCEEDED":
      return "Too many requests. Please wait a bit and try again.";
    case "AI_INVALID_RESPONSE":
      return "I couldn't turn that into a valid search. Try adding a city, guests, and dates.";
    case "AI_PROVIDER_ERROR":
      return "AI search is unavailable right now. Please try again in a moment.";
    case "VALIDATION_ERROR":
      if (context === "ai") {
        return "Please enter a longer search request.";
      }
      if (context === "search") {
        return "Some of the search parameters are invalid. Please check them and try again.";
      }
      if (context === "booking") {
        return "Some of the booking details are invalid. Please review them and try again.";
      }
      return "Some of the details you entered are invalid. Please fix them and try again.";
    default:
      return defaultMessageForContext(context);
  }
}

function defaultMessageForContext(context: ErrorContext): string {
  switch (context) {
    case "login":
      return "Login failed. Please try again.";
    case "register":
      return "Registration failed. Please try again.";
    case "search":
      return "We couldn't run this search. Please try again.";
    case "booking":
      return "We couldn't create this booking. Please try again.";
    case "ai":
      return "We couldn't understand that search. Please try again.";
  }
}