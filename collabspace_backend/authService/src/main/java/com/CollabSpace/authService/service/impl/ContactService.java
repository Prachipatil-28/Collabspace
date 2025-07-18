package com.CollabSpace.authService.service.impl;


import com.CollabSpace.authService.dtos.ContactRequest;
import com.CollabSpace.authService.entities.Contact;
import com.CollabSpace.authService.repositories.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {
    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public Contact saveContact(ContactRequest contactRequest) {
        Contact contact = new Contact(
                contactRequest.getName(),
                contactRequest.getEmail(),
                contactRequest.getMessage()
        );
        return contactRepository.save(contact);
    }

    public List<Contact> getAllContacts() {
        List<Contact> contacts = contactRepository.findAll();
        return contacts;
    }
}
