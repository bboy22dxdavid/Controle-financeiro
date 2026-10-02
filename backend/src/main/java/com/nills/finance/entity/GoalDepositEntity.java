package com.nills.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "goal_deposits")
public class GoalDepositEntity {
    @Id
    private String id;
    private String member;
    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;
    private String date;

    @ManyToOne(optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    private SavingGoalEntity goal;

    protected GoalDepositEntity() {
    }

    public GoalDepositEntity(String id, String member, BigDecimal amount, String date, SavingGoalEntity goal) {
        this.id = id;
        this.member = member;
        this.amount = amount;
        this.date = date;
        this.goal = goal;
    }

    public String getId() { return id; }
    public String getMember() { return member; }
    public BigDecimal getAmount() { return amount; }
    public String getDate() { return date; }
}