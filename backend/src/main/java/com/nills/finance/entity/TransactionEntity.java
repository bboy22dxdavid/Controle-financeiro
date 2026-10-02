package com.nills.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "transactions")
public class TransactionEntity {
    @Id
    private String id;
    private String description;
    private String category;
    private String date;
    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;
    private String type;
    private String member;

    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private FamilyEntity family;

    protected TransactionEntity() {
    }

    public TransactionEntity(String id, String description, String category, String date,
                             BigDecimal amount, String type, String member, FamilyEntity family) {
        this.id = id;
        this.description = description;
        this.category = category;
        this.date = date;
        this.amount = amount;
        this.type = type;
        this.member = member;
        this.family = family;
    }

    public String getId() { return id; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getDate() { return date; }
    public BigDecimal getAmount() { return amount; }
    public String getType() { return type; }
    public String getMember() { return member; }
}