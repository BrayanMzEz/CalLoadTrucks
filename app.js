// Variables para almacenar límites máximos
let limits = {
    frontAxle: 0,
    fifthWheel: 0,
    tractor: 0,
    trailer: 0,
    minTotal: 0,
    maxTotal: 0
};

// Valores por defecto para los límites
const defaultLimits = {
    frontAxle: 12000,
    fifthWheel: 34000,
    tractor: 46000,
    trailer: 52000,
    minTotal: 94000,
    maxTotal: 95500
};

// Variables para almacenar valores actuales
let currentValues = {
    frontAxle: 0,
    tractor: 0,
    fifthWheel: 0,
    total: 0,
    trailer: 0
};

// Controles para saber qué campos fueron modificados manualmente
let trailerModifiedManually = false;
let totalModifiedManually = false;

// Elementos del DOM para límites máximos
const maxFrontInput = document.getElementById('max-front');
const maxFifthInput = document.getElementById('max-fifth');
const maxTractorInput = document.getElementById('max-tractor');
const maxTrailerInput = document.getElementById('max-trailer');
const minTotalInput = document.getElementById('min-total');
const maxTotalInput = document.getElementById('max-total');

// Checkbox único para guardar límites
const saveLimitsCheckbox = document.getElementById('save-limits');

// Elementos del DOM para valores actuales
const currentFrontInput = document.getElementById('current-front');
const currentTractorInput = document.getElementById('current-tractor');
const currentFifthInput = document.getElementById('current-fifth');
const currentTotalInput = document.getElementById('current-total');
const currentTrailerInput = document.getElementById('current-trailer');

// Elementos de información
const frontInfo = document.getElementById('front-info');
const tractorInfo = document.getElementById('tractor-info');
const fifthInfo = document.getElementById('fifth-info');
const totalInfo = document.getElementById('total-info');
const trailerInfo = document.getElementById('trailer-info');

// Display de resultado y botón
const resultDisplay = document.getElementById('result-display');
const totalWeightSpan = document.getElementById('total-weight');
const btnClear = document.getElementById('btn-clear');

// Función para cargar límites desde localStorage
function loadLimitsFromStorage() {
    const savedLimits = localStorage.getItem('trailerLimits');
    const saveChecked = localStorage.getItem('saveLimitsChecked');
    
    // Si hay valores guardados, cargarlos
    if (savedLimits) {
        limits = JSON.parse(savedLimits);
        
        // Establecer valores en los inputs
        maxFrontInput.value = limits.frontAxle;
        maxFifthInput.value = limits.fifthWheel;
        maxTractorInput.value = limits.tractor;
        maxTrailerInput.value = limits.trailer;
        minTotalInput.value = limits.minTotal;
        maxTotalInput.value = limits.maxTotal;
        
        // Establecer estado del checkbox
        // saveLimitsCheckbox.checked = (saveChecked === 'true');

        // Marcar checkbox por defecto
        saveLimitsCheckbox.checked = true;
    } else {
        // Si no hay valores guardados, usar valores por defecto
        limits = {...defaultLimits};
        
        // Establecer valores por defecto
        maxFrontInput.value = limits.frontAxle;
        maxFifthInput.value = limits.fifthWheel;
        maxTractorInput.value = limits.tractor;
        maxTrailerInput.value = limits.trailer;
        minTotalInput.value = limits.minTotal;
        maxTotalInput.value = limits.maxTotal;
        
        // Marcar checkbox por defecto
        saveLimitsCheckbox.checked = true;
        
        // Guardar valores por defecto
        saveAllLimits();
    }
    
    // Actualizar inmediatamente los labels de información
    calculateAndValidate();
}

// Función para guardar límites en localStorage
function saveAllLimits() {
    // Actualizar objeto de límites con valores actuales de los inputs
    limits.frontAxle = parseInt(maxFrontInput.value) || 0;
    limits.fifthWheel = parseInt(maxFifthInput.value) || 0;
    limits.tractor = parseInt(maxTractorInput.value) || 0;
    limits.trailer = parseInt(maxTrailerInput.value) || 0;
    limits.minTotal = parseInt(minTotalInput.value) || 0;
    limits.maxTotal = parseInt(maxTotalInput.value) || 0;
    
    // Si el checkbox está marcado, guardar en localStorage
    if (saveLimitsCheckbox.checked) {
        localStorage.setItem('trailerLimits', JSON.stringify(limits));
        localStorage.setItem('saveLimitsChecked', 'true');
    } else {
        // Si el checkbox no está marcado, eliminar los datos guardados
        // localStorage.removeItem('trailerLimits');
        localStorage.setItem('saveLimitsChecked', 'false');
    }
    
    // Actualizar los labels después de cambiar los límites
    calculateAndValidate();
}

