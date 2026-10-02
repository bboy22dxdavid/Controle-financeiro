package com.nills.finance.service;

import com.nills.finance.dto.FinanceData;
import com.nills.finance.entity.BudgetEntity;
import com.nills.finance.entity.FamilyEntity;
import com.nills.finance.entity.GoalDepositEntity;
import com.nills.finance.entity.SavingGoalEntity;
import com.nills.finance.entity.TransactionEntity;
import com.nills.finance.entity.UserEntity;
import com.nills.finance.repository.BudgetRepository;
import com.nills.finance.repository.FamilyRepository;
import com.nills.finance.repository.SavingGoalRepository;
import com.nills.finance.repository.TransactionRepository;
import com.nills.finance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FinanceService {
    private static final long FAMILY_ID = 1L;

    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingGoalRepository savingGoalRepository;

    public FinanceService(FamilyRepository familyRepository, UserRepository userRepository,
                          TransactionRepository transactionRepository, BudgetRepository budgetRepository,
                          SavingGoalRepository savingGoalRepository) {
        this.familyRepository = familyRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.savingGoalRepository = savingGoalRepository;
    }

    @Transactional(readOnly = true)
    public FinanceData getFinance() {
        return familyRepository.findById(FAMILY_ID)
                .map(this::toFinanceData)
                .orElseGet(FinanceData::empty);
    }

    @Transactional
    public FinanceData saveFinance(FinanceData data) {
        FamilyEntity family = familyRepository.findById(FAMILY_ID)
                .orElseGet(() -> new FamilyEntity(FAMILY_ID, data.family().name(), data.family().memberName()));
        family.setName(data.family().name());
        family.setMemberName(data.family().memberName());
        familyRepository.save(family);

        userRepository.deleteAllByFamily_Id(FAMILY_ID);
        transactionRepository.deleteAllByFamily_Id(FAMILY_ID);
        budgetRepository.deleteAllByFamily_Id(FAMILY_ID);
        savingGoalRepository.deleteAllByFamily_Id(FAMILY_ID);

        userRepository.saveAll(data.users().stream().distinct().map(name -> new UserEntity(name, family)).toList());
        transactionRepository.saveAll(data.transactions().stream().map(item -> new TransactionEntity(
                item.id(), item.description(), item.category(), item.date(), item.amount(), item.type(), item.member(), family)).toList());
        budgetRepository.saveAll(data.budgets().stream().map(item -> new BudgetEntity(
                item.id(), item.category(), item.limit(), item.month(), item.member(), family)).toList());
        savingGoalRepository.saveAll(data.goals().stream().map(item -> {
            SavingGoalEntity goal = new SavingGoalEntity(item.id(), item.name(), item.target(), item.saved(), item.dueDate(), family);
            if (item.deposits() != null) {
                item.deposits().forEach(deposit -> goal.addDeposit(new GoalDepositEntity(
                        deposit.id(), deposit.member(), deposit.amount(), deposit.date(), goal)));
            }
            return goal;
        }).toList());

        return data;
    }

    private FinanceData toFinanceData(FamilyEntity family) {
        List<String> users = userRepository.findAllByFamily_Id(FAMILY_ID).stream().map(UserEntity::getName).toList();
        List<FinanceData.TransactionData> transactions = transactionRepository.findAllByFamily_Id(FAMILY_ID).stream()
                .map(item -> new FinanceData.TransactionData(item.getId(), item.getDescription(), item.getCategory(),
                        item.getDate(), item.getAmount(), item.getType(), item.getMember())).toList();
        List<FinanceData.BudgetData> budgets = budgetRepository.findAllByFamily_Id(FAMILY_ID).stream()
                .map(item -> new FinanceData.BudgetData(item.getId(), item.getCategory(), item.getLimit(),
                        item.getMonth(), item.getMember())).toList();
        List<FinanceData.SavingGoalData> goals = savingGoalRepository.findAllByFamily_Id(FAMILY_ID).stream()
                .map(item -> new FinanceData.SavingGoalData(item.getId(), item.getName(), item.getTarget(), item.getSaved(),
                        item.getDueDate(), item.getDeposits().stream().map(deposit -> new FinanceData.GoalDepositData(
                                deposit.getId(), deposit.getMember(), deposit.getAmount(), deposit.getDate())).toList())).toList();

        return new FinanceData(
                new FinanceData.FamilyProfile(family.getName(), family.getMemberName()),
                users,
                transactions,
                budgets,
                goals);
    }
}