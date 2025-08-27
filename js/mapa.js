export class Mapa {
  constructor(heroe) {
    this.heroe = heroe;
    this.pantallaInferior = document.getElementById("pantallaInferior");
    this.iconosMapa = document.querySelectorAll("#iconos-mapa > div");
    this.combateDiv = document.getElementById("combate");
    this.zonaCombate = document.getElementById("zona-combate");
    this.iconoSeleccionado = null;

    this.inicializarEventos();
  }

  setIconoInicial(idIcono) {
    const icono = document.getElementById(idIcono);
    if (icono) {
      this.iconoSeleccionado = icono;
      this.heroe.moverAlIcono(icono, this.pantallaInferior);

      const img = icono.querySelector("img");
      if (!img.src.includes("-hover.png"))
        img.src = img.src.replace(".png", "-hover.png");

      const rutaFondo =
        idIcono === "village"
          ? "assets/map/blacksmith.jpg"
          : `assets/map/${idIcono}.jpg`;
      this.combateDiv.style.backgroundImage = `url('${rutaFondo}')`;
      this.combateDiv.style.backgroundSize = "cover";
      this.combateDiv.style.backgroundPosition = "center";

      window.tienda?.mostrarBotonesVillage(idIcono === "village");
    }
  }

  inicializarEventos() {
    this.iconosMapa.forEach((icono) => {
      icono.addEventListener("click", () => {
        if (this.iconoSeleccionado && this.iconoSeleccionado !== icono) {
          const imgPrev = this.iconoSeleccionado.querySelector("img");
          if (imgPrev.src.includes("-hover.png"))
            imgPrev.src = imgPrev.src.replace("-hover.png", ".png");
        }

        const img = icono.querySelector("img");
        if (!img.src.includes("-hover.png"))
          img.src = img.src.replace(".png", "-hover.png");

        this.heroe.moverAlIcono(icono, this.pantallaInferior);

        const rutaFondo =
          icono.id === "village"
            ? "assets/map/blacksmith.jpg"
            : `assets/map/${icono.id}.jpg`;
        this.combateDiv.style.backgroundImage = `url('${rutaFondo}')`;
        this.combateDiv.style.backgroundSize = "cover";
        this.combateDiv.style.backgroundPosition = "center";

        this.iconoSeleccionado = icono;

        window.tienda?.mostrarBotonesVillage(icono.id === "village");
      });
    });
  }
}
