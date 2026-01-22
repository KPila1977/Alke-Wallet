// utils.js - Utilidades generales

// Formatear número como moneda chilena
function formatCurrency(amount) {
    return '$' + parseInt(amount).toLocaleString('es-CL');
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar RUT chileno (formato simple)
function isValidRUT(rut) {
    const re = /^[0-9]+[-|‐]{1}[0-9kK]{1}$/;
    return re.test(rut);
}

// Formatear RUT
function formatRUT(rut) {
    return rut.replace(/\./g, '').replace(/-/g, '');
}

// Mostrar notificación toast
function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    $('.toast-container').append(toastHtml);
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
    
    // Remover después de cerrar
    document.getElementById(toastId).addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
}

// Cargar datos del usuario
function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Actualizar elementos con datos del usuario
    $('.user-name').text(user.name);
    $('.user-email').text(user.email);
    $('.user-balance').text(formatCurrency(user.balance));
    
    // Actualizar avatar
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    $('.user-avatar').text(initials.substring(0, 2));
}

// Animación de carga
function showLoader(container) {
    const loaderHtml = `
        <div class="loader-overlay">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;
    
    $(container).append(loaderHtml);
}

function hideLoader(container) {
    $(container).find('.loader-overlay').remove();
}

// Confirmación con modal
function showConfirm(message, callback) {
    $('#confirm-modal .modal-body').text(message);
    $('#confirm-modal').modal('show');
    
    $('#confirm-btn').off('click').on('click', function() {
        callback(true);
        $('#confirm-modal').modal('hide');
    });
    
    $('#cancel-btn').off('click').on('click', function() {
        callback(false);
        $('#confirm-modal').modal('hide');
    });
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiado al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar: ', err);
        showToast('Error al copiar', 'danger');
    });
}

// Generar número de cuenta aleatorio
function generateAccountNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Validar monto
function isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000000; // Hasta 1.000 millones
}

// Formatear teléfono chileno
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
        return cleaned.replace(/(\d{4})(\d{4})/, '$1 $2');
    }
    return phone;
}

// Obtener saludo según hora del día
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 19) return '¡Buenas tardes!';
    return '¡Buenas noches!';
}

// Inicializar tooltips
function initTooltips() {
    $('[data-bs-toggle="tooltip"]').tooltip();
}

// Inicializar popovers
function initPopovers() {
    $('[data-bs-toggle="popover"]').popover();
}

// Guardar en localStorage con expiración
function setWithExpiry(key, value, ttl) {
    const item = {
        value: value,
        expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Obtener de localStorage con expiración
function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value;
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        isValidEmail,
        isValidRUT,
        formatRUT,
        showToast,
        loadUserData,
        showLoader,
        hideLoader,
        showConfirm,
        copyToClipboard,
        generateAccountNumber,
        isValidAmount,
        formatPhone,
        getGreeting,
        initTooltips,
        initPopovers,
        setWithExpiry,
        getWithExpiry
    };
}