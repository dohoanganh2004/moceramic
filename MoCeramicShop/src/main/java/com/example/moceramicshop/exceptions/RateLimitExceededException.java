package com.example.moceramicshop.exceptions;

import org.springframework.http.HttpStatus;

// Handled generically by GlobalExceptionHandler.handleAppException, which
// already reads the status off any AppException - no new handler needed.
public class RateLimitExceededException extends AppException {
    public RateLimitExceededException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
