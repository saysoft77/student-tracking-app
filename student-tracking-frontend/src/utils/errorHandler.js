export const handleError = (error) => {
  // Log error to monitoring service (future implementation)
  console.error('Global error:', error);
  
  // Categorize errors
  if (error.response) {
    return {
      type: 'API_ERROR',
      message: error.response.data.message || 'An API error occurred',
      status: error.response.status
    };
  }
  
  return {
    type: 'GENERAL_ERROR',
    message: 'An unexpected error occurred',
    error: error
  };
};
