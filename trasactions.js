// transactions.js - Manejo de transacciones

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Realizar depósito
function makeDeposit(amount, description) {
    if (!amount || amount <= 0) {
        return { success: false, message: 'Monto inválido' };
    }
    
    const user = getCurrentUser();
    if (!user) {
        return { success: false, message: 'Usuario no autenticado' };
    }
    
    const transaction = {
        type: 'deposit',
        amount: parseFloat(amount),
        description: description || 'Depósito',
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    addTransaction(transaction);
    
    return { 
        success: true, 
        message: `Depósito de ${formatCurrency(amount)} realizado exitosamente`,
        newBalance: user.balance + parseFloat(amount)
    };
}

// Realizar transferencia
function makeTransfer(amount, recipient, description) {
    if (!amount || amount <= 0) {
        return { success: false, message: 'Monto inválido' };
    }
    
    const user = getCurrentUser();
    if (!user) {
        return { success: false, message: 'Usuario no autenticado' };
    }
    
    if (user.balance < amount) {
        return { success: false, message: 'Saldo insuficiente' };
    }
    
    if (!recipient) {
        return { success: false, message: 'Destinatario requerido' };
    }
    
    const transaction = {
        type: 'transfer',
        amount: parseFloat(amount),
        description: description || `Transferencia a ${recipient}`,
        date: new Date().toISOString(),
        recipient: recipient,
        status: 'completed'
    };
    
    addTransaction(transaction);
    
    return { 
        success: true, 
        message: `Transferencia de ${formatCurrency(amount)} a ${recipient} realizada`,
        newBalance: user.balance - parseFloat(amount)
    };
}

// Cargar transacciones en la tabla
function loadTransactions() {
    const transactions = getUserTransactions();
    const tbody = $('#transactions-table tbody');
    
    if (!tbody.length) return;
    
    tbody.empty();
    
    if (transactions.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="5" class="text-center py-4">
                    <i class="bi bi-clock-history display-4 text-muted"></i>
                    <p class="mt-2">No hay transacciones registradas</p>
                </td>
            </tr>
        `);
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactions.forEach(transaction => {
        const typeIcon = transaction.type === 'deposit' ? 'bi-plus-circle text-success' : 
                        transaction.type === 'withdrawal' ? 'bi-dash-circle text-danger' : 
                        'bi-arrow-right-circle text-primary';
        
        const typeText = transaction.type === 'deposit' ? 'Depósito' : 
                        transaction.type === 'withdrawal' ? 'Retiro' : 
                        'Transferencia';
        
        const amountClass = transaction.type === 'deposit' ? 'text-success' : 'text-danger';
        const amountSign = transaction.type === 'deposit' ? '+' : '-';
        
        tbody.append(`
            <tr class="transaction-item">
                <td>
                    <i class="bi ${typeIcon} me-2"></i>
                    ${typeText}
                </td>
                <td>${transaction.description}</td>
                <td class="${amountClass} fw-bold">
                    ${amountSign}${formatCurrency(transaction.amount)}
                </td>
                <td>${formatDate(transaction.date)}</td>
                <td>
                    <span class="status-${transaction.status}">
                        ${transaction.status === 'completed' ? 'Completado' : 
                         transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                </td>
            </tr>
        `);
    });
}

// Cargar contactos en el select
function loadContacts() {
    const contacts = getUserContacts();
    const select = $('#recipient-select');
    
    if (!select.length) return;
    
    select.empty();
    select.append('<option value="">Seleccionar contacto...</option>');
    
    contacts.forEach(contact => {
        select.append(`
            <option value="${contact.accountNumber}" data-name="${contact.name}">
                ${contact.name} - ${contact.accountNumber}
            </option>
        `);
    });
    
    // Agregar opción para nuevo contacto
    select.append('<option value="new">+ Agregar nuevo contacto</option>');
}

// jQuery para manejo de transacciones
$(document).ready(function() {
    // Cargar transacciones si estamos en la página de historial
    if ($('#transactions-table').length) {
        loadTransactions();
        
        // Filtrar transacciones
        $('#filter-type, #filter-status').on('change', function() {
            filterTransactions();
        });
        
        // Botón para exportar
        $('#export-transactions').on('click', function() {
            exportTransactions();
        });
    }
    
    // Manejar depósito
    $('#deposit-form').on('submit', function(e) {
        e.preventDefault();
        
        const amount = $('#deposit-amount').val();
        const description = $('#deposit-description').val() || 'Depósito';
        
        const result = makeDeposit(amount, description);
        
        if (result.success) {
            showAlert(result.message, 'success');
            
            // Actualizar saldo
            updateBalanceDisplay();
            
            // Limpiar formulario
            $(this).trigger('reset');
            
            // Mostrar animación
            $('.deposit-animation').fadeIn().delay(1000).fadeOut();
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 2000);
        } else {
            showAlert(result.message, 'danger');
        }
    });
    
    // Manejar transferencia
    $('#transfer-form').on('submit', function(e) {
        e.preventDefault();
        
        const amount = $('#transfer-amount').val();
        const recipientSelect = $('#recipient-select');
        const recipientOption = recipientSelect.find('option:selected');
        const recipient = recipientOption.data('name') || recipientSelect.val();
        const description = $('#transfer-description').val() || 'Transferencia';
        
        // Validar si es nuevo contacto
        if (recipientSelect.val() === 'new') {
            $('#new-contact-modal').modal('show');
            return;
        }
        
        const result = makeTransfer(amount, recipient, description);
        
        if (result.success) {
            showAlert(result.message, 'success');
            
            // Actualizar saldo
            updateBalanceDisplay();
            
            // Limpiar formulario
            $(this).trigger('reset');
            
            // Mostrar comprobante
            showReceipt(amount, recipient, description);
        } else {
            showAlert(result.message, 'danger');
        }
    });
    
    // Agregar nuevo contacto
    $('#add-contact-form').on('submit', function(e) {
        e.preventDefault();
        
        const contactData = {
            name: $('#contact-name').val().trim(),
            email: $('#contact-email').val().trim(),
            accountNumber: $('#contact-account').val().trim()
        };
        
        if (!contactData.name || !contactData.accountNumber) {
            showAlert('Nombre y número de cuenta son requeridos', 'danger');
            return;
        }
        
        const success = addContact(contactData);
        
        if (success) {
            showAlert('Contacto agregado exitosamente', 'success');
            loadContacts();
            $('#new-contact-modal').modal('hide');
            $(this).trigger('reset');
            
            // Seleccionar el nuevo contacto
            $('#recipient-select').val(contactData.accountNumber);
        } else {
            showAlert('Error al agregar contacto', 'danger');
        }
    });
    
    // Auto completar destinatario al seleccionar contacto
    $('#recipient-select').on('change', function() {
        if ($(this).val() && $(this).val() !== 'new') {
            const recipientName = $(this).find('option:selected').data('name');
            $('#recipient-name').val(recipientName);
        }
    });
    
    // Formatear input de monto
    $('.currency-input').on('input', function() {
        let value = $(this).val().replace(/[^\d]/g, '');
        if (value) {
            value = parseInt(value, 10);
            $(this).val(value.toLocaleString('es-CL'));
        }
    });
    
    // Cargar contactos al cargar la página
    if ($('#recipient-select').length) {
        loadContacts();
    }
});

// Filtrar transacciones
function filterTransactions() {
    const typeFilter = $('#filter-type').val();
    const statusFilter = $('#filter-status').val();
    
    $('.transaction-item').each(function() {
        const type = $(this).find('td:first').text().toLowerCase();
        const status = $(this).find('td:last span').text().toLowerCase();
        
        let show = true;
        
        if (typeFilter && !type.includes(typeFilter)) {
            show = false;
        }
        
        if (statusFilter && status !== statusFilter) {
            show = false;
        }
        
        $(this).toggle(show);
    });
}

// Exportar transacciones
function exportTransactions() {
    const transactions = getUserTransactions();
    
    if (transactions.length === 0) {
        showAlert('No hay transacciones para exportar', 'warning');
        return;
    }
    
    let csvContent = "Fecha,Tipo,Descripción,Monto,Estado,Destinatario\n";
    
    transactions.forEach(transaction => {
        const row = [
            formatDate(transaction.date),
            transaction.type === 'deposit' ? 'Depósito' : 
            transaction.type === 'withdrawal' ? 'Retiro' : 'Transferencia',
            transaction.description,
            transaction.amount,
            transaction.status === 'completed' ? 'Completado' : 'Pendiente',
            transaction.recipient || ''
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Transacciones exportadas exitosamente', 'success');
}

// Mostrar comprobante
function showReceipt(amount, recipient, description) {
    const receiptHtml = `
        <div class="receipt-container p-4 border rounded bg-white">
            <div class="text-center mb-4">
                <i class="bi bi-check-circle-fill text-success display-4"></i>
                <h3 class="mt-3">¡Transferencia Exitosa!</h3>
            </div>
            
            <div class="receipt-details">
                <div class="d-flex justify-content-between mb-2">
                    <span>Monto:</span>
                    <strong class="text-danger">${formatCurrency(amount)}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Destinatario:</span>
                    <strong>${recipient}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Descripción:</span>
                    <span>${description}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Fecha:</span>
                    <span>${formatDate(new Date().toISOString())}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>ID Transacción:</span>
                    <small class="text-muted">${Date.now()}</small>
                </div>
            </div>
            
            <hr class="my-4">
            
            <div class="text-center">
                <button class="btn btn-outline-primary me-2" onclick="printReceipt()">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <button class="btn btn-primary" onclick="closeReceipt()">
                    <i class="bi bi-check"></i> Aceptar
                </button>
            </div>
        </div>
    `;
    
    $('#receipt-container').html(receiptHtml).fadeIn();
}

// Imprimir comprobante
function printReceipt() {
    const receiptContent = document.querySelector('.receipt-container').outerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Comprobante Alke Wallet</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css">
                <style>
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Cerrar comprobante
function closeReceipt() {
    $('#receipt-container').fadeOut();
}