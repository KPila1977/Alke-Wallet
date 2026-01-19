// Alke Wallet - jQuery Functions
// Funcionalidades específicas usando jQuery

$(document).ready(function() {
    console.log('Alke Wallet - jQuery cargado');
    
    // Animaciones de entrada
    $('.fade-in').hide().fadeIn(800);
    
    // Tooltips de Bootstrap
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Efectos en botones
    $('.btn').hover(
        function() {
            $(this).css('transform', 'translateY(-2px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );
    
    // Efectos en cards
    $('.card').hover(
        function() {
            $(this).css('box-shadow', '0 10px 20px rgba(0,0,0,0.1)');
        },
        function() {
            $(this).css('box-shadow', '');
        }
    );
    
    // Validación de formularios
    $('form').submit(function(e) {
        const requiredFields = $(this).find('[required]');
        let isValid = true;
        
        requiredFields.each(function() {
            if (!$(this).val().trim()) {
                isValid = false;
                highlightError($(this));
            } else {
                removeError($(this));
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            showToast('Por favor completa todos los campos requeridos', 'warning');
        }
        
        return isValid;
    });
    
    // Auto-ocultar alertas
    $('.alert').not('.alert-permanent').delay(5000).fadeOut(400);
    
    // Actualizar hora actual
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    
    // Efecto de carga en botones de acción
    $('.btn-action').click(function() {
        const btn = $(this);
        const originalText = btn.html();
        
        btn.html('<span class="spinner-border spinner-border-sm"></span> Procesando...');
        btn.prop('disabled', true);
        
        setTimeout(() => {
            btn.html(originalText);
            btn.prop('disabled', false);
        }, 2000);
    });
});

// Funciones específicas para diferentes páginas
const WalletJQuery = {
    // Para menu.html
    initMenuPage: function() {
        // Animación del saldo
        $('.balance-display').css('opacity', 0).animate({ opacity: 1 }, 1000);
        
        // Contador animado (efecto demo)
        $('.counter').each(function() {
            const $this = $(this);
            const countTo = parseFloat($this.text().replace('$', '').replace(',', ''));
            
            $({ countNum: 0 }).animate({ countNum: countTo }, {
                duration: 2000,
                easing: 'swing',
                step: function() {
                    $this.text('$ ' + Math.floor(this.countNum).toLocaleString());
                }
            });
        });
    },
    
    // Para sendmoney.html
    initSendMoneyPage: function() {
        // Autocompletar en búsqueda de contactos
        $('#searchContact').on('input', function() {
            const query = $(this).val().toLowerCase();
            if (query.length >= 2) {
                filterContacts(query);
            }
        });
        
        // Efecto al seleccionar contacto
        $('.contact-card').click(function() {
            $('.contact-card').removeClass('selected');
            $(this).addClass('selected');
            
            // Efecto visual
            $(this).animate({ 
                backgroundColor: '#e3f2fd'
            }, 200).animate({
                backgroundColor: '#ffffff'
            }, 500);
        });
    },
    
    // Para transactions.html
    initTransactionsPage: function() {
        // Ordenar tabla
        $('th[data-sort]').click(function() {
            const sortBy = $(this).data('sort');
            const isAsc = !$(this).hasClass('sorted-asc');
            
            $('th[data-sort]').removeClass('sorted-asc sorted-desc');
            $(this).addClass(isAsc ? 'sorted-asc' : 'sorted-desc');
            
            sortTransactions(sortBy, isAsc);
        });
        
        // Filtro por fecha
        $('#dateFilter').change(function() {
            filterByDate($(this).val());
        });
    },
    
    // Para deposit.html
    initDepositPage: function() {
        // Selector de monto rápido
        $('.quick-amount').click(function() {
            const amount = $(this).data('amount');
            $('#amount').val(amount).trigger('change');
            
            // Efecto visual
            $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
        });
        
        // Calculadora de comisión
        $('#amount').on('input', function() {
            const amount = parseFloat($(this).val()) || 0;
            const fee = amount * 0.01; // 1% de comisión
            $('#feeDisplay').text('Comisión: $' + fee.toFixed(2));
            $('#totalDisplay').text('Total: $' + (amount + fee).toFixed(2));
        });
    }
};

// Funciones auxiliares
function highlightError(element) {
    element.addClass('is-invalid');
    element.after('<div class="invalid-feedback">Este campo es requerido</div>');
}

function removeError(element) {
    element.removeClass('is-invalid');
    element.next('.invalid-feedback').remove();
}

function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    $('body').append(toastHtml);
    const toast = new bootstrap.Toast($('#' + toastId));
    toast.show();
    
    // Eliminar después de mostrar
    $('#' + toastId).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    $('.current-time').text(timeString);
}

function filterContacts(query) {
    $('.contact-item').each(function() {
        const text = $(this).text().toLowerCase();
        $(this).toggle(text.includes(query));
    });
}

// Inicializar funciones específicas según la página
function initPageSpecificFunctions() {
    const path = window.location.pathname;
    
    if (path.includes('menu.html')) WalletJQuery.initMenuPage();
    if (path.includes('sendmoney.html')) WalletJQuery.initSendMoneyPage();
    if (path.includes('transactions.html')) WalletJQuery.initTransactionsPage();
    if (path.includes('deposit.html')) WalletJQuery.initDepositPage();
}

// Inicializar cuando el DOM esté listo
$(document).ready(initPageSpecificFunctions);