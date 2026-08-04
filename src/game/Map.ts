/* ==========================================================================
   Mapa do Corredor de Memórias (Pokémon Fire Red Gallery Map)
   ========================================================================== */

import { createMapTileSet } from './SpriteGenerator';
import { Memory } from '../data/memories';

export interface InteractivePainting {
  id: number;
  tileX: number;
  tileY: number;
  memoryIndex: number;
}

export class CorridorMap {
  public readonly cols: number = 22;
  public readonly rows: number = 8;
  public readonly tileSize: number = 32;

  private tileSet: HTMLCanvasElement;
  public paintings: InteractivePainting[] = [];

  constructor() {
    this.tileSet = createMapTileSet();
    this.setupPaintings();
  }

  private setupPaintings() {
    // 6 Quadros espaçados ao longo da parede superior (y = 1)
    const paintingPositions = [3, 6, 9, 12, 15, 18];
    paintingPositions.forEach((posX, idx) => {
      this.paintings.push({
        id: idx,
        tileX: posX,
        tileY: 1,
        memoryIndex: idx
      });
    });
  }

  // Verifica se uma posição em pixels está colidindo com obstáculos (parede, vasos)
  public isSolid(x: number, y: number, width: number = 16, height: number = 16): boolean {
    const minTileX = Math.floor(x / this.tileSize);
    const maxTileX = Math.floor((x + width - 1) / this.tileSize);
    const minTileY = Math.floor(y / this.tileSize);
    const maxTileY = Math.floor((y + height - 1) / this.tileSize);

    // Limites externos do corredor
    if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
      return true;
    }

    // Vasos de plantas em x = 1 e x = 20 no y = 2
    if ((minTileX === 1 || minTileX === this.cols - 2) && minTileY === 2) {
      return true;
    }

    return false;
  }

  // Retorna o quadro que está logo à frente ou na mesma coluna que a Laurla se ela estiver virada para cima
  public getFacingPainting(playerX: number, playerY: number, direction: string): InteractivePainting | null {
    // Para interagir, Laurla deve estar perto da parede (y <= 3 tiles) e virada para 'up' (ou próxima o suficiente)
    const centerPlayerX = playerX + 8;
    const playerTileX = Math.floor(centerPlayerX / this.tileSize);
    const playerTileY = Math.floor((playerY + 8) / this.tileSize);

    for (const p of this.paintings) {
      const dist = Math.abs(playerTileX - p.tileX);
      if (dist <= 1 && (playerTileY <= 3)) {
        if (direction === 'up' || dist === 0) {
          return p;
        }
      }
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D, animTime: number) {
    ctx.imageSmoothingEnabled = false;

    // Renderiza o chão e paredes
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const destX = c * this.tileSize;
        const destY = r * this.tileSize;

        if (r < 2) {
          // Parede Superior
          ctx.drawImage(this.tileSet, 64, 0, 32, 32, destX, destY, 32, 32);
        } else if (r === this.rows - 1) {
          // Parede Inferior / Moldura
          ctx.fillStyle = '#1b1b22';
          ctx.fillRect(destX, destY, 32, 32);
          ctx.fillStyle = '#37474f';
          ctx.fillRect(destX, destY, 32, 4);
        } else if (c === 0 || c === this.cols - 1) {
          // Paredes Laterais
          ctx.fillStyle = '#263238';
          ctx.fillRect(destX, destY, 32, 32);
        } else {
          // Chão do Corredor (Madeira no topo/fundo e Tapete no meio)
          if (r >= 4 && r <= 5) {
            // Tapete Vermelho no meio do corredor
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            // Piso de madeira
            ctx.drawImage(this.tileSet, 0, 0, 32, 32, destX, destY, 32, 32);
          }
        }
      }
    }

    // Renderiza Vasos de Planta nas pontas
    ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
    ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);

    // Renderiza os Quadros nas paredes
    this.paintings.forEach((p, idx) => {
      const px = p.tileX * this.tileSize;
      const py = p.tileY * this.tileSize - 12;

      // Desenha moldura e pintura
      ctx.drawImage(this.tileSet, 96, 0, 32, 32, px, py, 32, 32);

      // Número do Quadro (1 a 6)
      ctx.fillStyle = '#fbc02d';
      ctx.fillRect(px + 10, py + 26, 12, 10);
      ctx.fillStyle = '#212121';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${idx + 1}`, px + 16, py + 34);

      // Brilho pulsante em volta do quadro para indicar interatividade
      const pulse = Math.sin(animTime * 0.005 + idx) * 0.4 + 0.6;
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 3, 30, 24);
    });
  }
}
