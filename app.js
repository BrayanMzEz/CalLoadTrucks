// Valores por defecto para cada modo
const defaultLimitsByMode = {
    papera: {
        frontAxle: 12000,
        fifthWheel: 34000,
        tractor: 46000,
        trailer: 52000,
        minTotal: 94000,
        maxTotal: 95500
    },
    hopper: {
        frontAxle: 12000,
        fifthWheel: 34000,
        tractor: 46000,
        trailer: 29000,
        tractorTrailer: 75000,
        pup: 34000,
        minTotal: 104500,
        maxTotal: 105500
    },
    rifers: {
        frontAxle: 12000,
        fifthWheel: 34000,
        tractor: 46000,
        trailer: 34000,
        minTotal: 70000,
        maxTotal: 80000
    }
};

// Variable para almacenar el modo actual
let currentMode = 'papera';

// Controles para saber qué campos fueron modificados manualmente
let trailerModifiedManually = false;
let totalModifiedManually = false;
let tractorTrailerModifiedManually = false;
let pupModifiedManually = false;

// Elementos del DOM - Botones de modo
const btnPapera = document.getElementById('btn-papera');
const btnHopper = document.getElementById('btn-hopper');
const btnRifers = document.getElementById('btn-rifers');

// Elementos del DOM - Secciones
const sectionPapera = document.getElementById('section-papera');
const sectionHopper = document.getElementById('section-hopper');
const sectionRifers = document.getElementById('section-rifers');

// Función para cambiar entre modos
function changeMode(newMode) {
    // Remover clase active de todos los botones
    btnPapera.classList.remove('active');
    btnHopper.classList.remove('active');
    btnRifers.classList.remove('active');

    // Ocultar todas las secciones
    sectionPapera.classList.remove('active');
    sectionHopper.classList.remove('active');
    sectionRifers.classList.remove('active');

    // Cambiar a nuevo modo
    switch (newMode) {
        case 'papera':
            btnPapera.classList.add('active');
            sectionPapera.classList.add('active');
            currentMode = 'papera';
            break;
        case 'hopper':
            btnHopper.classList.add('active');
            sectionHopper.classList.add('active');
            currentMode = 'hopper';
            break;
        case 'rifers':
            btnRifers.classList.add('active');
            sectionRifers.classList.add('active');
            currentMode = 'rifers';
            break;
    }

    // Cargar límites del nuevo modo
    loadLimitsFromStorage();
}

// Event listeners para los botones de modo
if (btnPapera) {
    btnPapera.addEventListener('click', () => changeMode('papera'));
}

if (btnHopper) {
    btnHopper.addEventListener('click', () => changeMode('hopper'));
}

if (btnRifers) {
    btnRifers.addEventListener('click', () => changeMode('rifers'));
}

// ====================
// LÓGICA DE PAPERA
// ====================

const paperaLimits = {
    frontAxle: document.getElementById('papera-max-front'),
    fifthWheel: document.getElementById('papera-max-fifth'),
    tractor: document.getElementById('papera-max-tractor'),
    trailer: document.getElementById('papera-max-trailer'),
    minTotal: document.getElementById('papera-min-total'),
    maxTotal: document.getElementById('papera-max-total')
};

const paperaCurrent = {
    frontAxle: document.getElementById('papera-current-front'),
    tractor: document.getElementById('papera-current-tractor'),
    fifthWheel: document.getElementById('papera-current-fifth'),
    trailer: document.getElementById('papera-current-trailer'),
    total: document.getElementById('papera-current-total')
};

const paperaInfo = {
    frontAxle: document.getElementById('papera-front-info'),
    tractor: document.getElementById('papera-tractor-info'),
    fifthWheel: document.getElementById('papera-fifth-info'),
    trailer: document.getElementById('papera-trailer-info'),
    total: document.getElementById('papera-total-info')
};

const paperaSaveCheckbox = document.getElementById('papera-save-limits');
const paperaBtnClear = document.getElementById('papera-btn-clear');
const paperaResultDisplay = document.getElementById('papera-result-display');
const paperaTotalWeight = document.getElementById('papera-total-weight');

