// js/spriteAnimado.js
export class SpriteAnimado {
  constructor(ctx, imageSrc, frameWidth, frameHeight, frameCount, fps = 8, scale) {
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = imageSrc;

    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.fps = fps;

    this.scale = scale;

    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 1000 / fps;

    // Posición en pantalla
    this.x = 0;
    this.y = 0;

    // Configuración para pixel art nítido
    this.ctx.imageSmoothingEnabled = false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setScale(scale) {
    this.scale = scale;
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.elapsedTime = 0;
    }
  }

  draw() {
    // Desactiva suavizado en cada draw para asegurar que no se difumine
    this.ctx.imageSmoothingEnabled = false;

    this.ctx.drawImage(
      this.image,
      this.currentFrame * this.frameWidth, // origen X
      0,                                   // origen Y
      this.frameWidth,                     // ancho frame
      this.frameHeight,                    // alto frame
      this.x,                              // destino X
      this.y,                              // destino Y
      this.frameWidth * this.scale,        // ancho destino
      this.frameHeight * this.scale        // alto destino
    );
  }
}
