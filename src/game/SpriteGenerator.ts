/* ==========================================================================
   Gerador de Sprites Pixel Art (Laurla & Little Roger & Cenário)
   ========================================================================== */

export type Direction = 'down' | 'up' | 'left' | 'right';

// Cria um canvas em memória contendo os sprites do personagem
export function createCharacterSpriteSheet(
  hairColor: string,
  skinColor: string,
  glassesColor: string,
  shirtColor: string,
  pantsColor: string,
  isFemale: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const frameWidth = 16;
  const frameHeight = 20;
  // 4 Direções (down=0, up=1, left=2, right=3) x 3 Animações (parado=0, passo1=1, passo2=2)
  canvas.width = frameWidth * 3;
  canvas.height = frameHeight * 4;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  const directions: Direction[] = ['down', 'up', 'left', 'right'];

  directions.forEach((dir, dirIdx) => {
    for (let frameIdx = 0; frameIdx < 3; frameIdx++) {
      const offsetX = frameIdx * frameWidth;
      const offsetY = dirIdx * frameHeight;

      // Offsets de caminhada para as pernas
      let legOffsetLeft = 0;
      let legOffsetRight = 0;
      if (frameIdx === 1) legOffsetLeft = -1;
      if (frameIdx === 2) legOffsetRight = -1;

      // 1. Sombra nos pés
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(offsetX + 3, offsetY + 18, 10, 2);

      // 2. Pernas / Sapatos
      ctx.fillStyle = pantsColor;
      if (dir === 'down' || dir === 'up') {
        ctx.fillRect(offsetX + 4, offsetY + 14 + legOffsetLeft, 3, 4);
        ctx.fillRect(offsetX + 9, offsetY + 14 + legOffsetRight, 3, 4);
        // Sapatos
        ctx.fillStyle = '#212121';
        ctx.fillRect(offsetX + 4, offsetY + 17 + legOffsetLeft, 3, 2);
        ctx.fillRect(offsetX + 9, offsetY + 17 + legOffsetRight, 3, 2);
      } else {
        ctx.fillRect(offsetX + 6, offsetY + 14 + legOffsetLeft, 4, 4);
        ctx.fillStyle = '#212121';
        ctx.fillRect(offsetX + 6, offsetY + 17 + legOffsetLeft, 4, 2);
      }

      // 3. Tronco / Roupa
      ctx.fillStyle = shirtColor;
      ctx.fillRect(offsetX + 4, offsetY + 8, 8, 7);

      // Detalhe da roupa (Jaqueta / Colete)
      ctx.fillStyle = '#ffffff';
      if (dir === 'down') {
        ctx.fillRect(offsetX + 7, offsetY + 8, 2, 7);
      }

      // Braços
      ctx.fillStyle = skinColor;
      if (dir === 'down' || dir === 'up') {
        ctx.fillRect(offsetX + 2, offsetY + 9 + legOffsetLeft, 2, 5);
        ctx.fillRect(offsetX + 12, offsetY + 9 + legOffsetRight, 2, 5);
      } else if (dir === 'left') {
        ctx.fillRect(offsetX + 7, offsetY + 9 + legOffsetLeft, 2, 5);
      } else if (dir === 'right') {
        ctx.fillRect(offsetX + 7, offsetY + 9 + legOffsetLeft, 2, 5);
      }

      // 4. Cabeça / Rosto
      ctx.fillStyle = skinColor;
      ctx.fillRect(offsetX + 4, offsetY + 2, 8, 7);

      // Olhos e Óculos
      if (dir === 'down') {
        // Óculos (Armação)
        ctx.fillStyle = glassesColor;
        ctx.fillRect(offsetX + 4, offsetY + 4, 3, 3);
        ctx.fillRect(offsetX + 9, offsetY + 4, 3, 3);
        ctx.fillRect(offsetX + 7, offsetY + 4, 2, 1);

        // Lentes e Pupilas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 5, offsetY + 5, 1, 1);
        ctx.fillRect(offsetX + 10, offsetY + 5, 1, 1);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 5, offsetY + 5, 1, 1);
        ctx.fillRect(offsetX + 10, offsetY + 5, 1, 1);
      } else if (dir === 'left') {
        // Óculos perfil esquerdo
        ctx.fillStyle = glassesColor;
        ctx.fillRect(offsetX + 4, offsetY + 4, 3, 3);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 4, offsetY + 5, 1, 1);
      } else if (dir === 'right') {
        // Óculos perfil direito
        ctx.fillStyle = glassesColor;
        ctx.fillRect(offsetX + 9, offsetY + 4, 3, 3);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 11, offsetY + 5, 1, 1);
      }

      // 5. Cabelo
      ctx.fillStyle = hairColor;

      if (dir === 'down') {
        // Franja e Topo
        ctx.fillRect(offsetX + 3, offsetY + 1, 10, 3);
        if (isFemale) {
          // Cabelo longo da Laurla
          ctx.fillRect(offsetX + 2, offsetY + 3, 2, 7);
          ctx.fillRect(offsetX + 12, offsetY + 3, 2, 7);
          // Laço de fita fofo no cabelo
          ctx.fillStyle = '#e91e63';
          ctx.fillRect(offsetX + 11, offsetY + 2, 2, 2);
        } else {
          // Cabelo do Little Roger
          ctx.fillRect(offsetX + 3, offsetY + 1, 10, 2);
        }
      } else if (dir === 'up') {
        // Atrás da cabeça
        ctx.fillRect(offsetX + 3, offsetY + 1, 10, 8);
        if (isFemale) {
          ctx.fillRect(offsetX + 2, offsetY + 4, 12, 6);
        }
      } else if (dir === 'left') {
        ctx.fillRect(offsetX + 4, offsetY + 1, 9, 3);
        ctx.fillRect(offsetX + 7, offsetY + 2, 5, 4);
        if (isFemale) {
          ctx.fillRect(offsetX + 8, offsetY + 4, 4, 6);
        }
      } else if (dir === 'right') {
        ctx.fillRect(offsetX + 3, offsetY + 1, 9, 3);
        ctx.fillRect(offsetX + 4, offsetY + 2, 5, 4);
        if (isFemale) {
          ctx.fillRect(offsetX + 4, offsetY + 4, 4, 6);
        }
      }
    }
  });

  return canvas;
}

