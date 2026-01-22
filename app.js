// app.js - Lógica principal de la aplicación

// Clase para manejar usuarios
class User {
    constructor(username, password, name, email) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.balance = 100000; // Saldo inicial de $100.000 CLP
        this.transactions = [];
        this.contacts = [];
    }
}

// Clase para manejar transacciones
class Transaction {
    constructor(type, amount, description, date, recipient = null, status = 'completed') {
        this.id = Date.now() + Math.floor(Math.random() * 1000);
        this.type = type; // 'deposit', 'withdrawal', 'transfer'
        this.amount = amount;
        this.description = description;
        this.date = date || new Date().toISOString();
        this.recipient = recipient;
        this.status = status;
    }
}

// Clase para manejar contactos
class Contact {
    constructor(name, email, accountNumber) {
        this.id = Date.now() + Math.floor(Math.random() * 1000);
        this.name = name;
        this.email = email;
        this.accountNumber = accountNumber;
    }
}

// Datos iniciales de la aplicación
const initialUsers = [
    new User('admin', 'admin123', 'Administrador', 'admin@alkewallet.com'),
    new User('usuario1', 'clave123', 'Juan Pérez', 'juan@email.com'),
    new User('usuario2', 'clave456', 'María González', 'maria@email.com')
];

// Añadir contactos a los usuarios iniciales
initialUsers[0].contacts = [
    new Contact('Carlos López', 'carlos@email.com', '12345678'),
    new Contact('Ana Silva', 'ana@email.com', '87654321')
];

initialUsers[0].transactions = [
    new Transaction('deposit', 50000, 'Depósito inicial', '2024-01-01'),
    new Transaction('transfer', 15000, 'Transferencia a Carlos', '2024-01-05', 'Carlos López')
];

// Inicializar almacenamiento local si no existe
function initializeStorage() {
    if (!localStorage.getItem('alkeWalletUsers')) {
        localStorage.setItem('alkeWalletUsers', JSON.stringify(initialUsers));
    }
    
    if (!localStorage.getItem('alkeWalletTransactions')) {
        const allTransactions = [];
        initialUsers.forEach(user => {
            user.transactions.forEach(transaction => {
                allTransactions.push({
                    ...transaction,
                    userId: user.username
                });
            });
        });
        localStorage.setItem('alkeWalletTransactions', JSON.stringify(allTransactions));
    }
}

// Formatear moneda en pesos chilenos
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Actualizar display del saldo
function updateBalanceDisplay() {
    const user = getCurrentUser();
    if (user) {
        const balanceElements = document.querySelectorAll('#main-balance, #current-balance');
        balanceElements.forEach(el => {
            if (el) {
                el.textContent = formatCurrency(user.balance);
            }
        });
        
        // Actualizar también en localStorage
        updateUserInStorage(user);
    }
}

// Obtener usuario actual
function getCurrentUser() {
    const username = localStorage.getItem('currentUser');
    if (!username) return null;
    
    const users = JSON.parse(localStorage.getItem('alkeWalletUsers'));
    return users.find(user => user.username === username);
}

// Actualizar usuario en almacenamiento
function updateUserInStorage(updatedUser) {
    const users = JSON.parse(localStorage.getItem('alkeWalletUsers'));
    const index = users.findIndex(user => user.username === updatedUser.username);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('alkeWalletUsers', JSON.stringify(users));
    }
}

// Agregar transacción
function addTransaction(transactionData) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const transaction = new Transaction(
        transactionData.type,
        transactionData.amount,
        transactionData.description,
        transactionData.date,
        transactionData.recipient,
        transactionData.status
    );
    
    user.transactions.push(transaction);
    
    // Actualizar saldo según tipo de transacción
    if (transaction.type === 'deposit') {
        user.balance += transaction.amount;
    } else if (transaction.type === 'withdrawal') {
        user.balance -= transaction.amount;
    } else if (transaction.type === 'transfer') {
        user.balance -= transaction.amount;
    }
    
    // Actualizar en localStorage
    updateUserInStorage(user);
    
    // Actualizar transacciones globales
    const allTransactions = JSON.parse(localStorage.getItem('alkeWalletTransactions') || '[]');
    allTransactions.push({
        ...transaction,
        userId: user.username
    });
    localStorage.setItem('alkeWalletTransactions', JSON.stringify(allTransactions));
    
    // Actualizar display
    updateBalanceDisplay();
    
    return true;
}

// Obtener transacciones del usuario
function getUserTransactions() {
    const user = getCurrentUser();
    return user ? user.transactions : [];
}

// Agregar contacto
function addContact(contactData) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const contact = new Contact(
        contactData.name,
        contactData.email,
        contactData.accountNumber
    );
    
    user.contacts.push(contact);
    updateUserInStorage(user);
    
    return true;
}

// Obtener contactos del usuario
function getUserContacts() {
    const user = getCurrentUser();
    return user ? user.contacts : [];
}

// Validar si hay sesión activa
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    // Verificar autenticación en páginas protegidas
    const currentPage = window.location.pathname;
    const protectedPages = ['menu.html', 'deposit.html', 'sendmoney.html', 'transactions.html'];
    
    if (protectedPages.some(page => currentPage.includes(page))) {
        if (!checkAuth()) return;
        
        // Actualizar información del usuario
        const user = getCurrentUser();
        if (user) {
            const userElements = document.querySelectorAll('#current-user, #user-name');
            userElements.forEach(el => {
                if (el) el.textContent = user.name;
            });
            updateBalanceDisplay();
        }
    }
    
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});