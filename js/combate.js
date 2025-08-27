import { ENEMIGOS } from "../data/enemigos.js";

let enemigoActual = null;
let dañoInterval = null;
let zonaActual = null;

let respawnTimeoutId = null; // ⬅️ nuevo

// 🔧 Config de loot/curación (ajústalo como quieras)
const config = {
  killsPorPocion: 3,
  curaPocion: 25,
};

// Estado de loot
let contadorMuertes = 0;
let oroTotal = 0;
let pociones = 0;

// ────────────────────────────── UI helpers ──────────────────────────────
function refreshGoldUI() {
  const oroEl = document.querySelector("#oro .cantidad-oro");
  if (oroEl) oroEl.textContent = String(oroTotal);
}

function setPotionEnabled(enabled) {
  const cont = document.getElementById("pociones");
  if (!cont) return;
  cont.style.opacity = enabled ? "" : "0.5";
  cont.style.pointerEvents = enabled ? "auto" : "none";
  cont.style.cursor = enabled ? "pointer" : "default";
}

function refreshPotionUIInternal(heroe) {
  const cantEl = document.querySelector("#pociones .cantidad-pociones");
  if (cantEl) cantEl.textContent = String(heroe.pociones);

  const canUse =
    heroe &&
    heroe.pociones > 0 &&
    typeof heroe.vidaActual === "number" &&
    typeof heroe.vidaMaxima === "number" &&
    heroe.vidaActual < heroe.vidaMaxima;

  setPotionEnabled(!!canUse);
}

// Exportado para que main/hero actualicen el estado del botón cuando cambie la vida
export function refreshPotionUI(heroe) {
  refreshPotionUIInternal(heroe);
}

// Llamar en el arranque
export function initLootUI(heroe) {
  refreshGoldUI();
  refreshPotionUIInternal(heroe);
}

// Para inspección si te hace falta
export function getLootStats() {
  return { oroTotal, pociones, contadorMuertes };
}

// ─────────────────────── Lógica de loot al morir ───────────────────────
function lootEnemigo(enemigo) {
  // Oro definido por enemigo (por defecto 0)
  const oro = enemigo?.oro || 0;
  if (window.heroeGlobal) {
    window.heroeGlobal.oro += oro; // sumamos oro al héroe
  }

  contadorMuertes++;

  // 1 poción cada N muertes
  if (
    config.killsPorPocion > 0 &&
    contadorMuertes % config.killsPorPocion === 0
  ) {
    if (window.heroeGlobal) {
      window.heroeGlobal.pociones++;
    }
  }

  refreshGoldUI();
  refreshPotionUIInternal(window.heroeGlobal || null);
}

// ─────────────────────── Generación y combate ──────────────────────────
export function generarEnemigo(zona) {
  const lista = ENEMIGOS[zona];
  if (!lista || !lista.length) {
    zonaActual = null;
    return null;
  }

  const elegido = lista[Math.floor(Math.random() * lista.length)];
  enemigoActual = {
    ...elegido,
    vidaActual: elegido.vida,
    daño: typeof elegido.daño === "number" ? elegido.daño : 1, // default
  };
  zonaActual = zona;

  const combateDiv = document.getElementById("combate");
  if (!combateDiv) return null;

  // Limpiar y pintar UI del enemigo
  combateDiv.innerHTML = "";

  const enemigoContainer = document.createElement("div");
  enemigoContainer.classList.add("enemigo-container");

  const barraVida = document.createElement("div");
  barraVida.classList.add("barra-vida");

  const barraVidaFill = document.createElement("div");
  barraVidaFill.classList.add("barra-vida-fill");
  barraVidaFill.style.width = "100%";
  barraVida.appendChild(barraVidaFill);

  const vidaTexto = document.createElement("span");
  vidaTexto.classList.add("vida-texto");
  vidaTexto.textContent = `${enemigoActual.vidaActual} / ${enemigoActual.vida}`;

  const img = document.createElement("img");
  img.src = enemigoActual.sprite;
  img.alt = enemigoActual.nombre;
  img.classList.add("enemigo");

  enemigoContainer.appendChild(barraVida);
  enemigoContainer.appendChild(vidaTexto);
  enemigoContainer.appendChild(img);
  combateDiv.appendChild(enemigoContainer);

  return enemigoActual;
}