function calculatePapera() {
    const limits = {
        frontAxle: parseInt(paperaLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(paperaLimits.fifthWheel.value) || 0,
        tractor: parseInt(paperaLimits.tractor.value) || 0,
        trailer: parseInt(paperaLimits.trailer.value) || 0,
        minTotal: parseInt(paperaLimits.minTotal.value) || 0,
        maxTotal: parseInt(paperaLimits.maxTotal.value) || 0
    };

    const values = {
        frontAxle: parseInt(paperaCurrent.frontAxle.value) || 0,
        tractor: parseInt(paperaCurrent.tractor.value) || 0,
        trailer: parseInt(paperaCurrent.trailer.value) || 0,
        total: parseInt(paperaCurrent.total.value) || 0
    };

    // Calcular quinta rueda
    values.fifthWheel = values.tractor - values.frontAxle;
    if (values.fifthWheel < 0) values.fifthWheel = 0;
    paperaCurrent.fifthWheel.value = values.fifthWheel || '';

    // Calcular trailer o total
    if (trailerModifiedManually) {
        values.total = values.tractor + values.trailer;
        paperaCurrent.total.value = values.total || '';
    } else if (totalModifiedManually) {
        values.trailer = values.total - values.tractor;
        if (values.trailer < 0) values.trailer = 0;
        paperaCurrent.trailer.value = values.trailer || '';
    } else if (values.total > 0) {
        values.trailer = values.total - values.tractor;
        if (values.trailer < 0) values.trailer = 0;
        paperaCurrent.trailer.value = values.trailer || '';
    }

    // Validar campos
    validateFieldPapera('frontAxle', values.frontAxle, limits.frontAxle, paperaCurrent.frontAxle, paperaInfo.frontAxle);
    validateFieldPapera('tractor', values.tractor, limits.tractor, paperaCurrent.tractor, paperaInfo.tractor);
    validateFieldPapera('fifthWheel', values.fifthWheel, limits.fifthWheel, paperaCurrent.fifthWheel, paperaInfo.fifthWheel);
    validateFieldPapera('trailer', values.trailer, limits.trailer, paperaCurrent.trailer, paperaInfo.trailer);
    validateFieldPapera('totalWeight', values.total, limits.maxTotal, paperaCurrent.total, paperaInfo.total, limits.minTotal);

    // Actualizar display
    updatePaperaDisplay(values.total);
}

function validateFieldPapera(fieldName, currentValue, maxLimit, inputElement, infoElement, minLimit = null) {
    inputElement.classList.remove('exceed-limit', 'within-limit');
    
    if (currentValue > maxLimit) {
        inputElement.classList.add('exceed-limit');
        infoElement.textContent = `¡Exceso de ${(currentValue - maxLimit).toLocaleString()} lbs!`;
        infoElement.className = 'info-label error';
    } else if (minLimit && currentValue < minLimit) {
        inputElement.classList.add('within-limit');
        infoElement.textContent = `Faltan ${(minLimit - currentValue).toLocaleString()} lbs para el mínimo`;
        infoElement.className = 'info-label warning';
    } else {
        inputElement.classList.add('within-limit');
        if (currentValue > 0) {
            const remaining = maxLimit - currentValue;
            infoElement.textContent = `Restan ${remaining.toLocaleString()} lbs para el máximo`;
        } else {
            infoElement.textContent = `Límite máximo: ${maxLimit.toLocaleString()} lbs`;
        }
        infoElement.className = 'info-label success';
    }
    
    if (fieldName === 'fifthWheel') {
        if (currentValue > 0) {
            inputElement.classList.add('calculated');
        } else {
            inputElement.classList.remove('calculated');
        }
    }
}

function updatePaperaDisplay(total) {
    const limits = {
        minTotal: parseInt(paperaLimits.minTotal.value) || 0,
        maxTotal: parseInt(paperaLimits.maxTotal.value) || 0
    };
    
    paperaTotalWeight.textContent = total.toLocaleString();
    
    if (!total) {
        paperaResultDisplay.className = 'result-display grange';
        return;
    }
    
    if (total < limits.minTotal) {
        paperaResultDisplay.className = 'result-display grange';
    } else if (total <= limits.maxTotal) {
        paperaResultDisplay.className = 'result-display inrange';
    } else {
        paperaResultDisplay.className = 'result-display exceeded';
    }
}

function clearPaperaValues() {
    paperaCurrent.frontAxle.value = '';
    paperaCurrent.tractor.value = '';
    paperaCurrent.fifthWheel.value = '';
    paperaCurrent.trailer.value = '';
    paperaCurrent.total.value = '';
    
    trailerModifiedManually = false;
    totalModifiedManually = false;
    
    calculatePapera();
}

function savePaperaLimits() {
    const limits = {
        frontAxle: parseInt(paperaLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(paperaLimits.fifthWheel.value) || 0,
        tractor: parseInt(paperaLimits.tractor.value) || 0,
        trailer: parseInt(paperaLimits.trailer.value) || 0,
        minTotal: parseInt(paperaLimits.minTotal.value) || 0,
        maxTotal: parseInt(paperaLimits.maxTotal.value) || 0
    };
    
    if (paperaSaveCheckbox.checked) {
        localStorage.setItem('trailerLimits_papera', JSON.stringify(limits));
    }
    
    calculatePapera();
}

// Event listeners Papera
Object.values(paperaLimits).forEach(input => {
    if (input) input.addEventListener('input', savePaperaLimits);
});

paperaSaveCheckbox.addEventListener('change', savePaperaLimits);

paperaCurrent.frontAxle.addEventListener('input', () => {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculatePapera();
});

paperaCurrent.tractor.addEventListener('input', () => {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculatePapera();
});

paperaCurrent.total.addEventListener('input', () => {
    totalModifiedManually = true;
    trailerModifiedManually = false;
    calculatePapera();
});

paperaCurrent.trailer.addEventListener('input', () => {
    trailerModifiedManually = true;
    totalModifiedManually = false;
    calculatePapera();
});

paperaBtnClear.addEventListener('click', clearPaperaValues);

// Navegación con Enter - Papera
const paperaInputs = [
    paperaCurrent.frontAxle,
    paperaCurrent.tractor,
    paperaCurrent.total,
    paperaCurrent.trailer
];

paperaInputs.forEach((input, index) => {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index < paperaInputs.length - 1) {
                paperaInputs[index + 1].focus();
            } else {
                paperaInputs[0].focus();
            }
        }
    });
});

