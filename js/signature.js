/**
 * signature.js — Canvas de firma táctil
 * Soporta: dedo táctil, Apple Pencil (Pointer Events), mouse
 * Interpolación suave con curvas de Bézier
 */

class FirmaCanvas {
  constructor(canvasId, wrapperSelector) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.wrapper = this.canvas.closest(wrapperSelector || '.firma-wrapper');
    this.labelFloat = this.wrapper.querySelector('.firma-label-float');

    this.dibujando = false;
    this.puntos = [];
    this.tieneFirma = false;

    this._configurarCanvas();
    this._bindEventos();
  }

  _configurarCanvas() {
    // Ajustar resolución para retina/pantallas de alta densidad
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);

    // Configurar estilo de trazo
    this.ctx.strokeStyle = '#1a1a1a';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this._dpr = dpr;
    this._canvasW = w;
    this._canvasH = h;
  }

  _getPosicion(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Pointer event (incluye Apple Pencil) o mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  _getPressure(e) {
    // Apple Pencil provee presión real; dedo y mouse = 0.5
    if (e.pressure !== undefined && e.pressure > 0) {
      return Math.max(0.3, Math.min(e.pressure * 3, 4));
    }
    return 2.5;
  }

  _iniciarDibujo(e) {
    e.preventDefault();
    this.dibujando = true;
    const pos = this._getPosicion(e);
    this.puntos = [pos];
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);

    if (this.labelFloat) {
      this.labelFloat.classList.add('hidden');
    }
    this.wrapper.classList.add('activo');
  }

  _dibujar(e) {
    if (!this.dibujando) return;
    e.preventDefault();

    const pos = this._getPosicion(e);
    this.puntos.push(pos);

    const presion = this._getPressure(e);
    this.ctx.lineWidth = presion;

    if (this.puntos.length < 3) {
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      return;
    }

    // Curva de Bézier cuadrática para trazo suave
    const len = this.puntos.length;
    const p0 = this.puntos[len - 3];
    const p1 = this.puntos[len - 2];
    const p2 = this.puntos[len - 1];

    const cpX = (p0.x + p2.x) / 2;
    const cpY = (p0.y + p2.y) / 2;

    this.ctx.beginPath();
    this.ctx.moveTo(cpX, cpY);
    this.ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    this.ctx.stroke();
  }

  _terminarDibujo(e) {
    if (!this.dibujando) return;
    this.dibujando = false;
    this.tieneFirma = true;
    this.puntos = [];
  }

  _bindEventos() {
    // Pointer Events (Apple Pencil + stylus + mouse)
    this.canvas.addEventListener('pointerdown', (e) => this._iniciarDibujo(e), { passive: false });
    this.canvas.addEventListener('pointermove', (e) => this._dibujar(e), { passive: false });
    this.canvas.addEventListener('pointerup', (e) => this._terminarDibujo(e));
    this.canvas.addEventListener('pointercancel', (e) => this._terminarDibujo(e));

    // Touch Events como fallback (Safari iOS)
    this.canvas.addEventListener('touchstart', (e) => this._iniciarDibujo(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this._dibujar(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this._terminarDibujo(e));

    // Reconfigurar si cambia el tamaño de pantalla
    window.addEventListener('resize', () => {
      const data = this.obtenerImagen();
      this._configurarCanvas();
      if (data && this.tieneFirma) {
        const img = new Image();
        img.onload = () => this.ctx.drawImage(img, 0, 0, this._canvasW, this._canvasH);
        img.src = data;
      }
    });
  }

  limpiar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.tieneFirma = false;
    this.puntos = [];
    if (this.labelFloat) {
      this.labelFloat.classList.remove('hidden');
    }
    this.wrapper.classList.remove('activo');
  }

  obtenerImagen() {
    if (!this.tieneFirma) return null;
    return this.canvas.toDataURL('image/png');
  }

  estaVacia() {
    return !this.tieneFirma;
  }
}
