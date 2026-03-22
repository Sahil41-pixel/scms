// ─── Centralized error message extractor ───────────────────
// Use this in EVERY catch block — never write raw error strings
export const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
};
