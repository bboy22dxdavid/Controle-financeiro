package com.nills.finance.repository;

import com.nills.finance.entity.BudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<BudgetEntity, String> {
    List<BudgetEntity> findAllByFamily_Id(Long familyId);
    void deleteAllByFamily_Id(Long familyId);
}