// ====================
// LÓGICA DE HOPPER
// ====================

const hopperLimits = {
    frontAxle: document.getElementById('hopper-max-front'),
    fifthWheel: document.getElementById('hopper-max-fifth'),
    tractor: document.getElementById('hopper-max-tractor'),
    trailer: document.getElementById('hopper-max-trailer'),
    tractorTrailer: document.getElementById('hopper-max-tractor-trailer'),
    pup: document.getElementById('hopper-max-pup'),
    minTotal: document.getElementById('hopper-min-total'),
    maxTotal: document.getElementById('hopper-max-total')
};

const hopperCurrent = {
    frontAxle: document.getElementById('hopper-current-front'),
    tractor: document.getElementById('hopper-current-tractor'),
    fifthWheel: document.getElementById('hopper-current-fifth'),
    tractorTrailer: document.getElementById('hopper-current-tractor-trailer'),
    trailer: document.getElementById('hopper-current-trailer'),
    total: document.getElementById('hopper-current-total'),
    pup: document.getElementById('hopper-current-pup')
};

const hopperInfo = {
    frontAxle: document.getElementById('hopper-front-info'),
    tractor: document.getElementById('hopper-tractor-info'),
    fifthWheel: document.getElementById('hopper-fifth-info'),
    tractorTrailer: document.getElementById('hopper-tractor-trailer-info'),
    trailer: document.getElementById('hopper-trailer-info'),
    total: document.getElementById('hopper-total-info'),
    pup: document.getElementById('hopper-pup-info')
};

const hopperSaveCheckbox = document.getElementById('hopper-save-limits');
const hopperBtnClear = document.getElementById('hopper-btn-clear');
const hopperResultDisplay = document.getElementById('hopper-result-display');
const hopperTotalWeight = document.getElementById('hopper-total-weight');

