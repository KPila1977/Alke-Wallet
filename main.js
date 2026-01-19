// Alke Wallet - Main JavaScript File
// Funcionalidades generales de la aplicación

// Datos de ejemplo para la aplicación
const demoData = {
    currentUser: {
        name: "Usuario Demo",
        email: "demo@alkewallet.com",
        avatar: "UD"
    },
    balance: 1250750, // En pesos chilenos (1,250,750 CLP)
    contacts: [
        { id: 1, name: "María González", email: "maria@ejemplo.com", phone: "+56 9 1234 5678" },
        { id: 2, name: "Carlos Rodríguez", email: "carlos@ejemplo.com", phone: "+56 9 2345 6789" },
        { id: 3, name: "Ana Martínez", email: "ana@ejemplo.com", phone: "+56 9 3456 7890" },
        { id: 4, name: "Pedro López", email: "pedro@ejemplo.com", phone: "+56 9 4567 8901" }
    ],
    // Historial inicial (no se modifica)
    historicalTransactions: [
        { 
            id: 1, 
            type: "income", 
            date: "2024-01-15", // Fecha fija del historial
            description: "Depósito inicial", 
            amount: 1000000, 
            contact: "Banco ABC",
            isHistorical: true // Bandera para identificar transacciones históricas
        },
        { 
            id: 2, 
            type: "expense", 
            date: "2024-01-16", 
            description: "Pago a María", 
            amount: 150000, 
            contact: "María González",
            isHistorical: true
        },
        { 
            id: 3, 
            type: "income", 
            date: "2024-01-17", 
            description: "Reembolso", 
            amount: 75500, 
            contact: "Carlos Rodríguez",
            isHistorical: true
        },
        { 
            id: 4, 
            type: "expense", 
            date: "2024-01-18", 
            description: "Compra online", 
            amount: 89750, 
            contact: "Tienda XYZ",
            isHistorical: true
        },
        { 
            id: 5, 
            type: "income", 
            date: "2024-01-19", 
            description: "Transferencia recibida", 
            amount: 200000, 
            contact: "Ana Martínez",
            isHistorical: true
        }
    ],
    // Transacciones nuevas (se agregan dinámicamente)
    newTransactions: []
};

// Función para obtener fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Alke Wallet - Aplicación cargada - CLP');
    
    // Inicializar balance desde localStorage o usar valor por defecto
    initializeBalance();
    
    // Cargar datos según la página
    loadPageSpecificData();
    
    // Configurar eventos globales
    setupGlobalEvents();
    
    // Mostrar notificación de bienvenida (solo en menu)
    if (window.location.pathname.includes('menu.html')) {
        showWelcomeNotification();
    }
});

// Inicializar balance desde localStorage
function initializeBalance() {
    const savedBalance = localStorage.getItem('alkeWalletBalance');
    if (savedBalance) {
        demoData.balance = parseInt(savedBalance);
    }
    
    // Cargar nuevas transacciones desde localStorage
    const savedTransactions = localStorage.getItem('alkeWalletTransactions');
    if (savedTransactions) {
        demoData.newTransactions = JSON.parse(savedTransactions);
    }
}

// Guardar balance en localStorage
function saveBalance() {
    localStorage.setItem('alkeWalletBalance', demoData.balance.toString());
}

// Guardar transacciones en localStorage
function saveTransactions() {
    localStorage.setItem('alkeWalletTransactions', JSON.stringify(demoData.newTransactions));
}

// Carga datos específicos por página
function loadPageSpecificData() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'menu.html':
            loadMenuData();
            break;
        case 'transactions.html':
            loadTransactionsData();
            break;
        case 'sendmoney.html':
            loadSendMoneyData();
            break;
        case 'deposit.html':
            loadDepositData();
            break;
    }
}

