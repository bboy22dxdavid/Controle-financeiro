package com.nills.finance.controller;

import com.nills.finance.dto.FinanceData;
import com.nills.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {
    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public FinanceData getFinance() {
        return financeService.getFinance();
    }

    @PutMapping
    public FinanceData saveFinance(@Valid @RequestBody FinanceData data) {
        return financeService.saveFinance(data);
    }
}