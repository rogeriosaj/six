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
  isSecret?: boolean;
}

export type MapType = 'main' | 'secret_corridor' | 'room1' | 'room2' | 'room3' | 'room4' | 'room5' | 'room6';

export interface InteractivePainting {
  id: number;
  tileX: number;
  tileY: number;
  memoryIndex: number;
  isSecret?: boolean;
}

export class CorridorMap {
  public type: MapType;
  public readonly cols: number;
  public readonly rows: number;
  public readonly tileSize: number = 32;

  private tileSet: HTMLCanvasElement;
  public paintings: InteractivePainting[] = [];

  constructor(type: MapType = 'main') {
    this.type = type;
    this.tileSet = createMapTileSet();

    if (type === 'main') {
      this.cols = 22;
      this.rows = 8;
    } else if (type === 'secret_corridor') {
      this.cols = 28; // Espaço para 6 portas espaçadas
      this.rows = 8;
    } else {
      // Salas Secretas (room1 até room6)
      this.cols = 9;
      this.rows = 7;
    }

    this.setupPaintings();
  }

  private setupPaintings() {
    if (this.type === 'main') {
      // 6 Quadros no corredor principal
      const paintingPositions = [3, 6, 9, 12, 15, 18];
      paintingPositions.forEach((posX, idx) => {
        this.paintings.push({
          id: idx,
          tileX: posX,
          tileY: 1,
          memoryIndex: idx
        });
      });
    } else if (this.type.startsWith('room')) {
      // Pega número da sala (ex: 'room3' -> 3)
      const roomNum = parseInt(this.type.replace('room', ''), 10);
      const memoryIdx = 5 + roomNum; // room1 -> memory 6, room2 -> memory 7, etc.

      this.paintings.push({
        id: 0,
        tileX: 4,
        tileY: 1,
        memoryIndex: memoryIdx,
        isSecret: true
      });
    }
  }

  // Verifica se uma posição em pixels está colidindo com obstáculos
  public isSolid(x: number, y: number, width: number = 16, height: number = 16): boolean {
    const minTileX = Math.floor(x / this.tileSize);
    const maxTileX = Math.floor((x + width - 1) / this.tileSize);
    const minTileY = Math.floor(y / this.tileSize);
    const maxTileY = Math.floor((y + height - 1) / this.tileSize);

    if (this.type === 'main') {
      if (maxTileX >= this.cols - 1 && minTileY >= 3 && maxTileY <= 5) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
      if ((minTileX === 1 || minTileX === 20) && minTileY === 2) {
        return true;
      }
    } else if (this.type === 'secret_corridor') {
      if (minTileX <= 0 && minTileY >= 3 && maxTileY <= 5) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
    } else if (this.type.startsWith('room')) {
      if (minTileX === 4 && maxTileX === 4 && maxTileY >= this.rows - 1) {
        return false;
      }
      if (minTileX < 1 || maxTileX >= this.cols - 1 || minTileY < 2 || maxTileY >= this.rows - 1) {
        return true;
      }
    }

    return false;
  }

  // Retorna o índice da porta que Laurla está encarando no Corredor de Enigmas (1 a 6) ou 0
  public getFacingDoorIndex(playerX: number, playerY: number, direction: string): number {
    if (this.type !== 'secret_corridor' || direction !== 'up') return 0;

    const centerPlayerX = playerX + 8;
    const playerTileX = Math.floor(centerPlayerX / this.tileSize);
    const playerTileY = Math.floor((playerY + 8) / this.tileSize);

    // Laurla deve estar exatamente na fileira adjacente à parede (row 2)
    if (playerTileY !== 2) return 0;

    const doorPositions = [4, 8, 12, 16, 20, 24];
    for (let i = 0; i < doorPositions.length; i++) {
      if (playerTileX === doorPositions[i]) {
        return i + 1; // Retorna 1 a 6
      }
    }
    return 0;
  }

