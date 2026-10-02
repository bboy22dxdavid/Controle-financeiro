package com.nills.finance.repository;

import com.nills.finance.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {
    List<TransactionEntity> findAllByFamily_Id(Long familyId);
    void deleteAllByFamily_Id(Long familyId);
}