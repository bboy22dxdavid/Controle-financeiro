package com.nills.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
public class BudgetEntity {
    @Id
    private String id;
    private String category;
    @Column(name = "amount_limit", precision = 14, scale = 2, nullable = false)
    private BigDecimal limit;
    private String month;
    private String member;

    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private FamilyEntity family;

    protected BudgetEntity() {
    }

    public BudgetEntity(String id, String category, BigDecimal limit, String month, String member, FamilyEntity family) {
        this.id = id;
        this.category = category;
        this.limit = limit;
        this.month = month;
        this.member = member;
        this.family = family;
    }

    public String getId() { return id; }
    public String getCategory() { return category; }
    public BigDecimal getLimit() { return limit; }
    public String getMonth() { return month; }
    public String getMember() { return member; }
}