// Función para calcular quinta rueda y validar pesos
function calculateAndValidate() {
    // Obtener valores actuales
    currentValues.frontAxle = parseInt(currentFrontInput.value) || 0;
    currentValues.tractor = parseInt(currentTractorInput.value) || 0;
    currentValues.total = parseInt(currentTotalInput.value) || 0;
    currentValues.trailer = parseInt(currentTrailerInput.value) || 0;
    
    // Calcular quinta rueda automáticamente
    currentValues.fifthWheel = currentValues.tractor - currentValues.frontAxle;
    if (currentValues.fifthWheel < 0) currentValues.fifthWheel = 0;
    currentFifthInput.value = currentValues.fifthWheel || '';
    
    // Determinar si calcular trailer o peso total según qué campo fue modificado
    if (trailerModifiedManually) {
        // Si el trailer fue modificado manualmente, calcular el peso total
        currentValues.total = currentValues.tractor + currentValues.trailer;
        currentTotalInput.value = currentValues.total || '';
    } else if (totalModifiedManually) {
        // Si el peso total fue modificado manualmente, calcular el trailer
        currentValues.trailer = currentValues.total - currentValues.tractor;
        if (currentValues.trailer < 0) currentValues.trailer = 0;
        currentTrailerInput.value = currentValues.trailer || '';
    } else {
        // Por defecto, si no se modificó ninguno, calcular el trailer basado en el peso total
        currentValues.trailer = currentValues.total - currentValues.tractor;
        if (currentValues.trailer < 0) currentValues.trailer = 0;
        currentTrailerInput.value = currentValues.trailer || '';
    }
    
    // Validar campos usando los límites actuales (aunque no estén guardados)
    validateField('frontAxle', currentValues.frontAxle, limits.frontAxle, currentFrontInput, frontInfo);
    validateField('tractor', currentValues.tractor, limits.tractor, currentTractorInput, tractorInfo);
    validateField('fifthWheel', currentValues.fifthWheel, limits.fifthWheel, currentFifthInput, fifthInfo);
    validateField('trailer', currentValues.trailer, limits.trailer, currentTrailerInput, trailerInfo);
    validateField('totalWeight', currentValues.total, limits.maxTotal, currentTotalInput, totalInfo, limits.minTotal);
    
    // Actualizar display del total
    updateTotalDisplay(currentValues.total);
}

// Función para validar un campo específico
function validateField(fieldName, currentValue, maxLimit, inputElement, infoElement, minLimit = null) {
    // Limpiar clases anteriores
    inputElement.classList.remove('exceed-limit', 'within-limit');
    
    // Si el campo está vacío, limpiar la información
    // if (!currentValue && fieldName !== 'fifthWheel') {
    //     infoElement.textContent = '';
    //     return;
    // }
    
    // Validar si está por encima del límite máximo
    if (currentValue > maxLimit) {
        inputElement.classList.add('exceed-limit');
        infoElement.textContent = `¡Exceso de ${(currentValue - maxLimit).toLocaleString()} lbs!`;
        infoElement.className = 'info-label error';
    } 
    // Validar si está por debajo del mínimo, si se proporciona un mínimo
    else if (minLimit && currentValue < minLimit) {
        inputElement.classList.add('within-limit');
        infoElement.textContent = `Faltan ${(minLimit - currentValue).toLocaleString()} lbs para el mínimo`;
        infoElement.className = 'info-label warning';
    }
    // Dentro del límite
    else {
        inputElement.classList.add('within-limit');
        const remaining = maxLimit - currentValue;
        infoElement.textContent = `Restan ${remaining.toLocaleString()} lbs para el máximo`;
        infoElement.className = 'info-label success';
    }
    
    // Caso especial para quinta rueda - actualizar clase según tenga valor
    if (fieldName === 'fifthWheel') {
        if (currentValue > 0) {
            inputElement.classList.add('calculated');
            inputElement.classList.remove('locked');
        } else {
            inputElement.classList.remove('calculated');
            inputElement.classList.add('locked');
        }
    }
}

// Función para actualizar el display del total
function updateTotalDisplay(total) {
    totalWeightSpan.textContent = total.toLocaleString();
    
    if (!total) {
        resultDisplay.className = 'result-display grange';
        return;
    }
    
    // Cambiar color según el rango
    if (total < limits.minTotal) {
        resultDisplay.className = 'result-display grange';
    } else if (total <= limits.maxTotal) {
        resultDisplay.className = 'result-display inrange';
    } else {
        resultDisplay.className = 'result-display exceeded';
    }
}

// Función para limpiar los valores actuales
function clearCurrentValues() {
    currentFrontInput.value = '';
    currentTractorInput.value = '';
    currentFifthInput.value = '';
    currentTotalInput.value = '';
    currentTrailerInput.value = '';
    
    trailerModifiedManually = false;
    totalModifiedManually = false;
    
    calculateAndValidate();
}

// Función para manejar navegación con Enter
function setupNavigation() {
    const inputs = [
        currentFrontInput,
        currentTractorInput,
        currentTotalInput,
        currentTrailerInput
    ];
    
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else {
                    inputs[0].focus();
                }
            }
        });
    });
}

// Event listeners para los inputs de límites máximos
const limitInputs = [maxFrontInput, maxFifthInput, maxTractorInput, maxTrailerInput, minTotalInput, maxTotalInput];
limitInputs.forEach(input => {
    input.addEventListener('input', saveAllLimits);
});

// Event listener para el checkbox de guardar límites
saveLimitsCheckbox.addEventListener('change', saveAllLimits);

// Event listeners para los inputs de valores actuales
currentFrontInput.addEventListener('input', function() {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculateAndValidate();
});

currentTractorInput.addEventListener('input', function() {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculateAndValidate();
});

currentTotalInput.addEventListener('input', function() {
    totalModifiedManually = true;
    trailerModifiedManually = false;
    calculateAndValidate();
});

currentTrailerInput.addEventListener('input', function() {
    trailerModifiedManually = true;
    totalModifiedManually = false;
    calculateAndValidate();
});

// Event listener para el botón limpiar
btnClear.addEventListener('click', clearCurrentValues);

// Cargar límites guardados al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    loadLimitsFromStorage();
    setupNavigation();
});

// Evitar el zoom en iOS al hacer doble tap en inputs
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);