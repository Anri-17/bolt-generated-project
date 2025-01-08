/**
 * Handles JSON object responses with multiple or no rows
 * @param {Object} response - The response object from the API
 * @returns {Object} - Standardized response format
 */
export const handleJsonResponse = (response) => {
  try {
    // If response is empty or null
    if (!response || Object.keys(response).length === 0) {
      return {
        success: false,
        message: 'No data found',
        data: null,
        status: 404
      }
    }

    // If response contains data
    if (Array.isArray(response.data)) {
      return {
        success: true,
        message: response.data.length > 0 
          ? 'Data retrieved successfully' 
          : 'No records found',
        data: response.data,
        count: response.data.length,
        status: 200
      }
    }

    // If response is a single object
    if (typeof response.data === 'object' && response.data !== null) {
      return {
        success: true,
        message: 'Data retrieved successfully',
        data: response.data,
        count: 1,
        status: 200
      }
    }

    // If response format is unexpected
    return {
      success: false,
      message: 'Unexpected response format',
      data: response,
      status: 500
    }

  } catch (error) {
    // Handle any errors that occur during processing
    return {
      success: false,
      message: error.message || 'Error processing response',
      data: null,
      status: 500
    }
  }
}

/**
 * Example usage:
 * 
 * const apiResponse = await fetchData();
 * const processedResponse = handleJsonResponse(apiResponse);
 * 
 * if (processedResponse.success) {
 *   // Handle successful response
 *   console.log(processedResponse.data);
 * } else {
 *   // Handle error
 *   console.error(processedResponse.message);
 * }
 */
