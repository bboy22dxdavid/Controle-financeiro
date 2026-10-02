package com.nills.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "families")
public class FamilyEntity {
    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "member_name", nullable = false)
    private String memberName;

    protected FamilyEntity() {
    }

    public FamilyEntity(Long id, String name, String memberName) {
        this.id = id;
        this.name = name;
        this.memberName = memberName;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getMemberName() { return memberName; }
    public void setName(String name) { this.name = name; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
}