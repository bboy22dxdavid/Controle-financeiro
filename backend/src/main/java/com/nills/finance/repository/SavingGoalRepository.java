package com.nills.finance.repository;

import com.nills.finance.entity.SavingGoalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavingGoalRepository extends JpaRepository<SavingGoalEntity, String> {
    List<SavingGoalEntity> findAllByFamily_Id(Long familyId);
    void deleteAllByFamily_Id(Long familyId);
}