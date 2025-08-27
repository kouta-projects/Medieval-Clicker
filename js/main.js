import { Heroe } from "./heroe.js";
import { Mapa } from "./mapa.js";
import { Tienda } from "./tienda.js";
import {
  generarEnemigo,
  initClickCombate,
  limpiarCombate,
  iniciarDañoEnemigo,
  initLootUI,
  usarPocion,
  refreshPotionUI,
} from "./combate.js";
import { activarAutoclicker, desactivarAutoclicker } from "./combate.js";

window.addEventListener("DOMContentLoaded", () => {
  const pantallaInferior = document.getElementById("pantallaInferior");

  // Canvas para héroe
  const canvas = document.createElement("canvas");
  canvas.width = pantallaInferior.clientWidth;
  canvas.height = pantallaInferior.clientHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "20";
  pantallaInferior.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Héroe
  const heroe = new Heroe(ctx, "assets/heroe/idle_right.png", 96, 80, 8, 8, 2);
  window.heroeGlobal = heroe;

  // Tienda
  const tienda = new Tienda(heroe);
  window.tienda = tienda;

  // Mapa
  const mapa = new Mapa(heroe);
  mapa.setIconoInicial("village");

  // ───────────── Game Loop ─────────────
  let lastTime = 0;
  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heroe.update(deltaTime);
    heroe.draw();
    actualizarUI();
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  // ───────────── Actualizar UI ─────────────
  function actualizarUI() {
    // Vida
    const barra = document.querySelector("#barra-vida .barra-llena");
    const texto = document.querySelector("#barra-vida .vida-numero");
    if (barra)
      barra.style.width = `${(heroe.vidaActual / heroe.vidaMaxima) * 100}%`;
    if (texto) texto.textContent = `${heroe.vidaActual} / ${heroe.vidaMaxima}`;

    // Oro
    const divOro = document.querySelector("#oro .cantidad-oro");
    if (divOro) divOro.textContent = heroe.oro;

    // Daño
    const divDano = document.querySelector(".num-dano");
    if (divDano) divDano.textContent = heroe.daño;

    // Pociones
    const divPociones = document.querySelector("#pociones .cantidad-pociones");
    if (divPociones) divPociones.textContent = heroe.pociones;

    // Actualizar botones tienda
    tienda.actualizarBotones();
    refreshPotionUI(heroe);
  }

  // Inicializar combate
  initClickCombate(() => heroe.daño);
  initLootUI(heroe);

  // Pociones
  const pocionesDiv = document.getElementById("pociones");
  if (pocionesDiv) {
    pocionesDiv.addEventListener("click", () => usarPocion(heroe));
  }

  // Click en zonas
  const zonas = ["cave1", "cave2", "village", "dung1", "dung2", "graveyard"];
  zonas.forEach((zonaId) => {
    const icono = document.getElementById(zonaId);
    if (!icono) return;

    icono.addEventListener("click", () => {
      limpiarCombate(); // limpia respawn y combate
      desactivarAutoclicker(); // por si estabas en otra zona

      const enemigo = generarEnemigo(zonaId);
      if (enemigo) {
        iniciarDañoEnemigo(heroe);
        tienda.mostrarBotonesVillage(false);

        if (heroe.tieneAutoclicker) {
          activarAutoclicker(heroe);
        }
      } else {
        tienda.mostrarBotonesVillage(true);
        refreshPotionUI(heroe);
      }
    });
  });
});
