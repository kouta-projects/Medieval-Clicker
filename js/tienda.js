export class Tienda {
  constructor(heroe) {
    this.heroe = heroe;
    this.nivelArma = 0;
    this.nivelEscudo = 0;
    this.maxNivel = 5;

    this.preciosArma = [50, 100, 200, 400, 800];
    this.preciosEscudo = [50, 100, 200, 400, 800];

    this.autoclickerActivo = false;
  }

  mostrarBotonesVillage(esVillage) {
    let contenedor = document.getElementById("botones-tienda");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "botones-tienda";
      document.getElementById("zona-combate").appendChild(contenedor);
    }

    contenedor.style.display = esVillage ? "flex" : "none";
    if (!esVillage) return;

    contenedor.style.justifyContent = "space-between";
    contenedor.style.position = "absolute";
    contenedor.style.top = "5px";
    contenedor.style.left = "0";
    contenedor.style.right = "0";
    contenedor.style.padding = "0 10px";

    let izquierda = contenedor.querySelector(".izquierda");
    if (!izquierda) {
      izquierda = document.createElement("div");
      izquierda.className = "izquierda";
      contenedor.appendChild(izquierda);
    } else izquierda.innerHTML = "";

    let derecha = contenedor.querySelector(".derecha");
    if (!derecha) {
      derecha = document.createElement("div");
      derecha.className = "derecha";
      contenedor.appendChild(derecha);
    } else derecha.innerHTML = "";

    // Botones
    const btnArma = document.createElement("button");
    btnArma.id = "btn-upgrade-arma";
    btnArma.addEventListener("click", () => this.comprarUpgradeArma());
    izquierda.appendChild(btnArma);

    const btnEscudo = document.createElement("button");
    btnEscudo.id = "btn-upgrade-escudo";
    btnEscudo.addEventListener("click", () => this.comprarUpgradeEscudo());
    izquierda.appendChild(btnEscudo);

    const btnAuto = document.createElement("button");
    btnAuto.id = "btn-autoclicker";
    btnAuto.textContent = "Auto-Clicker";
    btnAuto.addEventListener("click", () => this.comprarAutoclicker());
    derecha.appendChild(btnAuto);

    this.actualizarBotones();
  }

  actualizarBotones() {
    const btnArma = document.getElementById("btn-upgrade-arma");
    const btnEscudo = document.getElementById("btn-upgrade-escudo");

    if (btnArma) {
      if (this.nivelArma < this.maxNivel) {
        btnArma.textContent = `Upgrade Arma +${this.nivelArma + 1} (${this.preciosArma[this.nivelArma]} oro)`;
        btnArma.disabled = this.heroe.oro < this.preciosArma[this.nivelArma];
      } else {
        btnArma.textContent = "Arma al máximo";
        btnArma.disabled = true;
      }
    }

    if (btnEscudo) {
      if (this.nivelEscudo < this.maxNivel) {
        btnEscudo.textContent = `Upgrade Escudo +${this.nivelEscudo + 1} (${this.preciosEscudo[this.nivelEscudo]} oro)`;
        btnEscudo.disabled = this.heroe.oro < this.preciosEscudo[this.nivelEscudo];
      } else {
        btnEscudo.textContent = "Escudo al máximo";
        btnEscudo.disabled = true;
      }
    }
  }

  comprarUpgradeArma() {
    if (this.nivelArma >= this.maxNivel) return;
    const precio = this.preciosArma[this.nivelArma];
    if (this.heroe.oro >= precio) {
      this.heroe.oro -= precio;
      this.nivelArma++;
      this.heroe.daño += 5;
      document.getElementById("arma").src = `assets/upgrades/arma/up${this.nivelArma}.png`;
      window.actualizarUI?.();
    }
  }

  comprarUpgradeEscudo() {
    if (this.nivelEscudo >= this.maxNivel) return;
    const precio = this.preciosEscudo[this.nivelEscudo];
    if (this.heroe.oro >= precio) {
      this.heroe.oro -= precio;
      this.nivelEscudo++;
      this.heroe.vidaMaxima += 20;
      document.getElementById("escudo").src = `assets/upgrades/escudo/up${this.nivelEscudo}.png`;
      window.actualizarUI?.();
    }
  }

  comprarAutoclicker() {
    if (!this.autoclickerActivo && this.heroe.oro >= 500) {
      this.heroe.oro -= 500;
      this.autoclickerActivo = true;
      this.heroe.tieneAutoclicker = true;
      console.log("Autoclicker activado");
      window.actualizarUI?.();
    }
  }
}