// Renderiza a Laurla (Cabelo Ruivo, Pele Branca, Óculos Marrom, Roupa Preta)
export function createLaurlaSprite(): HTMLCanvasElement {
  return createCharacterSpriteSheet(
    '#d84315', // Cabelo Ruivo / Laranja Avermelhado FireRed
    '#ffdfd3', // Pele Branca / Clara
    '#5d4037', // Óculos Marrom
    '#212121', // Camisa/Blusa Preta
    '#121212', // Saia/Calça Preta
    true       // Feminino
  );
}

// Renderiza o Little Roger (Cabelo Preto, Pele Clara, Óculos Preto, Roupa Roxa)
export function createLittleRogerSprite(): HTMLCanvasElement {
  return createCharacterSpriteSheet(
    '#121212', // Cabelo Preto Puro (Sem boné)
    '#ffe0b2', // Pele Clara
    '#000000', // Óculos Preto
    '#7b1fa2', // Casaco/Roupa Roxa Elegante GBA
    '#212121', // Calça Escura
    false      // Masculino
  );
}

// Renderizador do Tilemap do Cenário (Paredes, Piso de Madeira, Tapete Vermelho, Quadros e Plantas)
export function createMapTileSet(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const tileSize = 32;
  canvas.width = tileSize * 8;
  canvas.height = tileSize * 4;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  // Tile 0: Piso de Madeira da Galeria
  ctx.fillStyle = '#b7814c';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#9c6638';
  // Tábuas de madeira
  ctx.fillRect(0, 15, 32, 2);
  ctx.fillRect(0, 31, 32, 1);
  ctx.fillRect(15, 0, 2, 15);
  ctx.fillRect(25, 16, 2, 15);

  // Tile 1: Tapete Vermelho Nobre (Centro)
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(32, 0, 32, 32);
  ctx.fillStyle = '#d32f2f';
  ctx.fillRect(34, 2, 28, 28);
  ctx.fillStyle = '#fdd835'; // Franja Amarela
  ctx.fillRect(32, 0, 32, 2);
  ctx.fillRect(32, 30, 32, 2);

  // Tile 2: Parede Topo (Tijolo Elegante GBA)
  ctx.fillStyle = '#37474f';
  ctx.fillRect(64, 0, 32, 32);
  ctx.fillStyle = '#455a64';
  ctx.fillRect(64, 0, 32, 20);
  ctx.fillStyle = '#263238'; // Sombra da parede
  ctx.fillRect(64, 20, 32, 12);
  // Rodapé decorativo de madeira
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(64, 28, 32, 4);

  // Tile 3: Quadro de Arte Elegante na Parede (Vazio)
  ctx.fillStyle = '#455a64';
  ctx.fillRect(96, 0, 32, 32);
  // Moldura Dourada
  ctx.fillStyle = '#fbc02d';
  ctx.fillRect(98, 4, 28, 22);
  ctx.fillStyle = '#fff9c4';
  ctx.fillRect(100, 6, 24, 18);
  // Pintura Pixel Art dentro do Quadro
  ctx.fillStyle = '#1e88e5';
  ctx.fillRect(102, 8, 20, 14);
  ctx.fillStyle = '#ffb300';
  ctx.beginPath();
  ctx.arc(108, 12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tile 4: Planta Decorativa em Vaso (Vaso com arbusto verde)
  ctx.fillStyle = '#b7814c'; // Chão de fundo
  ctx.fillRect(128, 0, 32, 32);
  // Vaso
  ctx.fillStyle = '#d84315';
  ctx.fillRect(134, 18, 20, 12);
  ctx.fillStyle = '#bf360c';
  ctx.fillRect(132, 16, 24, 3);
  // Arbusto
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.arc(144, 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.arc(142, 10, 6, 0, Math.PI * 2);
  ctx.fill();

  // Tile 5: Porta Secreta de Madeira Retro GBA (x = 160)
  ctx.fillStyle = '#37474f';
  ctx.fillRect(160, 0, 32, 32);
  // Moldura da porta
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(164, 4, 24, 28);
  // Painel de madeira da porta
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(166, 6, 20, 26);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(168, 8, 7, 10);
  ctx.fillRect(177, 8, 7, 10);
  ctx.fillRect(168, 20, 7, 10);
  ctx.fillRect(177, 20, 7, 10);
  // Maçaneta dourada pulsante
  ctx.fillStyle = '#fbc02d';
  ctx.fillRect(182, 18, 3, 3);

  // Tile 6: Quadro Secreto Trancado com Cadeado/Pano (x = 192)
  ctx.fillStyle = '#455a64';
  ctx.fillRect(192, 0, 32, 32);
  // Moldura Escura Trancada
  ctx.fillStyle = '#424242';
  ctx.fillRect(194, 4, 28, 22);
  ctx.fillStyle = '#212121';
  ctx.fillRect(196, 6, 24, 18);
  // Pano de mistério com ponto de interrogação
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(198, 8, 20, 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('?', 208, 20);

  return canvas;
}
