package com.CollabSpace.authService.repositories;


import com.CollabSpace.authService.entities.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
