package com.nills.finance.repository;

import com.nills.finance.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    List<UserEntity> findAllByFamily_Id(Long familyId);
    void deleteAllByFamily_Id(Long familyId);
}