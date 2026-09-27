package com.example.moceramicshop.services;

public interface EmailService {
    /**
     * Sends an HTML email. Implementations should not throw for the caller to
     * catch on a routine "reset your password" flow - a mail-server outage
     * shouldn't surface as a 500 to the end user - so failures are logged and
     * swallowed here rather than propagated.
     */
    void send(String to, String subject, String htmlBody);
}