function calculateHopper() {
    const limits = {
        frontAxle: parseInt(hopperLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(hopperLimits.fifthWheel.value) || 0,
        tractor: parseInt(hopperLimits.tractor.value) || 0,
        trailer: parseInt(hopperLimits.trailer.value) || 0,
        tractorTrailer: parseInt(hopperLimits.tractorTrailer.value) || 0,
        pup: parseInt(hopperLimits.pup.value) || 0,
        minTotal: parseInt(hopperLimits.minTotal.value) || 0,
        maxTotal: parseInt(hopperLimits.maxTotal.value) || 0
    };

    const values = {
        frontAxle: parseInt(hopperCurrent.frontAxle.value) || 0,
        tractor: parseInt(hopperCurrent.tractor.value) || 0,
        tractorTrailer: parseInt(hopperCurrent.tractorTrailer.value) || 0,
        trailer: 0,
        total: parseInt(hopperCurrent.total.value) || 0,
        pup: parseInt(hopperCurrent.pup.value) || 0
    };

    // Calcular quinta rueda (igual que Papera)
    values.fifthWheel = values.tractor - values.frontAxle;
    if (values.fifthWheel < 0) values.fifthWheel = 0;
    hopperCurrent.fifthWheel.value = values.fifthWheel || '';

    // Lógica de cálculo Hopper
    // Determinar qué campo fue modificado y calcular los demás
    
    let calculatedTrailer = 0;
    let calculatedTractorTrailer = 0;
    let calculatedPup = 0;
    let calculatedTotal = 0;

    if (tractorTrailerModifiedManually) {
        // Se modificó Tractor+Trailer → calcular Trailer
        calculatedTrailer = values.tractorTrailer - values.tractor;
        values.trailer = calculatedTrailer;
        hopperCurrent.trailer.value = values.trailer || '';
        
        // Calcular Pup y Total si hay valores
        if (values.total > 0) {
            values.pup = values.total - values.tractorTrailer;
            if (values.pup < 0) values.pup = 0;
            hopperCurrent.pup.value = values.pup || '';
        } else if (values.pup > 0) {
            calculatedTotal = values.tractorTrailer + values.pup;
            values.total = calculatedTotal;
            hopperCurrent.total.value = values.total || '';
        }
    } else if (trailerModifiedManually) {
        // Se modificó Trailer → calcular Tractor+Trailer
        calculatedTractorTrailer = values.trailer + values.tractor;
        values.tractorTrailer = calculatedTractorTrailer;
        hopperCurrent.tractorTrailer.value = values.tractorTrailer || '';
        
        // Calcular Total o Pup
        if (values.total > 0) {
            values.pup = values.total - values.tractorTrailer;
            if (values.pup < 0) values.pup = 0;
            hopperCurrent.pup.value = values.pup || '';
        } else if (values.pup > 0) {
            calculatedTotal = values.tractorTrailer + values.pup;
            values.total = calculatedTotal;
            hopperCurrent.total.value = values.total || '';
        }
    } else if (pupModifiedManually) {
        // Se modificó Pup → calcular Total
        if (values.tractorTrailer > 0) {
            calculatedTotal = values.tractorTrailer + values.pup;
            values.total = calculatedTotal;
            hopperCurrent.total.value = values.total || '';
            
            // También calculamos trailer
            values.trailer = values.tractorTrailer - values.tractor;
            if (values.trailer < 0) values.trailer = 0;
            hopperCurrent.trailer.value = values.trailer || '';
        } else if (values.total > 0) {
            // Calcular Tractor+Trailer desde Total y Pup
            values.tractorTrailer = values.total - values.pup;
            hopperCurrent.tractorTrailer.value = values.tractorTrailer || '';
            
            values.trailer = values.tractorTrailer - values.tractor;
            if (values.trailer < 0) values.trailer = 0;
            hopperCurrent.trailer.value = values.trailer || '';
        }
    } else if (totalModifiedManually) {
        // Se modificó Peso total → calcular Pup
        if (values.tractorTrailer > 0) {
            values.pup = values.total - values.tractorTrailer;
            if (values.pup < 0) values.pup = 0;
            hopperCurrent.pup.value = values.pup || '';
            
            values.trailer = values.tractorTrailer - values.tractor;
            if (values.trailer < 0) values.trailer = 0;
            hopperCurrent.trailer.value = values.trailer || '';
        } else if (values.pup > 0) {
            values.tractorTrailer = values.total - values.pup;
            hopperCurrent.tractorTrailer.value = values.tractorTrailer || '';
            
            values.trailer = values.tractorTrailer - values.tractor;
            if (values.trailer < 0) values.trailer = 0;
            hopperCurrent.trailer.value = values.trailer || '';
        }
    } else {
        // Ninguno modificado, intentar calcular defaults
        if (values.tractorTrailer > 0) {
            values.trailer = values.tractorTrailer - values.tractor;
            if (values.trailer < 0) values.trailer = 0;
            hopperCurrent.trailer.value = values.trailer || '';
            
            if (values.total > 0) {
                values.pup = values.total - values.tractorTrailer;
                if (values.pup < 0) values.pup = 0;
                hopperCurrent.pup.value = values.pup || '';
            }
        } else if (values.total > 0) {
            if (values.pup > 0) {
                values.tractorTrailer = values.total - values.pup;
                hopperCurrent.tractorTrailer.value = values.tractorTrailer || '';
                
                values.trailer = values.tractorTrailer - values.tractor;
                if (values.trailer < 0) values.trailer = 0;
                hopperCurrent.trailer.value = values.trailer || '';
            } else {
                // Default: treat total as tractor+trailer+pup (0)
                values.tractorTrailer = values.total;
                hopperCurrent.tractorTrailer.value = values.tractorTrailer || '';
                
                values.trailer = values.tractorTrailer - values.tractor;
                if (values.trailer < 0) values.trailer = 0;
                hopperCurrent.trailer.value = values.trailer || '';
            }
        }
    }

    // Validar campos
    validateFieldHopper('frontAxle', values.frontAxle, limits.frontAxle, hopperCurrent.frontAxle, hopperInfo.frontAxle);
    validateFieldHopper('tractor', values.tractor, limits.tractor, hopperCurrent.tractor, hopperInfo.tractor);
    validateFieldHopper('fifthWheel', values.fifthWheel, limits.fifthWheel, hopperCurrent.fifthWheel, hopperInfo.fifthWheel);
    validateFieldHopper('tractorTrailer', values.tractorTrailer, limits.tractorTrailer, hopperCurrent.tractorTrailer, hopperInfo.tractorTrailer);
    validateFieldHopper('trailer', values.trailer, limits.trailer, hopperCurrent.trailer, hopperInfo.trailer);
    validateFieldHopper('pup', values.pup, limits.pup, hopperCurrent.pup, hopperInfo.pup);
    validateFieldHopper('totalWeight', values.total, limits.maxTotal, hopperCurrent.total, hopperInfo.total, limits.minTotal);

    // Actualizar display
    updateHopperDisplay(values.total);
}

function validateFieldHopper(fieldName, currentValue, maxLimit, inputElement, infoElement, minLimit = null) {
    inputElement.classList.remove('exceed-limit', 'within-limit');
    
    if (currentValue > maxLimit) {
        inputElement.classList.add('exceed-limit');
        infoElement.textContent = `¡Exceso de ${(currentValue - maxLimit).toLocaleString()} lbs!`;
        infoElement.className = 'info-label error';
    } else if (minLimit && currentValue < minLimit) {
        inputElement.classList.add('within-limit');
        infoElement.textContent = `Faltan ${(minLimit - currentValue).toLocaleString()} lbs para el mínimo`;
        infoElement.className = 'info-label warning';
    } else {
        inputElement.classList.add('within-limit');
        if (currentValue > 0) {
            const remaining = maxLimit - currentValue;
            infoElement.textContent = `Restan ${remaining.toLocaleString()} lbs para el máximo`;
        } else {
            infoElement.textContent = `Límite máximo: ${maxLimit.toLocaleString()} lbs`;
        }
        infoElement.className = 'info-label success';
    }
    
    if (fieldName === 'fifthWheel' || fieldName === 'trailer') {
        if (currentValue > 0) {
            inputElement.classList.add('calculated');
        } else {
            inputElement.classList.remove('calculated');
        }
    }
}

function updateHopperDisplay(total) {
    const limits = {
        minTotal: parseInt(hopperLimits.minTotal.value) || 0,
        maxTotal: parseInt(hopperLimits.maxTotal.value) || 0
    };
    
    hopperTotalWeight.textContent = total.toLocaleString();
    
    if (!total) {
        hopperResultDisplay.className = 'result-display grange';
        return;
    }
    
    if (total < limits.minTotal) {
        hopperResultDisplay.className = 'result-display grange';
    } else if (total <= limits.maxTotal) {
        hopperResultDisplay.className = 'result-display inrange';
    } else {
        hopperResultDisplay.className = 'result-display exceeded';
    }
}

function clearHopperValues() {
    hopperCurrent.frontAxle.value = '';
    hopperCurrent.tractor.value = '';
    hopperCurrent.fifthWheel.value = '';
    hopperCurrent.tractorTrailer.value = '';
    hopperCurrent.trailer.value = '';
    hopperCurrent.total.value = '';
    hopperCurrent.pup.value = '';
    
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = false;
    totalModifiedManually = false;
    pupModifiedManually = false;
    
    calculateHopper();
}

function saveHopperLimits() {
    const limits = {
        frontAxle: parseInt(hopperLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(hopperLimits.fifthWheel.value) || 0,
        tractor: parseInt(hopperLimits.tractor.value) || 0,
        trailer: parseInt(hopperLimits.trailer.value) || 0,
        tractorTrailer: parseInt(hopperLimits.tractorTrailer.value) || 0,
        pup: parseInt(hopperLimits.pup.value) || 0,
        minTotal: parseInt(hopperLimits.minTotal.value) || 0,
        maxTotal: parseInt(hopperLimits.maxTotal.value) || 0
    };
    
    if (hopperSaveCheckbox.checked) {
        localStorage.setItem('trailerLimits_hopper', JSON.stringify(limits));
    }
    
    calculateHopper();
}

// Event listeners Hopper
Object.values(hopperLimits).forEach(input => {
    if (input) input.addEventListener('input', saveHopperLimits);
});

hopperSaveCheckbox.addEventListener('change', saveHopperLimits);

hopperCurrent.frontAxle.addEventListener('input', () => {
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = false;
    totalModifiedManually = false;
    pupModifiedManually = false;
    calculateHopper();
});

hopperCurrent.tractor.addEventListener('input', () => {
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = false;
    totalModifiedManually = false;
    pupModifiedManually = false;
    calculateHopper();
});

hopperCurrent.tractorTrailer.addEventListener('input', () => {
    tractorTrailerModifiedManually = true;
    trailerModifiedManually = false;
    totalModifiedManually = false;
    pupModifiedManually = false;
    calculateHopper();
});

hopperCurrent.trailer.addEventListener('input', () => {
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = true;
    totalModifiedManually = false;
    pupModifiedManually = false;
    calculateHopper();
});

hopperCurrent.total.addEventListener('input', () => {
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = false;
    totalModifiedManually = true;
    pupModifiedManually = false;
    calculateHopper();
});

hopperCurrent.pup.addEventListener('input', () => {
    tractorTrailerModifiedManually = false;
    trailerModifiedManually = false;
    totalModifiedManually = false;
    pupModifiedManually = true;
    calculateHopper();
});

hopperBtnClear.addEventListener('click', clearHopperValues);

// Navegación con Enter - Hopper
const hopperInputs = [
    hopperCurrent.frontAxle,
    hopperCurrent.tractor,
    hopperCurrent.tractorTrailer,
    hopperCurrent.total,
    hopperCurrent.pup
];

hopperInputs.forEach((input, index) => {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index < hopperInputs.length - 1) {
                hopperInputs[index + 1].focus();
            } else {
                hopperInputs[0].focus();
            }
        }
    });
});

