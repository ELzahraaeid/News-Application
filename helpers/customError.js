/* customError function
   arguments: error status, error code, error message
   return   : error object                        
*/
const customError = (status, code, message) => {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
}


exports.customError = customError;
exports.authError = customError(401, 'AUTHENTICATION_ERROR', 'invalid username or password');
exports.authorizationError = customError(403, 'AUTHORIZATION_ERROR', 'you are not authorized on this action');

