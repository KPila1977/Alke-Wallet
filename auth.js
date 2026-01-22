// auth.js - Manejo de autenticación

// Inicializar usuarios demo
function initializeDemoUsers() {
    const demoUsers = [
        {
            username: 'demo',
            password: 'demo123',
            name: 'Usuario Demo',
            email: 'demo@alkewallet.com',
            balance: 250000,
            transactions: [
                {
                    id: 1,
                    type: 'deposit',
                    amount: 100000,
                    description: 'Depósito inicial',
                    date: '2024-01-01',
                    status: 'completed'
                },
                {
                    id: 2,
                    type: 'transfer',
                    amount: 50000,
                    description: 'Pago a proveedor',
                    date: '2024-01-15',
                    recipient: 'Carlos López',
                    status: 'completed'
                }
            ],
            contacts: [
                {
                    id: 1,
                    name: 'Carlos López',
                    email: 'carlos@email.com',
                    accountNumber: '12345678'
                },
                {
                    id: 2,
                    name: 'Ana Silva',
                    email: 'ana@email.com',
                    accountNumber: '87654321'
                }
            ]
        }
    ];
    
    if (!localStorage.getItem('alkeWalletUsers')) {
        localStorage.setItem('alkeWalletUsers', JSON.stringify(demoUsers));
    }
}

// Función de login
function login(username, password) {
    initializeDemoUsers();
    
    const users = JSON.parse(localStorage.getItem('alkeWalletUsers'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', user.username);
        return { success: true, user: user };
    }
    
    return { success: false, message: 'Credenciales incorrectas' };
}

// Función de registro
function register(userData) {
    const users = JSON.parse(localStorage.getItem('alkeWalletUsers') || '[]');
    
    // Verificar si el usuario ya existe
    const userExists = users.some(u => u.username === userData.username || u.email === userData.email);
    if (userExists) {
        return { success: false, message: 'El usuario o email ya existe' };
    }
    
    // Crear nuevo usuario
    const newUser = {
        username: userData.username,
        password: userData.password,
        name: userData.name,
        email: userData.email,
        balance: 0,
        transactions: [],
        contacts: []
    };
    
    users.push(newUser);
    localStorage.setItem('alkeWalletUsers', JSON.stringify(users));
    
    return { success: true, message: 'Registro exitoso' };
}

// Validar formulario de login
function validateLoginForm() {
    const username = $('#username').val().trim();
    const password = $('#password').val();
    
    if (!username || !password) {
        showAlert('Por favor, completa todos los campos', 'danger');
        return false;
    }
    
    return true;
}

// Mostrar alertas
function showAlert(message, type = 'info') {
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };
    
    const alertHtml = `
        <div class="alert ${alertClass[type]} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('#alert-container').html(alertHtml);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        $('.alert').alert('close');
    }, 5000);
}

// jQuery para manejo del login
$(document).ready(function() {
    initializeDemoUsers();
    
    // Login form submission
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        
        if (!validateLoginForm()) return;
        
        const username = $('#username').val().trim();
        const password = $('#password').val();
        
        const result = login(username, password);
        
        if (result.success) {
            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            // Animación antes de redirigir
            $('.login-container').fadeOut(500, function() {
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 500);
            });
        } else {
            showAlert(result.message, 'danger');
            $('#password').val('');
            $('#password').focus();
        }
    });
    
    // Register form submission
    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: $('#reg-username').val().trim(),
            password: $('#reg-password').val(),
            name: $('#reg-name').val().trim(),
            email: $('#reg-email').val().trim()
        };
        
        // Validaciones básicas
        if (!userData.username || !userData.password || !userData.name || !userData.email) {
            showAlert('Por favor, completa todos los campos', 'danger');
            return;
        }
        
        if (userData.password.length < 6) {
            showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }
        
        const result = register(userData);
        
        if (result.success) {
            showAlert(result.message + ' Ahora puedes iniciar sesión', 'success');
            
            // Cambiar a formulario de login
            $('#register-form-container').hide();
            $('#login-form-container').show();
            
            // Pre-llenar datos
            $('#username').val(userData.username);
            $('#password').val('');
            
            // Enfocar en password
            setTimeout(() => {
                $('#password').focus();
            }, 300);
        } else {
            showAlert(result.message, 'danger');
        }
    });
    
    // Toggle entre login y registro
    $('#show-register').on('click', function(e) {
        e.preventDefault();
        $('#login-form-container').hide();
        $('#register-form-container').show();
        $('#reg-username').focus();
    });
    
    $('#show-login').on('click', function(e) {
        e.preventDefault();
        $('#register-form-container').hide();
        $('#login-form-container').show();
        $('#username').focus();
    });
    
    // Mostrar/ocultar contraseña
    $('.toggle-password').on('click', function() {
        const input = $(this).siblings('input');
        const icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    });
});