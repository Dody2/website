// Finance Manager Pro - Main Application
class FinanceManager {
    constructor() {
        this.data = {
            accounts: [
                {id: 1, name: "Checking Account", type: "Personal", balance: 5420.50},
                {id: 2, name: "Business Account", type: "Business", balance: 12850.75},
                {id: 3, name: "Savings Account", type: "Personal", balance: 25600.00},
                {id: 4, name: "Investment Account", type: "Personal", balance: 48200.25}
            ],
            transactions: [
                {id: 1, date: "2025-06-10", description: "Grocery Shopping", category: "Food & Dining", amount: -145.67, type: "Personal", account: "Checking Account"},
                {id: 2, date: "2025-06-09", description: "Salary Deposit", category: "Salary", amount: 3500.00, type: "Personal", account: "Checking Account"},
                {id: 3, date: "2025-06-08", description: "Office Supplies", category: "Business Expenses", amount: -287.45, type: "Business", account: "Business Account"},
                {id: 4, date: "2025-06-07", description: "Gas Station", category: "Transportation", amount: -65.20, type: "Personal", account: "Checking Account"},
                {id: 5, date: "2025-06-06", description: "Client Payment", category: "Business Income", amount: 2500.00, type: "Business", account: "Business Account"},
                {id: 6, date: "2025-06-05", description: "Restaurant", category: "Food & Dining", amount: -89.50, type: "Personal", account: "Checking Account"},
                {id: 7, date: "2025-06-04", description: "Utilities", category: "Housing & Utilities", amount: -245.00, type: "Personal", account: "Checking Account"},
                {id: 8, date: "2025-06-03", description: "Freelance Work", category: "Freelance Work", amount: 1200.00, type: "Personal", account: "Checking Account"}
            ],
            budgets: [
                {category: "Food & Dining", budgeted: 600, spent: 235.17},
                {category: "Transportation", budgeted: 400, spent: 65.20},
                {category: "Entertainment", budgeted: 200, spent: 0},
                {category: "Business Expenses", budgeted: 1500, spent: 287.45},
                {category: "Housing & Utilities", budgeted: 1200, spent: 245.00}
            ],
            categories: {
                expense: ["Housing & Utilities", "Transportation", "Food & Dining", "Healthcare", "Entertainment", "Shopping", "Travel", "Business Expenses", "Insurance", "Investment", "Savings", "Taxes", "Miscellaneous"],
                income: ["Salary", "Business Income", "Investment Returns", "Freelance Work", "Rental Income", "Other Income"]
            }
        };
        
        this.charts = {};
        this.currentEditingId = null;
        this.filteredTransactions = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderTransactions();
        this.renderBudgets();
        this.renderAccounts();
        this.populateFormOptions();
        this.initializeCharts();
        this.applyTheme();
    }

    loadData() {
        const savedData = localStorage.getItem('financeManagerData');
        if (savedData) {
            this.data = { ...this.data, ...JSON.parse(savedData) };
        }
    }

    saveData() {
        localStorage.setItem('financeManagerData', JSON.stringify(this.data));
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Add transaction buttons
        document.getElementById('add-transaction-btn').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('add-transaction-btn-2').addEventListener('click', () => this.openTransactionModal());

        // Modal controls
        this.setupModalListeners();

        // Form submissions
        document.getElementById('transaction-form').addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('budget-form').addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        document.getElementById('account-form').addEventListener('submit', (e) => this.handleAccountSubmit(e));

        // Filters and search
        document.getElementById('search-transactions').addEventListener('input', (e) => this.filterTransactions());
        document.getElementById('filter-category').addEventListener('change', (e) => this.filterTransactions());
        document.getElementById('filter-account').addEventListener('change', (e) => this.filterTransactions());
        document.getElementById('filter-type').addEventListener('change', (e) => this.filterTransactions());

        // Export buttons
        document.getElementById('export-transactions').addEventListener('click', () => this.exportTransactions());
        document.getElementById('export-budgets').addEventListener('click', () => this.exportBudgets());
        document.getElementById('export-accounts').addEventListener('click', () => this.exportAccounts());
        document.getElementById('export-summary').addEventListener('click', () => this.exportSummary());
        document.getElementById('export-data-btn').addEventListener('click', () => this.exportTransactions());

        // Quick actions
        document.getElementById('view-all-transactions').addEventListener('click', () => this.switchSection('transactions'));
        document.getElementById('add-budget-btn').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('add-account-btn').addEventListener('click', () => this.openAccountModal());

        // Transaction direction change
        document.getElementById('transaction-direction').addEventListener('change', (e) => this.updateCategoryOptions(e.target.value));
    }

