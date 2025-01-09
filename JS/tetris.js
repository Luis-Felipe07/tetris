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
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 8; j++) {
                const celda = document.createElement('div');
                celda.className = 'celda';
                celda.id = `celda-${i}-${j}`;
                tablero.appendChild(celda);
            }
        }
    }

    vincularControles() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
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
            swal(`¡Has alcanzado el nivel ${this.nivel}!`);//esto hay que cambiarlo por algo mejor mas bonito
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
        const piezas = Object.keys(this.piezas);
        const piezaAleatoria = piezas[Math.floor(Math.random() * piezas.length)];
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

    verificarColision(offsetX = 0, offsetY = 0, nuevaForma = null) {
        const forma = nuevaForma || this.piezaActual.forma;

        for (let y = 0; y < forma.length; y++) {
            for (let x = 0; x < forma[y].length; x++) {
                if (forma[y][x]) {
                    const nuevoX = this.piezaActual.x + x + offsetX;
                    const nuevoY = this.piezaActual.y + y + offsetY;

                    if (nuevoX < 0 || nuevoX >= 8 || nuevoY >= 15) return true;
                    if (nuevoY >= 0 && this.tablero[nuevoY][nuevoX]) return true;
                }
            }
        }
        return false;
    }

    moverPieza(dir) {
        if (!this.verificarColision(dir, 0)) {
            this.piezaActual.x += dir;
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
            .map((_, i) => this.piezaActual.forma.map(fila => fila[fila.length - 1 - i]));

        if (!this.verificarColision(0, 0, nuevaForma)) {
            this.piezaActual.forma = nuevaForma;
            this.dibujarTablero();
        }
    }

    fijarPieza() {
        for (let y = 0; y < this.piezaActual.forma.length; y++) {
            for (let x = 0; x < this.piezaActual.forma[y].length; x++) {
                if (this.piezaActual.forma[y][x]) {
                    const tableroY = this.piezaActual.y + y;
                    if (tableroY >= 0) {
                        this.tablero[tableroY][this.piezaActual.x + x] = this.piezaActual.tipo;
                    }
                }
            }
        }
    }

    limpiarLineas() {
        for (let y = 14; y >= 0; y--) {
            if (this.tablero[y].every(celda => celda)) {
                this.tablero.splice(y, 1);
                this.tablero.unshift(Array(8).fill(0));
                this.puntaje += 100;
                this.actualizarPuntaje();
            }
        }
    }

    dibujarTablero() {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 8; x++) {
                const celda = document.getElementById(`celda-${y}-${x}`);
                celda.className = 'celda';
                if (this.tablero[y][x]) {
                    celda.classList.add('pieza', this.colores[this.tablero[y][x]]);
                }
            }
        }

        if (this.piezaActual) {
            for (let y = 0; y < this.piezaActual.forma.length; y++) {
                for (let x = 0; x < this.piezaActual.forma[y].length; x++) {
                    if (this.piezaActual.forma[y][x]) {
                        const tableroY = this.piezaActual.y + y;
                        const tableroX = this.piezaActual.x + x;
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