export function heroeAtaca(daño) {
  if (!enemigoActual) return;

  enemigoActual.vidaActual -= daño;
  if (enemigoActual.vidaActual < 0) enemigoActual.vidaActual = 0;

  const barraVidaFill = document.querySelector(".barra-vida-fill");
  const vidaTexto = document.querySelector(".vida-texto");
  if (barraVidaFill && vidaTexto) {
    barraVidaFill.style.width = `${
      (enemigoActual.vidaActual / enemigoActual.vida) * 100
    }%`;
    vidaTexto.textContent = `${enemigoActual.vidaActual} / ${enemigoActual.vida}`;
  }

  if (enemigoActual.vidaActual <= 0) {
    lootEnemigo(enemigoActual);

    const img = document.querySelector(".enemigo");
    if (img) img.style.opacity = "0.4";

    const zona = zonaActual; // recordamos la zona donde murió
    enemigoActual = null;
    pararDañoEnemigo();

    cancelarRespawn(); // ⬅️ evita duplicados
    respawnTimeoutId = setTimeout(() => {
      // si ya cambiaste de zona, no respawnear
      if (zonaActual !== zona) return;

      const nuevo = generarEnemigo(zona);
      if (nuevo && window.heroeGlobal) {
        iniciarDañoEnemigo(window.heroeGlobal);
      }
    }, 500);
  }
}

export function initClickCombate(getHeroeDaño) {
  const combateDiv = document.getElementById("combate");
  if (!combateDiv) return;

  combateDiv.addEventListener("click", () => {
    const daño = getHeroeDaño();
    heroeAtaca(daño);
  });
}

export function limpiarCombate() {
  enemigoActual = null;
  cancelarRespawn(); // ⬅️ nuevo
  const combateDiv = document.getElementById("combate");
  if (combateDiv) combateDiv.innerHTML = "";
  pararDañoEnemigo();
}

export function iniciarDañoEnemigo(heroe, intervalo = 2000) {
  if (!enemigoActual || !heroe) return;
  if (dañoInterval) clearInterval(dañoInterval);

  dañoInterval = setInterval(() => {
    if (!enemigoActual) {
      clearInterval(dañoInterval);
      dañoInterval = null;
      return;
    }
    // Daño periódico del enemigo
    const d = typeof enemigoActual.daño === "number" ? enemigoActual.daño : 1;
    heroe.recibirDaño(d);
  }, intervalo);
}

export function pararDañoEnemigo() {
  if (dañoInterval) clearInterval(dañoInterval);
  dañoInterval = null;
}

// ───────────────────────── Uso de pociones ─────────────────────────────
export function usarPocion(heroe, cura = config.curaPocion) {
  if (!heroe) return;
  if (heroe.pociones <= 0) {
    refreshPotionUIInternal(heroe);
    return;
  }
  if (heroe.vidaActual >= heroe.vidaMaxima) {
    refreshPotionUIInternal(heroe);
    return;
  }
  const usada = heroe.usarPocion(cura);
  if (usada) {
    refreshPotionUIInternal(heroe);
  }
}

// Por si más adelante quieres cambiar killsPorPocion o curaPocion desde fuera
export function setLootConfig(partial) {
  Object.assign(config, partial || {});
  refreshPotionUIInternal(window.heroeGlobal || null);
}

// Autoclicker

let autoclickerInterval = null;

export function activarAutoclicker(heroe) {
  if (autoclickerInterval) return; // ya activo

  autoclickerInterval = setInterval(() => {
    if (heroe.tieneAutoclicker && enemigoActual) {
      // Simulamos el mismo click que el jugador
      const daño = heroe.daño;
      heroeAtaca(daño);
    }
  }, 100); // cada 0.1 segundos
}

export function desactivarAutoclicker() {
  if (autoclickerInterval) {
    clearInterval(autoclickerInterval);
    autoclickerInterval = null;
  }
}

function cancelarRespawn() {
  if (respawnTimeoutId) {
    clearTimeout(respawnTimeoutId);
    respawnTimeoutId = null;
  }
}