  // Retorna o quadro que está diretamente à frente (exige alinhamento exato e olhar para cima)
  public getFacingPainting(playerX: number, playerY: number, direction: string): InteractivePainting | null {
    if (direction !== 'up') return null;

    const centerPlayerX = playerX + 8;
    const playerTileX = Math.floor(centerPlayerX / this.tileSize);
    const playerTileY = Math.floor((playerY + 8) / this.tileSize);

    // Deve estar na fileira adjacente à parede superior (row 2)
    if (playerTileY !== 2) return null;

    for (const p of this.paintings) {
      if (playerTileX === p.tileX) {
        return p;
      }
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D, animTime: number, unlockedRooms: Record<number, boolean> = {}) {
    ctx.imageSmoothingEnabled = false;

    // Renderiza o chão e paredes
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const destX = c * this.tileSize;
        const destY = r * this.tileSize;

        if (r < 2) {
          // Parede Superior
          if (this.type === 'secret_corridor' && [4, 8, 12, 16, 20, 24].includes(c) && r === 1) {
            // Desenha as 6 Portas Secretas
            ctx.drawImage(this.tileSet, 160, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.drawImage(this.tileSet, 64, 0, 32, 32, destX, destY, 32, 32);
          }
        } else if (r === this.rows - 1) {
          // Parede Inferior / Moldura
          if (this.type.startsWith('room') && c === 4) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#1b1b22';
            ctx.fillRect(destX, destY, 32, 32);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(destX, destY, 32, 4);
          }
        } else if (c === 0) {
          if (this.type === 'secret_corridor' && (r === 4 || r === 5)) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#263238';
            ctx.fillRect(destX, destY, 32, 32);
          }
        } else if (c === this.cols - 1) {
          if (this.type === 'main' && (r === 4 || r === 5)) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.fillStyle = '#263238';
            ctx.fillRect(destX, destY, 32, 32);
          }
        } else {
          if ((this.type === 'main' || this.type === 'secret_corridor') && r >= 4 && r <= 5) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else if (this.type.startsWith('room') && c === 4 && r >= 2) {
            ctx.drawImage(this.tileSet, 32, 0, 32, 32, destX, destY, 32, 32);
          } else {
            ctx.drawImage(this.tileSet, 0, 0, 32, 32, destX, destY, 32, 32);
          }
        }
      }
    }

    if (this.type === 'main') {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    } else if (this.type === 'secret_corridor') {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    } else if (this.type.startsWith('room')) {
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, 1 * this.tileSize, 2 * this.tileSize, 32, 32);
      ctx.drawImage(this.tileSet, 128, 0, 32, 32, (this.cols - 2) * this.tileSize, 2 * this.tileSize, 32, 32);
    }

    // Renderiza os Quadros nas paredes
    this.paintings.forEach((p, idx) => {
      const px = p.tileX * this.tileSize;
      const py = p.tileY * this.tileSize - 12;

      let isLocked = false;
      if (p.isSecret && this.type.startsWith('room')) {
        const roomNum = parseInt(this.type.replace('room', ''), 10);
        isLocked = !unlockedRooms[roomNum];
      }

      if (isLocked) {
        ctx.drawImage(this.tileSet, 192, 0, 32, 32, px, py, 32, 32);
      } else {
        ctx.drawImage(this.tileSet, 96, 0, 32, 32, px, py, 32, 32);
      }

      ctx.fillStyle = isLocked ? '#e53935' : '#fbc02d';
      ctx.fillRect(px + 8, py + 26, 16, 10);
      ctx.fillStyle = isLocked ? '#ffffff' : '#212121';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isLocked ? '🔒' : `${idx + 1}`, px + 16, py + 34);

      const pulse = Math.sin(animTime * 0.005 + idx) * 0.4 + 0.6;
      ctx.strokeStyle = isLocked ? `rgba(229, 57, 53, ${pulse})` : `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 3, 30, 24);
    });
  }
}