// ====================
// LÓGICA DE RIFERS
// ====================

const rifersLimits = {
    frontAxle: document.getElementById('rifers-max-front'),
    fifthWheel: document.getElementById('rifers-max-fifth'),
    tractor: document.getElementById('rifers-max-tractor'),
    trailer: document.getElementById('rifers-max-trailer'),
    minTotal: document.getElementById('rifers-min-total'),
    maxTotal: document.getElementById('rifers-max-total')
};

const rifersCurrent = {
    frontAxle: document.getElementById('rifers-current-front'),
    tractor: document.getElementById('rifers-current-tractor'),
    fifthWheel: document.getElementById('rifers-current-fifth'),
    trailer: document.getElementById('rifers-current-trailer'),
    total: document.getElementById('rifers-current-total')
};

const rifersInfo = {
    frontAxle: document.getElementById('rifers-front-info'),
    tractor: document.getElementById('rifers-tractor-info'),
    fifthWheel: document.getElementById('rifers-fifth-info'),
    trailer: document.getElementById('rifers-trailer-info'),
    total: document.getElementById('rifers-total-info')
};

const rifersSaveCheckbox = document.getElementById('rifers-save-limits');
const rifersBtnClear = document.getElementById('rifers-btn-clear');
const rifersResultDisplay = document.getElementById('rifers-result-display');
const rifersTotalWeight = document.getElementById('rifers-total-weight');

