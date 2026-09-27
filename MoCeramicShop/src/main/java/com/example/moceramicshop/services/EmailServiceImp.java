package com.example.moceramicshop.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceImp implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromName;

    public EmailServiceImp(JavaMailSender mailSender,
                            @Value("${app.mail.from}") String fromAddress,
                            @Value("${app.mail.from-name:MoCeramic}") String fromName) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    @Override
    public void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Sent email to={} subject={}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to build email to={} subject={}", to, subject, e);
        } catch (Exception e) {
            // Covers org.springframework.mail.MailException (auth failure, connection
            // refused, etc.) - a broken SMTP config must not turn "forgot password"
            // into a 500 for the user, so it's logged and swallowed here.
            log.error("Failed to send email to={} subject={}", to, subject, e);
        }
    }
}
