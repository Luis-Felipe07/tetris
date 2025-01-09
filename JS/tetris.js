class Tetris {
    constructor() {
        this.tablero = Array(15).fill().map(() => Array(8).fill(0));
        this.movimientos = 0;
        this.puntaje = 0;
        this.nivel = 1;
        this.intervaloJuego = null;
        this.piezaActual = null;

        this.piezas = {
            'I': [[1, 1, 1, 1]],
            'O': [[1, 1], [1, 1]],
            'T': [[0, 1, 0], [1, 1, 1]],
            'S': [[0, 1, 1], [1, 1, 0]],
            'Z': [[1, 1, 0], [0, 1, 1]],
            'J': [[1, 0, 0], [1, 1, 1]],
            'L': [[0, 0, 1], [1, 1, 1]]
        };

        this.colores = {
            'I': 'pieza-I',
            'O': 'pieza-O',
            'T': 'pieza-T',
            'S': 'pieza-S',
            'Z': 'pieza-Z',
            'J': 'pieza-J',
            'L': 'pieza-L'
        };

        this.iniciar();
    }

    iniciar() {
        this.crearTablero();
        this.vincularControles();
        this.generarPieza();
        this.comenzarJuego();
        this.actualizarPuntaje();
        this.actualizarNivel();
        this.configurarBotonReinicio();
    }

    crearTablero() {
        const tablero = document.getElementById('tablero-juego');
        tablero.innerHTML = '';
        for (let fila = 0; fila < 15; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                const celda = document.createElement('div');
                celda.className = 'celda';
                celda.id = `celda-${fila}-${columna}`;
                tablero.appendChild(celda);
            }
        }
    }

    vincularControles() {
        // Controles de teclado
        document.addEventListener('keydown', (evento) => {
            switch (evento.key) {
                case 'ArrowLeft':
                    this.moverPieza(-1);
                    break;
                case 'ArrowRight':
                    this.moverPieza(1);
                    break;
                case 'ArrowDown':
                    this.moverAbajo();
                    break;
                case 'ArrowUp':
                    this.rotarPieza();
                    break;
            }
        });

        // Controles táctiles por botones
        document.getElementById('btn-izquierda').addEventListener('click', () => {
            this.moverPieza(-1);
        });
        document.getElementById('btn-derecha').addEventListener('click', () => {
            this.moverPieza(1);
        });
        document.getElementById('btn-abajo').addEventListener('click', () => {
            this.moverAbajo();
        });
        document.getElementById('btn-rotar').addEventListener('click', () => {
            this.rotarPieza();
        });

        // Gestos táctiles
        let inicioX = 0, inicioY = 0;
        const tablero = document.getElementById('tablero-juego');

        tablero.addEventListener('touchstart', (evento) => {
            const toque = evento.touches[0];
            inicioX = toque.clientX;
            inicioY = toque.clientY;
        });

        tablero.addEventListener('touchend', (evento) => {
            const toque = evento.changedTouches[0];
            const diferenciaX = toque.clientX - inicioX;
            const diferenciaY = toque.clientY - inicioY;

            if (Math.abs(diferenciaX) > Math.abs(diferenciaY)) {
                if (diferenciaX > 0) {
                    this.moverPieza(1); // Deslizar a la derecha
                } else {
                    this.moverPieza(-1); // Deslizar a la izquierda
                }
            } else {
                if (diferenciaY > 0) {
                    this.moverAbajo(); // Deslizar hacia abajo
                } else {
                    this.rotarPieza(); // Deslizar hacia arriba
                }
            }
        });

        // Prevenir comportamientos predeterminados (como desplazamiento en móviles)
        tablero.addEventListener('touchmove', (evento) => {
            evento.preventDefault();
        }, { passive: false });
    }

    configurarBotonReinicio() {
        const botonReinicio = document.getElementById('boton-reiniciar');
        botonReinicio.addEventListener('click', () => {
            this.finJuego();
        });
    }

    actualizarPuntaje() {
        document.getElementById('puntaje').textContent = this.puntaje;
        this.verificarNivel();
    }

    actualizarNivel() {
        document.getElementById('nivel').textContent = this.nivel;
        const meta = this.nivel * 2000;
        document.getElementById('meta').textContent = meta;
    }

    verificarNivel() {
        const nivelAnterior = this.nivel;
        this.nivel = Math.floor(this.puntaje / 2000) + 1;

        if (this.nivel > nivelAnterior) {
            swal(`¡Has alcanzado el nivel ${this.nivel}!`);
            this.actualizarNivel();
            this.ajustarVelocidad();
        }
    }

    ajustarVelocidad() {
        clearInterval(this.intervaloJuego);
        const velocidad = Math.max(1000 - (this.nivel - 1) * 100, 200);
        this.intervaloJuego = setInterval(() => this.moverAbajo(), velocidad);
    }

    generarPieza() {
        const tiposPiezas = Object.keys(this.piezas);
        const piezaAleatoria = tiposPiezas[Math.floor(Math.random() * tiposPiezas.length)];
        this.piezaActual = {
            forma: this.piezas[piezaAleatoria],
            tipo: piezaAleatoria,
            x: 2,
            y: 0
        };

        if (this.verificarColision()) {
            this.finJuego();
        }

        this.movimientos++;
        document.getElementById('movimientos').textContent = this.movimientos;
        this.dibujarTablero();
    }

    verificarColision(desplazamientoX = 0, desplazamientoY = 0, nuevaForma = null) {
        const forma = nuevaForma || this.piezaActual.forma;

        for (let fila = 0; fila < forma.length; fila++) {
            for (let columna = 0; columna < forma[fila].length; columna++) {
                if (forma[fila][columna]) {
                    const nuevaX = this.piezaActual.x + columna + desplazamientoX;
                    const nuevaY = this.piezaActual.y + fila + desplazamientoY;

                    if (nuevaX < 0 || nuevaX >= 8 || nuevaY >= 15) return true;
                    if (nuevaY >= 0 && this.tablero[nuevaY][nuevaX]) return true;
                }
            }
        }
        return false;
    }

    moverPieza(direccion) {
        if (!this.verificarColision(direccion, 0)) {
            this.piezaActual.x += direccion;
            this.dibujarTablero();
        }
    }

    moverAbajo() {
        if (!this.verificarColision(0, 1)) {
            this.piezaActual.y++;
            this.dibujarTablero();
        } else {
            this.fijarPieza();
            this.limpiarLineas();
            this.generarPieza();
        }
    }

    rotarPieza() {
        const nuevaForma = this.piezaActual.forma[0]
            .map((_, indice) => this.piezaActual.forma.map(fila => fila[fila.length - 1 - indice]));

        if (!this.verificarColision(0, 0, nuevaForma)) {
            this.piezaActual.forma = nuevaForma;
            this.dibujarTablero();
        }
    }

    fijarPieza() {
        for (let fila = 0; fila < this.piezaActual.forma.length; fila++) {
            for (let columna = 0; columna < this.piezaActual.forma[fila].length; columna++) {
                if (this.piezaActual.forma[fila][columna]) {
                    const tableroY = this.piezaActual.y + fila;
                    if (tableroY >= 0) {
                        this.tablero[tableroY][this.piezaActual.x + columna] = this.piezaActual.tipo;
                    }
                }
            }
        }
    }

    limpiarLineas() {
        for (let fila = 14; fila >= 0; fila--) {
            if (this.tablero[fila].every(celda => celda)) {
                this.tablero.splice(fila, 1);
                this.tablero.unshift(Array(8).fill(0));
                this.puntaje += 100;
                this.actualizarPuntaje();
            }
        }
    }

    dibujarTablero() {
        for (let fila = 0; fila < 15; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                const celda = document.getElementById(`celda-${fila}-${columna}`);
                celda.className = 'celda';
                if (this.tablero[fila][columna]) {
                    celda.classList.add('pieza', this.colores[this.tablero[fila][columna]]);
                }
            }
        }

        if (this.piezaActual) {
            for (let fila = 0; fila < this.piezaActual.forma.length; fila++) {
                for (let columna = 0; columna < this.piezaActual.forma[fila].length; columna++) {
                    if (this.piezaActual.forma[fila][columna]) {
                        const tableroY = this.piezaActual.y + fila;
                        const tableroX = this.piezaActual.x + columna;
                        if (tableroY >= 0) {
                            const celda = document.getElementById(`celda-${tableroY}-${tableroX}`);
                            celda.classList.add('pieza', this.colores[this.piezaActual.tipo]);
                        }
                    }
                }
            }
        }
    }

    comenzarJuego() {
        this.intervaloJuego = setInterval(() => this.moverAbajo(), 1000);
    }

    finJuego() {
        clearInterval(this.intervaloJuego);
        swal(`¡Juego Terminado! Puntaje: ${this.puntaje}`);
        this.tablero = Array(15).fill().map(() => Array(8).fill(0));
        this.movimientos = 0;
        this.puntaje = 0;
        this.nivel = 1;
        this.actualizarPuntaje();
        this.actualizarNivel();
        this.dibujarTablero();
        this.comenzarJuego();
    }
}

// Iniciar el juego
const juego = new Tetris();
