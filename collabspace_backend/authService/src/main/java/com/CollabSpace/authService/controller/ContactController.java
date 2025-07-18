package com.CollabSpace.authService.controller;



import com.CollabSpace.authService.dtos.ContactRequest;
import com.CollabSpace.authService.entities.Contact;
import com.CollabSpace.authService.service.impl.ContactService;
import com.CollabSpace.authService.utils.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    private final ContactService contactService;

    private final EmailService emailService;

    public ContactController(ContactService contactService, EmailService emailService) {
        this.contactService = contactService;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest contactRequest) {
        try {
            Contact contact = contactService.saveContact(contactRequest);
            Map<String, Object> templateVariables = new HashMap<>();
            templateVariables.put("name", contact.getName());
            templateVariables.put("email", contact.getEmail());
            templateVariables.put("message", contact.getMessage());
                emailService.sendEmail(
                        contactRequest.getEmail(), // Send to the submitter
                        "Thank You for Contacting CollabSpace",
                        "contact_confirmation_template", // Template name without .html
                        templateVariables
                );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing contact form");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }
}
