package com.CollabSpace.authService.repositories;

import com.CollabSpace.authService.entities.Role;
import com.CollabSpace.authService.enums.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    //Optional<Role> findByName(String name);
    Optional<Role> findByRoleName(AppRole appRole);

}
