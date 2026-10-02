package com.nills.finance.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_members")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "family_id", nullable = false)
    private FamilyEntity family;

    protected UserEntity() {
    }

    public UserEntity(String name, FamilyEntity family) {
        this.name = name;
        this.family = family;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
}