import { SpriteAnimado } from "./spriteAnimado.js";

export class Heroe {
  constructor(ctx, src, frameWidth, frameHeight, frameCount, fps = 8, scale = 2) {
    this.sprite = new SpriteAnimado(ctx, src, frameWidth, frameHeight, frameCount, fps, scale);
    this.vidaMaxima = 100;
    this.vidaActual = this.vidaMaxima;
    this.oro = 0;       // 🔹 oro inicial
    this.daño = 500;      // 🔹 daño base
    this.pociones = 0;  // 🔹 pociones iniciales
    this.tieneAutoclicker = false;
  }

  setPosition(x, y) {
    this.sprite.setPosition(x, y);
  }

  moverAlIcono(icono, pantallaInferior) {
    const rect = icono.getBoundingClientRect();
    const mapaRect = pantallaInferior.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - mapaRect.left - (this.sprite.frameWidth * this.sprite.scale) / 2;
    const y = rect.top + rect.height / 2 - mapaRect.top - (this.sprite.frameHeight * this.sprite.scale) / 2;
    this.setPosition(x, y);
  }

  update(deltaTime) {
    this.sprite.update(deltaTime);
  }

  draw() {
    this.sprite.draw();
  }

  usarPocion(cura = 25) {
    if (this.vidaActual >= this.vidaMaxima || this.pociones <= 0) return false;
    this.vidaActual += cura;
    if (this.vidaActual > this.vidaMaxima) this.vidaActual = this.vidaMaxima;
    this.pociones--;

    const barra = document.querySelector("#barra-vida .barra-llena");
    const texto = document.querySelector("#barra-vida .vida-numero");
    if (barra) barra.style.width = `${(this.vidaActual / this.vidaMaxima) * 100}%`;
    if (texto) texto.textContent = `${this.vidaActual} / ${this.vidaMaxima}`;

    if (window.combateGlobal?.refreshPotionUI) {
      window.combateGlobal.refreshPotionUI(this);
    }

    // Actualizar UI oro/pociones
    if (window.actualizarOroUI) window.actualizarOroUI();

    return true;
  }

  recibirDaño(cantidad) {
    this.vidaActual -= cantidad;
    if (this.vidaActual < 0) this.vidaActual = 0;

    const barra = document.querySelector("#barra-vida .barra-llena");
    const texto = document.querySelector("#barra-vida .vida-numero");
    if (barra) barra.style.width = `${(this.vidaActual / this.vidaMaxima) * 100}%`;
    if (texto) texto.textContent = `${this.vidaActual} / ${this.vidaMaxima}`;

    if (window.combateGlobal?.refreshPotionUI) {
      window.combateGlobal.refreshPotionUI(this);
    }

    if (this.vidaActual <= 0) this.morir();
  }

  curarAlMaximo() {
    this.vidaActual = this.vidaMaxima;
    const barra = document.querySelector("#barra-vida .barra-llena");
    const texto = document.querySelector("#barra-vida .vida-numero");
    if (barra) barra.style.width = "100%";
    if (texto) texto.textContent = `${this.vidaActual} / ${this.vidaMaxima}`;

    if (window.combateGlobal?.refreshPotionUI) {
      window.combateGlobal.refreshPotionUI(this);
    }
  }

  morir() {
    const village = document.getElementById("village");
    if (village) this.moverAlIcono(village, document.getElementById("pantallaInferior"));
    this.curarAlMaximo();

    const { limpiarCombate, pararDañoEnemigo } = window.combateGlobal || {};
    if (limpiarCombate) limpiarCombate();
    if (pararDañoEnemigo) pararDañoEnemigo();
  }
}
