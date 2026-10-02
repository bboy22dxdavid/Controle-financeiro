package com.nills.finance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record FinanceData(
        @NotNull @Valid FamilyProfile family,
        @NotNull List<String> users,
        @NotNull List<@Valid TransactionData> transactions,
        @NotNull List<@Valid BudgetData> budgets,
        @NotNull List<@Valid SavingGoalData> goals) {

    public static FinanceData empty() {
        return new FinanceData(
                new FamilyProfile("Minha família", "Membro"),
                List.of("Membro"),
                List.of(),
                List.of(),
                List.of());
    }

    public record FamilyProfile(@NotBlank String name, @NotBlank String memberName) {
    }

    public record TransactionData(
            @NotBlank String id,
            @NotBlank String description,
            @NotBlank String category,
            @NotBlank String date,
            @Positive BigDecimal amount,
            @NotBlank String type,
            @NotBlank String member) {
    }

    public record BudgetData(
            @NotBlank String id,
            @NotBlank String category,
            @Positive BigDecimal limit,
            @NotBlank String month,
            @NotBlank String member) {
    }

    public record SavingGoalData(
            @NotBlank String id,
            @NotBlank String name,
            @Positive BigDecimal target,
            @PositiveOrZero BigDecimal saved,
            @NotBlank String dueDate,
            List<@Valid GoalDepositData> deposits) {
    }

    public record GoalDepositData(
            @NotBlank String id,
            @NotBlank String member,
            @Positive BigDecimal amount,
            @NotBlank String date) {
    }
}