    setupModalListeners() {
        // Transaction modal
        document.getElementById('close-transaction-modal').addEventListener('click', () => this.closeModal('transaction-modal'));
        document.getElementById('cancel-transaction').addEventListener('click', () => this.closeModal('transaction-modal'));

        // Budget modal
        document.getElementById('close-budget-modal').addEventListener('click', () => this.closeModal('budget-modal'));
        document.getElementById('cancel-budget').addEventListener('click', () => this.closeModal('budget-modal'));

        // Account modal
        document.getElementById('close-account-modal').addEventListener('click', () => this.closeModal('account-modal'));
        document.getElementById('cancel-account').addEventListener('click', () => this.closeModal('account-modal'));

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    switchSection(sectionName) {
        // Update active section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update charts if switching to dashboard or reports
        if (sectionName === 'dashboard' || sectionName === 'reports') {
            setTimeout(() => this.updateCharts(), 100);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle button
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Update charts with new theme
        setTimeout(() => this.updateCharts(), 100);
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            const themeBtn = document.getElementById('theme-toggle');
            themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    updateDashboard() {
        const totalBalance = this.data.accounts.reduce((sum, account) => sum + account.balance, 0);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.data.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = Math.abs(monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const netIncome = monthlyIncome - monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? (netIncome / monthlyIncome) * 100 : 0;

        document.getElementById('total-balance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('monthly-income').textContent = this.formatCurrency(monthlyIncome);
        document.getElementById('monthly-expenses').textContent = this.formatCurrency(monthlyExpenses);
        document.getElementById('savings-rate').textContent = savingsRate.toFixed(1) + '%';

        this.renderRecentTransactions();
    }

    renderRecentTransactions() {
        const recentTransactions = this.data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recent-transactions');
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span>${transaction.category}</span>
                        <span>${transaction.account}</span>
                        <span>${new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'income' : 'expense'}">
                    ${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }

    renderTransactions() {
        this.filteredTransactions = [...this.data.transactions];
        this.displayTransactions();
    }

    displayTransactions() {
        const container = document.getElementById('transactions-table');
        const transactions = this.filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span>${transaction.category}</span>
                        <span>${transaction.account}</span>
                        <span>${new Date(transaction.date).toLocaleDateString()}</span>
                        <span class="status status--${transaction.type.toLowerCase()}">${transaction.type}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'income' : 'expense'}">
                    ${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn btn--sm btn--outline" onclick="financeManager.editTransaction(${transaction.id})">Edit</button>
                    <button class="btn btn--sm btn--danger" onclick="financeManager.deleteTransaction(${transaction.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    filterTransactions() {
        const search = document.getElementById('search-transactions').value.toLowerCase();
        const category = document.getElementById('filter-category').value;
        const account = document.getElementById('filter-account').value;
        const type = document.getElementById('filter-type').value;

        this.filteredTransactions = this.data.transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(search) ||
                                transaction.category.toLowerCase().includes(search);
            const matchesCategory = !category || transaction.category === category;
            const matchesAccount = !account || transaction.account === account;
            const matchesType = !type || transaction.type === type;

            return matchesSearch && matchesCategory && matchesAccount && matchesType;
        });

        this.displayTransactions();
    }

    renderBudgets() {
        const container = document.getElementById('budgets-grid');
        container.innerHTML = this.data.budgets.map(budget => {
            const percentage = (budget.spent / budget.budgeted) * 100;
            const remaining = budget.budgeted - budget.spent;
            const status = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : '';

            return `
                <div class="budget-card">
                    <div class="budget-header">
                        <div class="budget-category">${budget.category}</div>
                        <button class="btn btn--sm btn--outline" onclick="financeManager.editBudget('${budget.category}')">Edit</button>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="budget-amounts">
                            <span>Spent: ${this.formatCurrency(budget.spent)}</span>
                            <span>Remaining: ${this.formatCurrency(remaining)}</span>
                        </div>
                        <div class="budget-amounts">
                            <span>Budget: ${this.formatCurrency(budget.budgeted)}</span>
                            <span>${percentage.toFixed(1)}% used</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAccounts() {
        const container = document.getElementById('accounts-grid');
        container.innerHTML = this.data.accounts.map(account => `
            <div class="account-card">
                <div class="account-header">
                    <div>
                        <div class="account-name">${account.name}</div>
                        <div class="account-type">${account.type}</div>
                    </div>
                    <button class="btn btn--sm btn--outline" onclick="financeManager.editAccount(${account.id})">Edit</button>
                </div>
                <div class="account-balance">${this.formatCurrency(account.balance)}</div>
            </div>
        `).join('');
    }

    populateFormOptions() {
        // Populate category filters
        const categoryFilter = document.getElementById('filter-category');
        const allCategories = [...this.data.categories.expense, ...this.data.categories.income];
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        // Populate account filters
        const accountFilter = document.getElementById('filter-account');
        accountFilter.innerHTML = '<option value="">All Accounts</option>' +
            this.data.accounts.map(acc => `<option value="${acc.name}">${acc.name}</option>`).join('');

        // Populate transaction form accounts
        const transactionAccount = document.getElementById('transaction-account');
        transactionAccount.innerHTML = '<option value="">Select Account</option>' +
            this.data.accounts.map(acc => `<option value="${acc.name}">${acc.name}</option>`).join('');

        // Populate budget categories
        const budgetCategory = document.getElementById('budget-category');
        budgetCategory.innerHTML = '<option value="">Select Category</option>' +
            this.data.categories.expense.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        // Set default transaction date to today
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];

        // Initialize transaction category options with default direction (expense)
        this.updateCategoryOptions('expense');
    }

    updateCategoryOptions(direction) {
        const categorySelect = document.getElementById('transaction-category');
        const categories = direction === 'income' ? this.data.categories.income : this.data.categories.expense;
        
        const currentValue = categorySelect.value;
        categorySelect.innerHTML = '<option value="">Select Category</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        // Restore previous selection if it exists in new categories
        if (currentValue && categories.includes(currentValue)) {
            categorySelect.value = currentValue;
        }
    }

    initializeCharts() {
        this.createIncomeExpensesChart();
        this.createBudgetChart();
        this.createExpenseBreakdownChart();
    }

    createIncomeExpensesChart() {
        const ctx = document.getElementById('income-expenses-chart').getContext('2d');
        
        // Generate last 6 months data
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            const monthTransactions = this.data.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
            });
            
            const income = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const expenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            
            incomeData.push(income);
            expenseData.push(expenses);
        }

        this.charts.incomeExpenses = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createBudgetChart() {
        const ctx = document.getElementById('budget-chart').getContext('2d');
        
        const categories = this.data.budgets.map(b => b.category);
        const budgetedData = this.data.budgets.map(b => b.budgeted);
        const spentData = this.data.budgets.map(b => b.spent);

        this.charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Budgeted',
                    data: budgetedData,
                    backgroundColor: '#FFC185',
                }, {
                    label: 'Spent',
                    data: spentData,
                    backgroundColor: '#1FB8CD',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createExpenseBreakdownChart() {
        const ctx = document.getElementById('expense-breakdown-chart').getContext('2d');
        
        const expenseCategories = {};
        this.data.transactions.filter(t => t.amount < 0).forEach(t => {
            expenseCategories[t.category] = (expenseCategories[t.category] || 0) + Math.abs(t.amount);
        });

        const labels = Object.keys(expenseCategories);
        const data = Object.values(expenseCategories);
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

        this.charts.expenseBreakdown = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.update();
        });
    }

    // Modal Management
    openTransactionModal(transaction = null) {
        this.currentEditingId = transaction ? transaction.id : null;
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('transaction-modal-title');
        
        if (transaction) {
            title.textContent = 'Edit Transaction';
            this.populateTransactionForm(transaction);
        } else {
            title.textContent = 'Add Transaction';
            document.getElementById('transaction-form').reset();
            document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
            // Set default direction and update categories
            document.getElementById('transaction-direction').value = 'expense';
            this.updateCategoryOptions('expense');
        }
        
        modal.classList.add('active');
        document.getElementById('transaction-description').focus();
    }

    openBudgetModal(budget = null) {
        const modal = document.getElementById('budget-modal');
        
        if (budget) {
            document.getElementById('budget-category').value = budget.category;
            document.getElementById('budget-amount').value = budget.budgeted;
        } else {
            document.getElementById('budget-form').reset();
        }
        
        modal.classList.add('active');
        document.getElementById('budget-category').focus();
    }

    openAccountModal(account = null) {
        const modal = document.getElementById('account-modal');
        
        if (account) {
            document.getElementById('account-name').value = account.name;
            document.getElementById('account-type').value = account.type;
            document.getElementById('account-balance').value = account.balance;
        } else {
            document.getElementById('account-form').reset();
        }
        
        modal.classList.add('active');
        document.getElementById('account-name').focus();
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        this.currentEditingId = null;
    }

    populateTransactionForm(transaction) {
        document.getElementById('transaction-date').value = transaction.date;
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-amount').value = Math.abs(transaction.amount);
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('transaction-account').value = transaction.account;
        
        const direction = transaction.amount > 0 ? 'income' : 'expense';
        document.getElementById('transaction-direction').value = direction;
        
        // Update categories based on direction first
        this.updateCategoryOptions(direction);
        // Then set the category value
        setTimeout(() => {
            document.getElementById('transaction-category').value = transaction.category;
        }, 10);
    }

    // Form Handlers
    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const direction = document.getElementById('transaction-direction').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        
        const transaction = {
            id: this.currentEditingId || Date.now(),
            date: document.getElementById('transaction-date').value,
            description: document.getElementById('transaction-description').value,
            category: document.getElementById('transaction-category').value,
            amount: direction === 'expense' ? -amount : amount,
            type: document.getElementById('transaction-type').value,
            account: document.getElementById('transaction-account').value
        };

        if (this.currentEditingId) {
            const index = this.data.transactions.findIndex(t => t.id === this.currentEditingId);
            if (index !== -1) {
                // Remove old transaction effect on account balance
                const oldTransaction = this.data.transactions[index];
                const account = this.data.accounts.find(a => a.name === oldTransaction.account);
                if (account) {
                    account.balance -= oldTransaction.amount;
                }
                this.data.transactions[index] = transaction;
            }
        } else {
            this.data.transactions.push(transaction);
        }

        this.updateAccountBalance(transaction);
        this.updateBudgetSpent();
        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.updateCharts();
        this.closeModal('transaction-modal');
        this.showNotification('Transaction saved successfully!', 'success');
    }

    handleBudgetSubmit(e) {
        e.preventDefault();
        
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        
        const existingIndex = this.data.budgets.findIndex(b => b.category === category);
        const spent = this.calculateSpentForCategory(category);
        
        if (existingIndex >= 0) {
            this.data.budgets[existingIndex].budgeted = amount;
        } else {
            this.data.budgets.push({
                category: category,
                budgeted: amount,
                spent: spent
            });
        }

        this.saveData();
        this.renderBudgets();
        this.updateCharts();
        this.closeModal('budget-modal');
        this.showNotification('Budget saved successfully!', 'success');
    }

    handleAccountSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('account-name').value;
        const type = document.getElementById('account-type').value;
        const balance = parseFloat(document.getElementById('account-balance').value);
        
        const account = {
            id: Date.now(),
            name: name,
            type: type,
            balance: balance
        };

        this.data.accounts.push(account);
        this.saveData();
        this.renderAccounts();
        this.populateFormOptions();
        this.updateDashboard();
        this.closeModal('account-modal');
        this.showNotification('Account added successfully!', 'success');
    }

    // Transaction Operations
    editTransaction(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (transaction) {
            this.openTransactionModal(transaction);
        }
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            const transaction = this.data.transactions.find(t => t.id === id);
            if (transaction) {
                // Remove transaction effect on account balance
                const account = this.data.accounts.find(a => a.name === transaction.account);
                if (account) {
                    account.balance -= transaction.amount;
                }
            }
            
            this.data.transactions = this.data.transactions.filter(t => t.id !== id);
            this.updateBudgetSpent();
            this.saveData();
            this.updateDashboard();
            this.renderTransactions();
            this.updateCharts();
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }

    editBudget(category) {
        const budget = this.data.budgets.find(b => b.category === category);
        if (budget) {
            this.openBudgetModal(budget);
        }
    }

    editAccount(id) {
        const account = this.data.accounts.find(a => a.id === id);
        if (account) {
            this.openAccountModal(account);
        }
    }

    // Helper Functions
    updateAccountBalance(transaction) {
        const account = this.data.accounts.find(a => a.name === transaction.account);
        if (account) {
            account.balance += transaction.amount;
        }
    }

    updateBudgetSpent() {
        this.data.budgets.forEach(budget => {
            budget.spent = this.calculateSpentForCategory(budget.category);
        });
    }

    calculateSpentForCategory(category) {
        return Math.abs(this.data.transactions
            .filter(t => t.category === category && t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Export Functions
    exportTransactions() {
        const csv = this.convertToCSV(this.data.transactions, ['id', 'date', 'description', 'category', 'amount', 'type', 'account']);
        this.downloadCSV(csv, 'transactions.csv');
    }

    exportBudgets() {
        const budgetData = this.data.budgets.map(b => ({
            ...b,
            remaining: b.budgeted - b.spent,
            percentage: ((b.spent / b.budgeted) * 100).toFixed(1)
        }));
        const csv = this.convertToCSV(budgetData, ['category', 'budgeted', 'spent', 'remaining', 'percentage']);
        this.downloadCSV(csv, 'budgets.csv');
    }

    exportAccounts() {
        const csv = this.convertToCSV(this.data.accounts, ['id', 'name', 'type', 'balance']);
        this.downloadCSV(csv, 'accounts.csv');
    }

    exportSummary() {
        const totalBalance = this.data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const monthlyIncome = this.data.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = Math.abs(this.data.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        
        const summary = [{
            'Total Balance': totalBalance,
            'Monthly Income': monthlyIncome,
            'Monthly Expenses': monthlyExpenses,
            'Net Income': monthlyIncome - monthlyExpenses,
            'Savings Rate': ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) + '%'
        }];
        
        const csv = this.convertToCSV(summary, Object.keys(summary[0]));
        this.downloadCSV(csv, 'financial_summary.csv');
    }

    convertToCSV(data, headers) {
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(','))
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showNotification(`${filename} downloaded successfully!`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const financeManager = new FinanceManager();