function calculateRifers() {
    const limits = {
        frontAxle: parseInt(rifersLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(rifersLimits.fifthWheel.value) || 0,
        tractor: parseInt(rifersLimits.tractor.value) || 0,
        trailer: parseInt(rifersLimits.trailer.value) || 0,
        minTotal: parseInt(rifersLimits.minTotal.value) || 0,
        maxTotal: parseInt(rifersLimits.maxTotal.value) || 0
    };

    const values = {
        frontAxle: parseInt(rifersCurrent.frontAxle.value) || 0,
        tractor: parseInt(rifersCurrent.tractor.value) || 0,
        trailer: parseInt(rifersCurrent.trailer.value) || 0,
        total: parseInt(rifersCurrent.total.value) || 0
    };

    values.fifthWheel = values.tractor - values.frontAxle;
    if (values.fifthWheel < 0) values.fifthWheel = 0;
    rifersCurrent.fifthWheel.value = values.fifthWheel || '';

    if (trailerModifiedManually) {
        values.total = values.tractor + values.trailer;
        rifersCurrent.total.value = values.total || '';
    } else if (totalModifiedManually) {
        values.trailer = values.total - values.tractor;
        if (values.trailer < 0) values.trailer = 0;
        rifersCurrent.trailer.value = values.trailer || '';
    } else if (values.total > 0) {
        values.trailer = values.total - values.tractor;
        if (values.trailer < 0) values.trailer = 0;
        rifersCurrent.trailer.value = values.trailer || '';
    }

    validateFieldRifers('frontAxle', values.frontAxle, limits.frontAxle, rifersCurrent.frontAxle, rifersInfo.frontAxle);
    validateFieldRifers('tractor', values.tractor, limits.tractor, rifersCurrent.tractor, rifersInfo.tractor);
    validateFieldRifers('fifthWheel', values.fifthWheel, limits.fifthWheel, rifersCurrent.fifthWheel, rifersInfo.fifthWheel);
    validateFieldRifers('trailer', values.trailer, limits.trailer, rifersCurrent.trailer, rifersInfo.trailer);
    validateFieldRifers('totalWeight', values.total, limits.maxTotal, rifersCurrent.total, rifersInfo.total, limits.minTotal);

    updateRifersDisplay(values.total);
}

function validateFieldRifers(fieldName, currentValue, maxLimit, inputElement, infoElement, minLimit = null) {
    inputElement.classList.remove('exceed-limit', 'within-limit');
    
    if (currentValue > maxLimit) {
        inputElement.classList.add('exceed-limit');
        infoElement.textContent = `¡Exceso de ${(currentValue - maxLimit).toLocaleString()} lbs!`;
        infoElement.className = 'info-label error';
    } else if (minLimit && currentValue < minLimit) {
        inputElement.classList.add('within-limit');
        infoElement.textContent = `Faltan ${(minLimit - currentValue).toLocaleString()} lbs para el mínimo`;
        infoElement.className = 'info-label warning';
    } else {
        inputElement.classList.add('within-limit');
        if (currentValue > 0) {
            const remaining = maxLimit - currentValue;
            infoElement.textContent = `Restan ${remaining.toLocaleString()} lbs para el máximo`;
        } else {
            infoElement.textContent = `Límite máximo: ${maxLimit.toLocaleString()} lbs`;
        }
        infoElement.className = 'info-label success';
    }
    
    if (fieldName === 'fifthWheel') {
        if (currentValue > 0) {
            inputElement.classList.add('calculated');
        } else {
            inputElement.classList.remove('calculated');
        }
    }
}

function updateRifersDisplay(total) {
    const limits = {
        minTotal: parseInt(rifersLimits.minTotal.value) || 0,
        maxTotal: parseInt(rifersLimits.maxTotal.value) || 0
    };
    
    rifersTotalWeight.textContent = total.toLocaleString();
    
    if (!total) {
        rifersResultDisplay.className = 'result-display grange';
        return;
    }
    
    if (total < limits.minTotal) {
        rifersResultDisplay.className = 'result-display grange';
    } else if (total <= limits.maxTotal) {
        rifersResultDisplay.className = 'result-display inrange';
    } else {
        rifersResultDisplay.className = 'result-display exceeded';
    }
}

function clearRifersValues() {
    rifersCurrent.frontAxle.value = '';
    rifersCurrent.tractor.value = '';
    rifersCurrent.fifthWheel.value = '';
    rifersCurrent.trailer.value = '';
    rifersCurrent.total.value = '';
    
    trailerModifiedManually = false;
    totalModifiedManually = false;
    
    calculateRifers();
}

function saveRifersLimits() {
    const limits = {
        frontAxle: parseInt(rifersLimits.frontAxle.value) || 0,
        fifthWheel: parseInt(rifersLimits.fifthWheel.value) || 0,
        tractor: parseInt(rifersLimits.tractor.value) || 0,
        trailer: parseInt(rifersLimits.trailer.value) || 0,
        minTotal: parseInt(rifersLimits.minTotal.value) || 0,
        maxTotal: parseInt(rifersLimits.maxTotal.value) || 0
    };
    
    if (rifersSaveCheckbox.checked) {
        localStorage.setItem('trailerLimits_rifers', JSON.stringify(limits));
    }
    
    calculateRifers();
}

Object.values(rifersLimits).forEach(input => {
    if (input) input.addEventListener('input', saveRifersLimits);
});

rifersSaveCheckbox.addEventListener('change', saveRifersLimits);

rifersCurrent.frontAxle.addEventListener('input', () => {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculateRifers();
});

rifersCurrent.tractor.addEventListener('input', () => {
    trailerModifiedManually = false;
    totalModifiedManually = false;
    calculateRifers();
});

rifersCurrent.total.addEventListener('input', () => {
    totalModifiedManually = true;
    trailerModifiedManually = false;
    calculateRifers();
});

rifersCurrent.trailer.addEventListener('input', () => {
    trailerModifiedManually = true;
    totalModifiedManually = false;
    calculateRifers();
});

rifersBtnClear.addEventListener('click', clearRifersValues);

const rifersInputs = [
    rifersCurrent.frontAxle,
    rifersCurrent.tractor,
    rifersCurrent.total,
    rifersCurrent.trailer
];

rifersInputs.forEach((input, index) => {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index < rifersInputs.length - 1) {
                rifersInputs[index + 1].focus();
            } else {
                rifersInputs[0].focus();
            }
        }
    });
});

