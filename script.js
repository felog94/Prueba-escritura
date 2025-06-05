// --- Referencias a elementos del DOM ---
const quoteDisplay = document.getElementById('quote-display');
const quoteInput = document.getElementById('quote-input');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const errorsDisplay = document.getElementById('errors');
const messageDisplay = document.getElementById('message');

// --- Variables del juego ---
let timer; // Para el temporizador (setInterval)
let timeLeft = 0; // Tiempo en segundos (incrementa)
let errors = 0; // Conteo de errores
let currentQuote = ''; // El texto que se debe escribir
let isTestActive = false; // Indica si el test está 'listo para empezar'
let isTestStarted = false; // Indica si el test ya ha empezado (temporizador corriendo)

// Lista de citas/textos para la prueba
const quotes = [
    "La única forma de hacer un gran trabajo es amar lo que haces.",
    "El éxito no es definitivo, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
    "La imaginación es más importante que el conocimiento.",
    "Sé el cambio que quieres ver en el mundo.",
    "No te preocupes por los fracasos, preocúpate por las oportunidades que pierdes cuando ni siquiera lo intentas.",
    "La vida es lo que pasa mientras estás ocupado haciendo otros planes.",
    "Lo importante no es lo que tienes, sino lo que haces con lo que tienes.",
    "El único límite a nuestra realización de mañana serán nuestras dudas de hoy.",
    "Nunca es demasiado tarde para ser lo que podrías haber sido.",
    "La felicidad no es algo ya hecho. Viene de tus propias acciones."
];

// --- Funciones del juego ---

// Obtener una cita aleatoria y mostrarla
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = ''; // Limpiar cualquier contenido anterior

    // Dividir la cita en caracteres y envolver cada uno en un span
    currentQuote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        quoteDisplay.appendChild(charSpan);
    });

    // Marcar el primer carácter como "current" si hay caracteres
    if (quoteDisplay.children.length > 0) {
        quoteDisplay.children[0].classList.add('current');
    }
}

// Iniciar el temporizador
function startTimer() {
    timeLeft = 0; // Reiniciar tiempo
    timerDisplay.textContent = '0s';
    timer = setInterval(() => {
        timeLeft++;
        timerDisplay.textContent = `${timeLeft}s`;
    }, 1000); // Cada segundo
}

// Detener el temporizador
function stopTimer() {
    clearInterval(timer);
}

// Calcular WPM (Palabras Por Minuto)
// Se calcula como (caracteres correctos / 5) / (tiempo en minutos)
function calculateWPM() {
    const minutes = timeLeft / 60;
    if (minutes === 0) return 0;
    
    // Contar solo caracteres correctos visibles (sin contar el 'current' si no se ha tecleado)
    const correctCharacters = quoteDisplay.querySelectorAll('.correct').length;
    const wpm = Math.round((correctCharacters / 5) / minutes);
    return wpm;
}

// Manejar la entrada del usuario
function handleTyping(event) {
    // Si la prueba está activa (lista para empezar) y es la primera letra
    if (isTestActive && !isTestStarted && quoteInput.value.length === 1) {
        startTimer();
        isTestStarted = true; // Marca que el temporizador ha comenzado
    }

    // Si la prueba no está activa (ej. input deshabilitado) o no ha comenzado, no hacer nada más
    if (!isTestActive || !isTestStarted) return; 

    const typedText = quoteInput.value;
    const quoteCharacters = quoteDisplay.querySelectorAll('span');
    let currentErrors = 0;

    // Iterar sobre todos los caracteres de la cita original
    quoteCharacters.forEach((charSpan, index) => {
        const charInQuote = charSpan.textContent;
        const charTyped = typedText[index];

        // Resetear clases para cada iteración
        charSpan.classList.remove('correct', 'incorrect', 'current');

        if (charTyped == null) { // Carácter aún no tecleado (o se borró texto)
            if (index === typedText.length) { // Es el siguiente carácter a teclear
                charSpan.classList.add('current');
            }
        } else if (charTyped === charInQuote) { // Carácter correcto
            charSpan.classList.add('correct');
        } else { // Carácter incorrecto
            charSpan.classList.add('incorrect');
            currentErrors++;
        }
    });

    errors = currentErrors; // Actualizar el conteo global de errores
    errorsDisplay.textContent = errors; // Mostrar errores

    // Actualizar WPM en tiempo real
    wpmDisplay.textContent = calculateWPM();

    // Comprobar si la prueba ha terminado
    if (typedText.length === currentQuote.length) {
        endTest();
    }
}

