package com.nills.finance.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saving_goals")
public class SavingGoalEntity {
    @Id
    private String id;
    private String name;
    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal target;
    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal saved;
    private String dueDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private FamilyEntity family;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoalDepositEntity> deposits = new ArrayList<>();

    protected SavingGoalEntity() {
    }

    public SavingGoalEntity(String id, String name, BigDecimal target, BigDecimal saved, String dueDate, FamilyEntity family) {
        this.id = id;
        this.name = name;
        this.target = target;
        this.saved = saved;
        this.dueDate = dueDate;
        this.family = family;
    }

    public void addDeposit(GoalDepositEntity deposit) {
        deposits.add(deposit);
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getTarget() { return target; }
    public BigDecimal getSaved() { return saved; }
    public String getDueDate() { return dueDate; }
    public List<GoalDepositEntity> getDeposits() { return deposits; }
}