// Carga datos para el menú principal
function loadMenuData() {
    // Actualizar balance display
    updateBalanceDisplay();
    
    // Cargar transacciones recientes (combinadas)
    const recentContainer = document.getElementById('recentTransactions');
    const contactsList = document.getElementById('contactsList');
    
    if (recentContainer) {
        const allTransactions = [...demoData.historicalTransactions, ...demoData.newTransactions];
        const sortedTransactions = allTransactions.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 3);
        
        let html = '';
        sortedTransactions.forEach(transaction => {
            const isIncome = transaction.type === 'income';
            const amountClass = isIncome ? 'text-success' : 'text-danger';
            const amountSign = isIncome ? '+' : '-';
            
            html += `
                <tr>
                    <td>${formatDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.contact}</td>
                    <td class="text-end ${amountClass}">${amountSign} $${formatCLP(transaction.amount)}</td>
                </tr>
            `;
        });
        recentContainer.innerHTML = html;
    }
    
    // Cargar lista de contactos
    if (contactsList) {
        let contactsHtml = '';
        demoData.contacts.forEach(contact => {
            contactsHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${contact.name}</strong><br>
                        <small class="text-muted">${contact.email}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary send-to-contact" 
                            data-email="${contact.email}">
                        <i class="bi bi-send"></i>
                    </button>
                </li>
            `;
        });
        contactsList.innerHTML = contactsHtml;
        
        // Eventos para enviar a contactos
        document.querySelectorAll('.send-to-contact').forEach(button => {
            button.addEventListener('click', function() {
                const email = this.getAttribute('data-email');
                window.location.href = `sendmoney.html?contact=${encodeURIComponent(email)}`;
            });
        });
    }
}

// Carga datos para página de depósito
function loadDepositData() {
    updateBalanceDisplay();
}

// Formatea fechas en formato chileno
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Formatea montos en CLP
function formatCLP(amount) {
    return new Intl.NumberFormat('es-CL').format(amount);
}

// Actualiza display de balance
function updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll('.balance-display, #currentBalance, #updatedBalance');
    balanceElements.forEach(element => {
        if (element.id !== 'updatedBalance' || window.location.pathname.includes('deposit.html')) {
            element.textContent = `$ ${formatCLP(demoData.balance)}`;
        }
    });
}

// Configura eventos globales
function setupGlobalEvents() {
    // Confirmación antes de cerrar sesión
    const logoutButtons = document.querySelectorAll('[href*="login.html"]');
    logoutButtons.forEach(button => {
        if (button.textContent.includes('Cerrar')) {
            button.addEventListener('click', function(e) {
                if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    e.preventDefault();
                }
            });
        }
    });
});

// Muestra notificación de bienvenida
function showWelcomeNotification() {
    setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 end-0 m-3';
        notification.style.zIndex = '1060';
        notification.innerHTML = `
            <i class="bi bi-info-circle"></i>
            <strong>¡Bienvenido a Alke Wallet!</strong> Moneda: Pesos Chilenos (CLP).
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }, 1000);
}

// Funciones para manejar transacciones
function addTransaction(type, amount, description, contact) {
    const newTransaction = {
        id: demoData.historicalTransactions.length + demoData.newTransactions.length + 1,
        type: type,
        date: getCurrentDate(), // Usa fecha actual de la terminal
        description: description,
        amount: amount,
        contact: contact,
        isHistorical: false // Nueva transacción
    };
    
    // Agregar a nuevas transacciones
    demoData.newTransactions.push(newTransaction);
    
    // Actualizar balance
    if (type === 'income') {
        demoData.balance += amount;
    } else if (type === 'expense') {
        demoData.balance -= amount;
    }
    
    // Guardar en localStorage
    saveBalance();
    saveTransactions();
    
    // Actualizar display
    updateBalanceDisplay();
    
    return newTransaction;
}

// Obtener todas las transacciones (historial + nuevas)
function getAllTransactions() {
    return [...demoData.historicalTransactions, ...demoData.newTransactions];
}

// Funciones de utilidad
const WalletUtils = {
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validateAmount: function(amount, min = 0, max = 10000000) {
        return !isNaN(amount) && amount >= min && amount <= max;
    },
    
    generateTransactionId: function() {
        return 'TRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
};

// Exportar para uso en otras páginas
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demoData, WalletUtils, addTransaction, getAllTransactions };
}