// Iniciar la prueba (preparación)
function startTest() {
    if (isTestActive) return; // Si ya está activa, no hacer nada (previene doble clic)

    isTestActive = true; // Marca que la prueba está lista para que el usuario escriba
    isTestStarted = false; // Asegura que el temporizador no ha empezado todavía

    startButton.disabled = true; // Deshabilitar botón de inicio
    resetButton.disabled = false; // Habilitar botón de reinicio
    quoteInput.disabled = false; // Habilitar textarea
    quoteInput.value = ''; // Limpiar entrada
    quoteInput.focus(); // Poner el foco en el textarea

    errors = 0;
    errorsDisplay.textContent = errors;
    wpmDisplay.textContent = '0';
    timerDisplay.textContent = '0s'; // Reiniciar visualmente el temporizador
    messageDisplay.textContent = '¡Escribe el texto de arriba para empezar!';
    messageDisplay.classList.remove('error', 'success');

    getRandomQuote(); // Cargar nueva cita
    stopTimer(); // Asegurarse de que no hay temporizador corriendo de una prueba anterior
}

// Terminar la prueba
function endTest() {
    stopTimer();
    isTestActive = false; // Ya no está activa
    isTestStarted = false; // El temporizador se detuvo

    quoteInput.disabled = true; // Deshabilitar textarea
    startButton.disabled = false; // Habilitar botón de inicio de nuevo

    const finalWPM = calculateWPM();
    const finalErrors = errors;

    wpmDisplay.textContent = finalWPM;
    errorsDisplay.textContent = finalErrors;

    let finalMessage = `¡Prueba terminada! Tu WPM es: ${finalWPM}, Errores: ${finalErrors}.`;
    if (finalErrors === 0 && finalWPM > 0) {
        messageDisplay.textContent = `${finalMessage} ¡Excelente precisión!`;
        messageDisplay.classList.add('success');
    } else if (finalErrors > 0) {
        messageDisplay.textContent = `${finalMessage} ¡Intenta mejorar tu precisión!`;
        messageDisplay.classList.add('error');
    } else {
        messageDisplay.textContent = `${finalMessage} ¡Intenta de nuevo!`;
    }
}

// Reiniciar la prueba
function resetTest() {
    stopTimer();
    isTestActive = false;
    isTestStarted = false;

    startButton.disabled = false;
    resetButton.disabled = false;
    quoteInput.disabled = true; // Deshabilitar textarea
    quoteInput.value = '';
    
    // Limpiar displays
    timerDisplay.textContent = '0s';
    wpmDisplay.textContent = '0';
    errorsDisplay.textContent = '0';
    messageDisplay.textContent = 'Presiona "Iniciar Prueba" para comenzar.';
    messageDisplay.classList.remove('error', 'success');

    // Limpiar y cargar nueva cita
    quoteDisplay.innerHTML = ''; 
    getRandomQuote(); 

    // Asegurar que el primer carácter esté marcado si hay una cita.
    if (quoteDisplay.children.length > 0) {
        quoteDisplay.children[0].classList.add('current');
    }
}


// --- Event Listeners ---
startButton.addEventListener('click', startTest);
resetButton.addEventListener('click', resetTest);
quoteInput.addEventListener('input', handleTyping); // Cada vez que el usuario escribe

// --- Inicialización al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    resetTest(); // Asegura un estado inicial limpio y carga la primera cita
});