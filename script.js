// Program Keuangan Mobile - Target Menabung
document.addEventListener('DOMContentLoaded', function() {
    // Konfigurasi Aplikasi
    const APP_CONFIG = {
        STORAGE_KEY: 'savingTargetsMobile',
        VERSION: '1.0.0',
        NOTIFICATION_KEY: 'savingNotifications',
        THEME_KEY: 'savingTheme'
    };
    
    // Inisialisasi Data
    let targets = loadTargets();
    let currentTargetId = null;
    let pendingAction = null;
    
    // Inisialisasi DOM Elements
    initializeElements();
    
    // Setup Event Listeners
    setupEventListeners();
    
    // Inisialisasi Tampilan
    initializeApp();
    
    // ==================== FUNGSI UTAMA ====================
    
    function initializeElements() {
        // Navigation Elements
        window.menuBtn = document.getElementById('menu-btn');
        window.closeNav = document.getElementById('close-nav');
        window.navMenu = document.getElementById('nav-menu');
        window.navItems = document.querySelectorAll('.nav-item');
        window.navTabs = document.querySelectorAll('.nav-tab');
        
        // Form Elements
        window.mobileSavingForm = document.getElementById('mobile-saving-form');
        window.transactionForm = document.getElementById('transaction-form-mobile');
        window.submitTransaction = document.getElementById('submit-transaction');
        window.cancelTransaction = document.getElementById('cancel-transaction');
        
        // Button Elements
        window.quickAddBtn = document.getElementById('quick-add-btn');
        window.addFirstTarget = document.getElementById('add-first-target');
        window.quickStatsBtn = document.getElementById('quick-stats-btn');
        window.targetsFilterBtn = document.getElementById('targets-filter-btn');
        window.targetsSortBtn = document.getElementById('targets-sort-btn');
        window.addTransactionBtn = document.getElementById('add-transaction-btn');
        
        // Filter Elements
        window.filterPanel = document.getElementById('filter-panel');
        window.filterOptions = document.querySelectorAll('.filter-option');
        
        // Page Elements
        window.pages = document.querySelectorAll('.page');
        window.seeAllLinks = document.querySelectorAll('.see-all');
        window.cancelAdd = document.getElementById('cancel-add');
        
        // Settings Elements
        window.mobileExportBtn = document.getElementById('mobile-export-btn');
        window.mobileImportBtn = document.getElementById('mobile-import-btn');
        window.mobileImportFile = document.getElementById('mobile-import-file');
        window.mobileResetBtn = document.getElementById('mobile-reset-btn');
        window.notificationsToggle = document.getElementById('notifications-toggle');
        window.darkModeToggle = document.getElementById('dark-mode-toggle');
        window.exportNavBtn = document.getElementById('export-nav-btn');
        
        // Modal Elements
        window.confirmModal = document.getElementById('confirm-modal');
        window.modalCancel = document.getElementById('modal-cancel');
        window.modalConfirm = document.getElementById('modal-confirm');
        
        // Toast Element
        window.mobileToast = document.getElementById('mobile-toast');
    }
    
    function setupEventListeners() {
        // Navigation Events
        menuBtn.addEventListener('click', toggleNavMenu);
        closeNav.addEventListener('click', toggleNavMenu);
        
        // Navigation Menu Events
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                navigateToPage(page);
                toggleNavMenu();
            });
        });
        
        // Bottom Navigation Events
        navTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                navigateToPage(page);
                
                // Update active states
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Form Events
        mobileSavingForm.addEventListener('submit', handleAddTarget);
        submitTransaction.addEventListener('click', handleTransaction);
        cancelTransaction.addEventListener('click', hideTransactionForm);
        addTransactionBtn.addEventListener('click', showTransactionForm);
        cancelAdd.addEventListener('click', () => navigateToPage('dashboard'));
        
        // Button Events
        quickAddBtn.addEventListener('click', () => navigateToPage('add-target'));
        addFirstTarget.addEventListener('click', () => navigateToPage('add-target'));
        quickStatsBtn.addEventListener('click', () => navigateToPage('stats'));
        targetsFilterBtn.addEventListener('click', toggleFilterPanel);
        targetsSortBtn.addEventListener('click', () => {
            alert('Fitur sortir akan segera hadir!');
        });
        
        // Filter Events
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const filterType = this.closest('.filter-group').querySelector('label').textContent;
                
                if (filterType.includes('Status')) {
                    // Update filter buttons
                    filterOptions.forEach(opt => {
                        if (opt.closest('.filter-group').querySelector('label').textContent.includes('Status')) {
                            opt.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    filterTargets();
                } else if (filterType.includes('Urutkan')) {
                    // Update sort buttons
                    filterOptions.forEach(opt => {
                        if (opt.closest('.filter-group').querySelector('label').textContent.includes('Urutkan')) {
                            opt.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    sortTargets(this.dataset.sort);
                }
            });
        });
        
        // See All Links Events
        seeAllLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                navigateToPage(page);
                
                // Update bottom nav
                navTabs.forEach(tab => tab.classList.remove('active'));
                document.querySelector(`.nav-tab[data-page="${page}"]`).classList.add('active');
            });
        });
        
        // Settings Events
        mobileExportBtn.addEventListener('click', exportData);
        mobileImportBtn.addEventListener('click', () => mobileImportFile.click());
        mobileImportFile.addEventListener('change', importData);
        mobileResetBtn.addEventListener('click', confirmResetData);
        exportNavBtn.addEventListener('click', exportData);
        
        // Settings Toggles
        notificationsToggle.addEventListener('change', toggleNotifications);
        darkModeToggle.addEventListener('change', toggleDarkMode);
        
        // Modal Events
        modalCancel.addEventListener('click', closeModal);
        modalConfirm.addEventListener('click', executePendingAction);
        
        // Date Input - Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('mobile-target-date').min = today;
        
        // Initialize notifications toggle from localStorage
        const notificationsEnabled = localStorage.getItem(APP_CONFIG.NOTIFICATION_KEY) === 'true';
        notificationsToggle.checked = notificationsEnabled;
        
        // Initialize dark mode toggle from localStorage
        const darkModeEnabled = localStorage.getItem(APP_CONFIG.THEME_KEY) === 'dark';
        darkModeToggle.checked = darkModeEnabled;
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
        }
    }
    
    function initializeApp() {
        // Load and display data
        updateDashboard();
        renderPriorityTargets();
        renderMobileTargets();
        updateMobileTargetSelect();
        updateRecentTransactions();
        updateStats();
        
        // Set initial active page
        navigateToPage('dashboard');
        
        // Request notification permission if needed
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    // ==================== NAVIGASI ====================
    
    function toggleNavMenu() {
        navMenu.classList.toggle('active');
    }
    
    function navigateToPage(pageId) {
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        document.getElementById(`${pageId}-page`).classList.add('active');
        
        // Update navigation menu active state
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageId) {
                item.classList.add('active');
            }
        });
        
        // Update page title
        updatePageTitle(pageId);
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    function updatePageTitle(pageId) {
        const titles = {
            'dashboard': 'Dashboard',
            'targets': 'Target Saya',
            'add-target': 'Tambah Target',
            'transactions': 'Transaksi',
            'stats': 'Statistik',
            'settings': 'Pengaturan'
        };
        
        document.title = `${titles[pageId]} - TabunganKu`;
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    function loadTargets() {
        const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }
    
    function saveTargets() {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(targets));
        updateDashboard();
        renderPriorityTargets();
        renderMobileTargets();
        updateMobileTargetSelect();
        updateRecentTransactions();
        updateStats();
        updateTransactionsBadge();
    }
    
    // ==================== TARGET MANAGEMENT ====================
    
    function handleAddTarget(e) {
        e.preventDefault();
        
        const name = document.getElementById('mobile-target-name').value.trim();
        const targetAmount = parseFloat(document.getElementById('mobile-target-amount').value);
        const currentAmount = parseFloat(document.getElementById('mobile-current-amount').value);
        const targetDate = document.getElementById('mobile-target-date').value;
        const description = document.getElementById('mobile-description').value.trim();
        
        // Validasi
        if (!name || !targetAmount || !targetDate) {
            showToast('Harap isi semua field yang diperlukan', 'error');
            return;
        }
        
        if (currentAmount > targetAmount) {
            showToast('Jumlah saat ini tidak boleh lebih besar dari target', 'error');
            return;
        }
        
        if (new Date(targetDate) < new Date()) {
            showToast('Target tanggal tidak boleh di masa lalu', 'error');
            return;
        }
        
        const newTarget = {
            id: Date.now().toString(),
            name: name,
            targetAmount: targetAmount,
            currentAmount: currentAmount,
            targetDate: targetDate,
            description: description,
            status: currentAmount >= targetAmount ? 'completed' : 'active',
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        targets.push(newTarget);
        saveTargets();
        
        // Reset form
        mobileSavingForm.reset();
        document.getElementById('mobile-target-date').min = new Date().toISOString().split('T')[0];
        
        // Navigate to targets page
        navigateToPage('dashboard');
        
        // Show success message
        showToast('Target berhasil ditambahkan!', 'success');
        
        // Send notification if enabled
        if (notificationsToggle.checked) {
            sendNotification('Target Baru Ditambahkan', `Anda menambahkan target: ${name}`);
        }
    }
    
    function handleTransaction() {
        const targetId = document.getElementById('mobile-target-select').value;
        const type = document.getElementById('mobile-transaction-type').value;
        const amount = parseFloat(document.getElementById('mobile-transaction-amount').value);
        const note = document.getElementById('mobile-transaction-note').value.trim();
        
        if (!targetId || !amount || amount <= 0) {
            showToast('Harap isi semua field dengan benar', 'error');
            return;
        }
        
        const target = targets.find(t => t.id === targetId);
        if (!target) {
            showToast('Target tidak ditemukan', 'error');
            return;
        }
        
        if (type === 'subtract' && amount > target.currentAmount) {
            showToast('Jumlah pengurangan melebihi saldo', 'error');
            return;
        }
        
        const transaction = {
            id: Date.now().toString(),
            type: type,
            amount: amount,
            note: note || (type === 'add' ? 'Penambahan tabungan' : 'Pengurangan tabungan'),
            date: new Date().toISOString()
        };
        
        // Update target amount
        if (type === 'add') {
            target.currentAmount += amount;
        } else {
            target.currentAmount -= amount;
        }
        
        // Update target status
        const oldStatus = target.status;
        target.status = target.currentAmount >= target.targetAmount ? 'completed' : 'active';
        
        // Add transaction to history
        target.transactions.push(transaction);
        target.updatedAt = new Date().toISOString();
        
        saveTargets();
        hideTransactionForm();
        
        // Reset form
        document.getElementById('mobile-transaction-amount').value = '';
        document.getElementById('mobile-transaction-note').value = '';
        
        // Show success message
        showToast(`Transaksi ${type === 'add' ? 'penambahan' : 'pengurangan'} berhasil!`, 'success');
        
        // Send notification if status changed
        if (oldStatus !== target.status && target.status === 'completed') {
            sendNotification('Target Tercapai!', `Selamat! Target "${target.name}" telah tercapai!`);
        }
    }
    
    function editTarget(id) {
        const target = targets.find(t => t.id === id);
        if (!target) return;
        
        // Set form values
        document.getElementById('mobile-target-name').value = target.name;
        document.getElementById('mobile-target-amount').value = target.targetAmount;
        document.getElementById('mobile-current-amount').value = target.currentAmount;
        document.getElementById('mobile-target-date').value = target.targetDate;
        document.getElementById('mobile-description').value = target.description || '';
        
        // Navigate to add target page
        navigateToPage('add-target');
        
        // Change form title and button
        const formTitle = document.querySelector('#add-target-page .page-header h2');
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Target';
        
        const submitBtn = mobileSavingForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
        
        // Change form submit handler
        mobileSavingForm.onsubmit = function(e) {
            e.preventDefault();
            saveTargetChanges(id);
        };
    }
    
    function saveTargetChanges(id) {
        const targetIndex = targets.findIndex(t => t.id === id);
        if (targetIndex === -1) return;
        
        const name = document.getElementById('mobile-target-name').value.trim();
        const targetAmount = parseFloat(document.getElementById('mobile-target-amount').value);
        const currentAmount = parseFloat(document.getElementById('mobile-current-amount').value);
        const targetDate = document.getElementById('mobile-target-date').value;
        const description = document.getElementById('mobile-description').value.trim();
        
        // Validasi
        if (currentAmount > targetAmount) {
            showToast('Jumlah saat ini tidak boleh lebih besar dari target', 'error');
            return;
        }
        
        // Update target
        targets[targetIndex].name = name;
        targets[targetIndex].targetAmount = targetAmount;
        targets[targetIndex].currentAmount = currentAmount;
        targets[targetIndex].targetDate = targetDate;
        targets[targetIndex].description = description;
        targets[targetIndex].status = currentAmount >= targetAmount ? 'completed' : 'active';
        targets[targetIndex].updatedAt = new Date().toISOString();
        
        saveTargets();
        
        // Reset form and navigation
        mobileSavingForm.reset();
        mobileSavingForm.onsubmit = handleAddTarget;
        navigateToPage('dashboard');
        
        showToast('Target berhasil diperbarui!', 'success');
    }
    
    function deleteTarget(id) {
        currentTargetId = id;
        pendingAction = () => {
            targets = targets.filter(t => t.id !== id);
            saveTargets();
            showToast('Target berhasil dihapus', 'success');
            closeModal();
        };
        
        showModal('Hapus Target', 'Apakah Anda yakin ingin menghapus target ini?');
    }
    
    // ==================== UI RENDERING ====================
    
    function updateDashboard() {
        const totalSavings = targets.reduce((sum, target) => sum + target.currentAmount, 0);
        const activeTargets = targets.filter(t => t.status === 'active').length;
        const completedTargets = targets.filter(t => t.status === 'completed').length;
        
        document.getElementById('mobile-total-savings').textContent = formatCurrency(totalSavings);
        document.getElementById('mobile-active-targets').textContent = activeTargets;
        document.getElementById('mobile-completed-targets').textContent = completedTargets;
    }
    
    function renderPriorityTargets() {
        const container = document.getElementById('priority-targets');
        
        if (targets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <p>Belum ada target menabung</p>
                    <button class="btn btn-primary" id="add-first-target">
                        <i class="fas fa-plus"></i> Tambah Target Pertama
                    </button>
                </div>
            `;
            // Re-add event listener
            document.getElementById('add-first-target').addEventListener('click', () => navigateToPage('add-target'));
            return;
        }
        
        // Get active targets sorted by progress (lowest first)
        const activeTargets = targets
            .filter(t => t.status === 'active')
            .sort((a, b) => {
                const progressA = a.currentAmount / a.targetAmount;
                const progressB = b.currentAmount / b.targetAmount;
                return progressA - progressB;
            })
            .slice(0, 3); // Show only top 3
        
        if (activeTargets.length === 0) {
            // Show completed targets if no active ones
            const completedTargets = targets
                .filter(t => t.status === 'completed')
                .slice(0, 3);
                
            if (completedTargets.length > 0) {
                container.innerHTML = completedTargets.map(target => createTargetCard(target)).join('');
            }
            return;
        }
        
        container.innerHTML = activeTargets.map(target => createTargetCard(target)).join('');
        
        // Add event listeners to action buttons
        container.querySelectorAll('.edit-btn-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTarget(btn.dataset.id);
            });
        });
        
        container.querySelectorAll('.delete-btn-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTarget(btn.dataset.id);
            });
        });
        
        // Add click event to target cards
        container.querySelectorAll('.target-item-mobile').forEach(card => {
            card.addEventListener('click', () => {
                // Optional: Show target details
                // For now, just log to console
                console.log('Target clicked:', card.dataset.id);
            });
        });
    }
    
    function renderMobileTargets() {
        const container = document.getElementById('mobile-targets-list');
        
        if (targets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <p>Belum ada target menabung</p>
                    <button class="btn btn-primary" onclick="navigateToPage('add-target')">
                        <i class="fas fa-plus"></i> Tambah Target
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = targets.map(target => createTargetCard(target, true)).join('');
        
        // Add event listeners
        container.querySelectorAll('.edit-btn-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editTarget(btn.dataset.id);
            });
        });
        
        container.querySelectorAll('.delete-btn-mobile').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTarget(btn.dataset.id);
            });
        });
    }
    
    function createTargetCard(target, showAllInfo = false) {
        const progress = (target.currentAmount / target.targetAmount) * 100;
        const progressPercent = Math.min(progress, 100).toFixed(1);
        
        // Calculate days left
        const today = new Date();
        const targetDate = new Date(target.targetDate);
        const timeDiff = targetDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Format date
        const formattedDate = new Date(target.targetDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        return `
            <div class="target-item-mobile ${target.status}" data-id="${target.id}">
                <div class="target-header-mobile">
                    <h3 class="target-name-mobile">${target.name}</h3>
                    <span class="target-status-mobile status-${target.status}">
                        ${target.status === 'active' ? 'Aktif' : 'Tercapai'}
                    </span>
                </div>
                
                ${showAllInfo && target.description ? `
                    <p class="target-description-mobile">${target.description}</p>
                ` : ''}
                
                <div class="target-progress-mobile">
                    <div class="progress-bar-mobile">
                        <div class="progress-fill-mobile" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${progressPercent}%</span>
                        <span>${formatCurrency(target.currentAmount)} / ${formatCurrency(target.targetAmount)}</span>
                    </div>
                </div>
                
                <div class="target-meta-mobile">
                    <div class="target-date-mobile">
                        <i class="far fa-calendar"></i>
                        ${formattedDate}
                        ${daysLeft > 0 ? `(${daysLeft} hari)` : '(Selesai)'}
                    </div>
                    <div class="target-actions-mobile">
                        <button class="action-btn-mobile edit-btn-mobile" data-id="${target.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-mobile delete-btn-mobile" data-id="${target.id}" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateMobileTargetSelect() {
        const select = document.getElementById('mobile-target-select');
        select.innerHTML = '<option value="">Pilih target...</option>';
        
        targets.forEach(target => {
            if (target.status === 'active') {
                const option = document.createElement('option');
                option.value = target.id;
                option.textContent = `${target.name} (${formatCurrency(target.currentAmount)}/${formatCurrency(target.targetAmount)})`;
                select.appendChild(option);
            }
        });
    }
    
    function updateRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        
        // Get all transactions from all targets
        const allTransactions = [];
        targets.forEach(target => {
            target.transactions.forEach(transaction => {
                allTransactions.push({
                    ...transaction,
                    targetName: target.name
                });
            });
        });
        
        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Take only last 10 transactions
        const recentTransactions = allTransactions.slice(0, 10);
        
        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>Belum ada transaksi</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-target">${transaction.targetName}</div>
                    <div class="transaction-note">${transaction.note}</div>
                    <div class="transaction-date">
                        ${new Date(transaction.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'add' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }
    
    function updateStats() {
        if (targets.length === 0) {
            document.getElementById('mobile-avg-progress').textContent = '0%';
            document.getElementById('mobile-progress-bar').style.width = '0%';
            document.getElementById('mobile-nearest-target').textContent = '-';
            document.getElementById('mobile-total-target').textContent = 'Rp 0';
            return;
        }
        
        // Calculate average progress
        const totalProgress = targets.reduce((sum, target) => {
            return sum + (target.currentAmount / target.targetAmount) * 100;
        }, 0);
        
        const avgProgress = totalProgress / targets.length;
        const avgProgressPercent = Math.min(avgProgress, 100).toFixed(1);
        
        document.getElementById('mobile-avg-progress').textContent = `${avgProgressPercent}%`;
        document.getElementById('mobile-progress-bar').style.width = `${avgProgressPercent}%`;
        
        // Find nearest target
        const activeTargets = targets.filter(t => t.status === 'active');
        if (activeTargets.length > 0) {
            activeTargets.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
            const nearest = activeTargets[0];
            document.getElementById('mobile-nearest-target').textContent = nearest.name;
        } else {
            document.getElementById('mobile-nearest-target').textContent = '-';
        }
        
        // Calculate total target amount
        const totalTargetAmount = targets.reduce((sum, target) => sum + target.targetAmount, 0);
        document.getElementById('mobile-total-target').textContent = formatCurrency(totalTargetAmount);
    }
    
    function updateTransactionsBadge() {
        const badge = document.getElementById('transactions-badge');
        const totalTransactions = targets.reduce((sum, target) => sum + target.transactions.length, 0);
        
        if (totalTransactions > 0) {
            badge.textContent = totalTransactions > 99 ? '99+' : totalTransactions;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // ==================== FILTER & SORT ====================
    
    function toggleFilterPanel() {
        filterPanel.classList.toggle('active');
    }
    
    function filterTargets() {
        // Implementation would filter the targets list
        // For now, just re-render
        renderMobileTargets();
    }
    
    function sortTargets(sortType) {
        let sortedTargets = [...targets];
        
        switch (sortType) {
            case 'date-asc':
                sortedTargets.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
                break;
            case 'progress-desc':
                sortedTargets.sort((a, b) => {
                    const progressA = a.currentAmount / a.targetAmount;
                    const progressB = b.currentAmount / b.targetAmount;
                    return progressB - progressA;
                });
                break;
            case 'amount-asc':
                sortedTargets.sort((a, b) => a.targetAmount - b.targetAmount);
                break;
        }
        
        // Update display with sorted targets
        const container = document.getElementById('mobile-targets-list');
        container.innerHTML = sortedTargets.map(target => createTargetCard(target, true)).join('');
    }
    
    // ==================== TRANSACTION FORM ====================
    
    function showTransactionForm() {
        transactionForm.style.display = 'block';
        addTransactionBtn.style.display = 'none';
    }
    
    function hideTransactionForm() {
        transactionForm.style.display = 'none';
        addTransactionBtn.style.display = 'flex';
    }
    
    // ==================== DATA EXPORT/IMPORT ====================
    
    function exportData() {
        const data = {
            version: APP_CONFIG.VERSION,
            exportDate: new Date().toISOString(),
            targets: targets
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const fileName = `tabunganku-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', fileName);
        link.click();
        
        showToast('Data berhasil diekspor', 'success');
    }
    
    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // Validate imported data structure
                if (!importedData.targets || !Array.isArray(importedData.targets)) {
                    throw new Error('Format data tidak valid');
                }
                
                pendingAction = () => {
                    targets = importedData.targets;
                    saveTargets();
                    showToast('Data berhasil diimpor', 'success');
                    closeModal();
                };
                
                showModal('Impor Data', 'Data yang diimpor akan menggantikan data saat ini. Lanjutkan?');
                
            } catch (error) {
                showToast('Gagal mengimpor data. Pastikan file valid.', 'error');
                console.error(error);
            }
            
            // Reset file input
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    function confirmResetData() {
        pendingAction = () => {
            targets = [];
            localStorage.removeItem(APP_CONFIG.STORAGE_KEY);
            saveTargets();
            showToast('Semua data telah direset', 'success');
            closeModal();
        };
        
        showModal('Reset Data', 'Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.');
    }
    
    // ==================== SETTINGS ====================
    
    function toggleNotifications() {
        const enabled = notificationsToggle.checked;
        localStorage.setItem(APP_CONFIG.NOTIFICATION_KEY, enabled.toString());
        
        if (enabled && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('Notifikasi diaktifkan', 'success');
                }
            });
        }
        
        showToast(`Notifikasi ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    }
    
    function toggleDarkMode() {
        const enabled = darkModeToggle.checked;
        localStorage.setItem(APP_CONFIG.THEME_KEY, enabled ? 'dark' : 'light');
        
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        showToast(`Tema ${enabled ? 'gelap' : 'terang'} diaktifkan`, 'success');
    }
    
    // ==================== MODAL & TOAST ====================
    
    function showModal(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        confirmModal.classList.add('active');
    }
    
    function closeModal() {
        confirmModal.classList.remove('active');
        pendingAction = null;
        currentTargetId = null;
    }
    
    function executePendingAction() {
        if (pendingAction) {
            pendingAction();
        }
    }
    
    function showToast(message, type = 'info') {
        const toast = mobileToast;
        const icon = toast.querySelector('i');
        
        // Set icon based on type
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                icon.style.color = '#4CAF50';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                icon.style.color = '#f44336';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                icon.style.color = '#2196F3';
        }
        
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // ==================== NOTIFICATIONS ====================
    
    function sendNotification(title, body) {
        if (!notificationsToggle.checked) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💰</text></svg>'
            });
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    // ==================== GLOBAL FUNCTIONS ====================
    
    // Make some functions available globally for inline event handlers
    window.navigateToPage = navigateToPage;
    window.editTarget = editTarget;
    window.deleteTarget = deleteTarget;
});