// ====================
// CARGAR LÍMITES DESDE STORAGE
// ====================

function loadLimitsFromStorage() {
    const modeLimitsKey = `trailerLimits_${currentMode}`;
    const savedLimits = localStorage.getItem(modeLimitsKey);

    if (savedLimits) {
        const limits = JSON.parse(savedLimits);
        
        if (currentMode === 'papera') {
            paperaLimits.frontAxle.value = limits.frontAxle || 0;
            paperaLimits.fifthWheel.value = limits.fifthWheel || 0;
            paperaLimits.tractor.value = limits.tractor || 0;
            paperaLimits.trailer.value = limits.trailer || 0;
            paperaLimits.minTotal.value = limits.minTotal || 0;
            paperaLimits.maxTotal.value = limits.maxTotal || 0;
            calculatePapera();
        } else if (currentMode === 'hopper') {
            hopperLimits.frontAxle.value = limits.frontAxle || 0;
            hopperLimits.fifthWheel.value = limits.fifthWheel || 0;
            hopperLimits.tractor.value = limits.tractor || 0;
            hopperLimits.trailer.value = limits.trailer || 0;
            hopperLimits.tractorTrailer.value = limits.tractorTrailer || 0;
            hopperLimits.pup.value = limits.pup || 0;
            hopperLimits.minTotal.value = limits.minTotal || 0;
            hopperLimits.maxTotal.value = limits.maxTotal || 0;
            calculateHopper();
        } else if (currentMode === 'rifers') {
            rifersLimits.frontAxle.value = limits.frontAxle || 0;
            rifersLimits.fifthWheel.value = limits.fifthWheel || 0;
            rifersLimits.tractor.value = limits.tractor || 0;
            rifersLimits.trailer.value = limits.trailer || 0;
            rifersLimits.minTotal.value = limits.minTotal || 0;
            rifersLimits.maxTotal.value = limits.maxTotal || 0;
            calculateRifers();
        }
    } else {
        // Usar valores por defecto
        const defaults = defaultLimitsByMode[currentMode];
        
        if (currentMode === 'papera') {
            paperaLimits.frontAxle.value = defaults.frontAxle;
            paperaLimits.fifthWheel.value = defaults.fifthWheel;
            paperaLimits.tractor.value = defaults.tractor;
            paperaLimits.trailer.value = defaults.trailer;
            paperaLimits.minTotal.value = defaults.minTotal;
            paperaLimits.maxTotal.value = defaults.maxTotal;
            
            if (paperaSaveCheckbox.checked) {
                localStorage.setItem(modeLimitsKey, JSON.stringify(defaults));
            }
            calculatePapera();
        } else if (currentMode === 'hopper') {
            hopperLimits.frontAxle.value = defaults.frontAxle;
            hopperLimits.fifthWheel.value = defaults.fifthWheel;
            hopperLimits.tractor.value = defaults.tractor;
            hopperLimits.trailer.value = defaults.trailer;
            hopperLimits.tractorTrailer.value = defaults.tractorTrailer;
            hopperLimits.pup.value = defaults.pup;
            hopperLimits.minTotal.value = defaults.minTotal;
            hopperLimits.maxTotal.value = defaults.maxTotal;
            
            if (hopperSaveCheckbox.checked) {
                localStorage.setItem(modeLimitsKey, JSON.stringify(defaults));
            }
            calculateHopper();
        } else if (currentMode === 'rifers') {
            rifersLimits.frontAxle.value = defaults.frontAxle;
            rifersLimits.fifthWheel.value = defaults.fifthWheel;
            rifersLimits.tractor.value = defaults.tractor;
            rifersLimits.trailer.value = defaults.trailer;
            rifersLimits.minTotal.value = defaults.minTotal;
            rifersLimits.maxTotal.value = defaults.maxTotal;
            
            if (rifersSaveCheckbox.checked) {
                localStorage.setItem(modeLimitsKey, JSON.stringify(defaults));
            }
            calculateRifers();
        }
    }
}

// ====================
// INICIALIZACIÓN
// ====================

document.addEventListener('DOMContentLoaded', () => {
    // Asegurar que solo la sección Papera esté activa al inicio
    sectionPapera.classList.add('active');
    sectionHopper.classList.remove('active');
    sectionRifers.classList.remove('active');
    
    loadLimitsFromStorage();
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
