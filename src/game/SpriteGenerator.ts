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

// Renderizador de Sprites para os Cães Cait & Kora (Quadrupede 4 Patas, Preto com peito, patas e ponta do focinho brancos)
export function createDogSpriteSheet(isKora: boolean = false): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const frameWidth = 16;
  const frameHeight = 20;
  canvas.width = frameWidth * 3;
  canvas.height = frameHeight * 4;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  const directions: Direction[] = ['down', 'up', 'left', 'right'];
  const mainColor = '#1a1a1a'; // Corpo preto do cãozinho
  const whiteDetail = '#ffffff'; // Peito, patas e ponta do focinho brancos
  const collarColor = isKora ? '#29b6f6' : '#e91e63'; // Coleira azul para Kora, rosa para Cait

  directions.forEach((dir, dirIdx) => {
    for (let frameIdx = 0; frameIdx < 3; frameIdx++) {
      const offsetX = frameIdx * frameWidth;
      const offsetY = dirIdx * frameHeight;

      // Animação de caminhada de 4 patas (alternância de patas dianteiras e traseiras)
      let legOffsetFront1 = 0;
      let legOffsetFront2 = 0;
      let legOffsetBack1 = 0;
      let legOffsetBack2 = 0;

      if (frameIdx === 1) {
        legOffsetFront1 = -1;
        legOffsetBack2 = -1;
      } else if (frameIdx === 2) {
        legOffsetFront2 = -1;
        legOffsetBack1 = -1;
      }

      // 1. Sombra do Cachorro no Chão (Formato oval para corpo quadrupedal)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(offsetX + 2, offsetY + 16, 12, 3);

      if (dir === 'down') {
        // --- CÃO VIRADO PARA FRENTE (4 PATAS) ---
        // Patas Traseiras (atrás)
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 1, offsetY + 12 + legOffsetBack1, 3, 4);
        ctx.fillRect(offsetX + 12, offsetY + 12 + legOffsetBack2, 3, 4);
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 1, offsetY + 15 + legOffsetBack1, 3, 1);
        ctx.fillRect(offsetX + 12, offsetY + 15 + legOffsetBack2, 3, 1);

        // Corpo Quadrupede
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 7, 10, 6);

        // Peito Branco no centro da caixa torácica
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 6, offsetY + 8, 4, 5);

        // Patas Dianteiras (na frente)
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 4, offsetY + 12 + legOffsetFront1, 3, 5);
        ctx.fillRect(offsetX + 9, offsetY + 12 + legOffsetFront2, 3, 5);
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 4, offsetY + 16 + legOffsetFront1, 3, 1);
        ctx.fillRect(offsetX + 9, offsetY + 16 + legOffsetFront2, 3, 1);

        // Coleira
        ctx.fillStyle = collarColor;
        ctx.fillRect(offsetX + 4, offsetY + 6, 8, 1);

        // Cabeça
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 4, offsetY + 1, 8, 5);

        // Orelhas de cão caídas
        ctx.fillRect(offsetX + 2, offsetY + 2, 2, 4);
        ctx.fillRect(offsetX + 12, offsetY + 2, 2, 4);

        // Olhos brilhantes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 5, offsetY + 2, 1, 2);
        ctx.fillRect(offsetX + 10, offsetY + 2, 1, 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 5, offsetY + 3, 1, 1);
        ctx.fillRect(offsetX + 10, offsetY + 3, 1, 1);

        // Focinho com ponta BRANCA e nariz preto
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 6, offsetY + 4, 4, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(offsetX + 7, offsetY + 4, 2, 1);

        // Rabo feliz abanando no lado
        ctx.fillStyle = mainColor;
        const tailWag = (frameIdx % 2 === 0) ? -1 : 1;
        ctx.fillRect(offsetX + 12, offsetY + 6 + tailWag, 2, 4);

      } else if (dir === 'up') {
        // --- CÃO VIRADO PARA TRÁS (4 PATAS) ---
        // 4 Patas no chão
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 12 + legOffsetFront1, 3, 5);
        ctx.fillRect(offsetX + 10, offsetY + 12 + legOffsetFront2, 3, 5);
        ctx.fillRect(offsetX + 1, offsetY + 11 + legOffsetBack1, 3, 5);
        ctx.fillRect(offsetX + 12, offsetY + 11 + legOffsetBack2, 3, 5);

        // Pontas das 4 patas brancas
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 3, offsetY + 16 + legOffsetFront1, 3, 1);
        ctx.fillRect(offsetX + 10, offsetY + 16 + legOffsetFront2, 3, 1);
        ctx.fillRect(offsetX + 1, offsetY + 15 + legOffsetBack1, 3, 1);
        ctx.fillRect(offsetX + 12, offsetY + 15 + legOffsetBack2, 3, 1);

        // Corpo Quadrupede
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 6, 10, 7);

        // Cabeça de costas
        ctx.fillRect(offsetX + 4, offsetY + 1, 8, 5);
        ctx.fillRect(offsetX + 2, offsetY + 2, 2, 4);
        ctx.fillRect(offsetX + 12, offsetY + 2, 2, 4);

        // Rabo em pé abanando
        const tailWag = (frameIdx % 2 === 0) ? -1 : 1;
        ctx.fillRect(offsetX + 7 + tailWag, offsetY + 4, 2, 5);

      } else if (dir === 'left') {
        // --- CÃO DE PERFIL ESQUERDO (4 PATAS) ---
        // 4 Pernas de cão (2 dianteiras na esquerda, 2 traseiras na direita)
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 2, offsetY + 12 + legOffsetFront1, 2, 5); // Dianteira esq
        ctx.fillRect(offsetX + 4, offsetY + 12 + legOffsetFront2, 2, 5); // Dianteira dir
        ctx.fillRect(offsetX + 9, offsetY + 12 + legOffsetBack1, 2, 5);  // Traseira esq
        ctx.fillRect(offsetX + 11, offsetY + 12 + legOffsetBack2, 2, 5); // Traseira dir

        // Pontas das 4 patas BRANCAS
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 2, offsetY + 16 + legOffsetFront1, 2, 1);
        ctx.fillRect(offsetX + 4, offsetY + 16 + legOffsetFront2, 2, 1);
        ctx.fillRect(offsetX + 9, offsetY + 16 + legOffsetBack1, 2, 1);
        ctx.fillRect(offsetX + 11, offsetY + 16 + legOffsetBack2, 2, 1);

        // Corpo Quadrupede esticado de lado
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 7, 10, 6);

        // Peito Branco na frente (esquerda da caixa torácica)
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 2, offsetY + 8, 3, 4);

        // Coleira
        ctx.fillStyle = collarColor;
        ctx.fillRect(offsetX + 4, offsetY + 6, 2, 3);

        // Cabeça na esquerda
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 1, offsetY + 2, 6, 5);

        // Orelha caída
        ctx.fillRect(offsetX + 5, offsetY + 2, 2, 4);

        // Olho
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 2, offsetY + 3, 1, 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 2, offsetY + 4, 1, 1);

        // Focinho virado para a esquerda com ponta BRANCA e nariz preto
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 0, offsetY + 5, 3, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(offsetX + 0, offsetY + 5, 1, 1);

        // Rabo na direita erguido abanando
        ctx.fillStyle = mainColor;
        const tailWag = (frameIdx % 2 === 0) ? -1 : 1;
        ctx.fillRect(offsetX + 12, offsetY + 5 + tailWag, 3, 2);

      } else if (dir === 'right') {
        // --- CÃO DE PERFIL DIREITO (4 PATAS) ---
        // 4 Pernas de cão (2 traseiras na esquerda, 2 dianteiras na direita)
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 12 + legOffsetBack1, 2, 5);  // Traseira esq
        ctx.fillRect(offsetX + 5, offsetY + 12 + legOffsetBack2, 2, 5);  // Traseira dir
        ctx.fillRect(offsetX + 10, offsetY + 12 + legOffsetFront1, 2, 5); // Dianteira esq
        ctx.fillRect(offsetX + 12, offsetY + 12 + legOffsetFront2, 2, 5); // Dianteira dir

        // Pontas das 4 patas BRANCAS
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 3, offsetY + 16 + legOffsetBack1, 2, 1);
        ctx.fillRect(offsetX + 5, offsetY + 16 + legOffsetBack2, 2, 1);
        ctx.fillRect(offsetX + 10, offsetY + 16 + legOffsetFront1, 2, 1);
        ctx.fillRect(offsetX + 12, offsetY + 16 + legOffsetFront2, 2, 1);

        // Corpo Quadrupede esticado de lado
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 3, offsetY + 7, 10, 6);

        // Peito Branco na frente (direita da caixa torácica)
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 11, offsetY + 8, 3, 4);

        // Coleira
        ctx.fillStyle = collarColor;
        ctx.fillRect(offsetX + 10, offsetY + 6, 2, 3);

        // Cabeça na direita
        ctx.fillStyle = mainColor;
        ctx.fillRect(offsetX + 9, offsetY + 2, 6, 5);

        // Orelha caída
        ctx.fillRect(offsetX + 9, offsetY + 2, 2, 4);

        // Olho
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetX + 13, offsetY + 3, 1, 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(offsetX + 13, offsetY + 4, 1, 1);

        // Focinho virado para a direita com ponta BRANCA e nariz preto
        ctx.fillStyle = whiteDetail;
        ctx.fillRect(offsetX + 13, offsetY + 5, 3, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(offsetX + 15, offsetY + 5, 1, 1);

        // Rabo na esquerda erguido abanando
        ctx.fillStyle = mainColor;
        const tailWag = (frameIdx % 2 === 0) ? -1 : 1;
        ctx.fillRect(offsetX + 1, offsetY + 5 + tailWag, 3, 2);
      }
    }
  });

  return canvas;
}


export type AnimalType = 'bird' | 'rat' | 'cat' | 'squirrel' | 'luna';

// Renderiza Sprites dos Animais Selvagens para Batalha Pokémon
export function createAnimalSprite(type: AnimalType): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  if (type === 'bird') {
    // Passarinho estilo Pidgey
    ctx.fillStyle = '#d84315'; // Cabeça/Asas Castanho avermelhado
    ctx.fillRect(14, 10, 20, 20);
    ctx.fillStyle = '#fff8e1'; // Peito amarelado
    ctx.fillRect(18, 18, 12, 12);
    ctx.fillStyle = '#ffb300'; // Bico amarelo
    ctx.fillRect(8, 16, 6, 4);
    ctx.fillStyle = '#000000'; // Olho
    ctx.fillRect(16, 14, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, 14, 1, 1);
    ctx.fillStyle = '#8d6e63'; // Asas estendidas
    ctx.fillRect(26, 14, 14, 10);
    ctx.fillRect(30, 24, 6, 8); // Rabo
  } else if (type === 'rat') {
    // Ratinho estilo Rattata
    ctx.fillStyle = '#7b1fa2'; // Ratinho Roxo
    ctx.fillRect(10, 18, 26, 16);
    ctx.fillStyle = '#ea80fc'; // Orelhas
    ctx.fillRect(12, 10, 6, 8);
    ctx.fillRect(20, 10, 6, 8);
    ctx.fillStyle = '#ffffff'; // Dentes/Peito
    ctx.fillRect(8, 26, 4, 4);
    ctx.fillStyle = '#000000'; // Olho
    ctx.fillRect(14, 20, 3, 3);
    ctx.fillStyle = '#ba68c8'; // Rabo espiral
    ctx.fillRect(34, 16, 8, 3);
    ctx.fillRect(40, 12, 3, 6);
  } else if (type === 'cat') {
    // Gatinho Selvagem Laranja
    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(12, 16, 24, 18);
    ctx.fillStyle = '#e65100';
    ctx.fillRect(18, 16, 3, 8);
    ctx.fillRect(26, 16, 3, 8);
    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(12, 10, 6, 6);
    ctx.fillRect(30, 10, 6, 6);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(16, 20, 4, 4);
    ctx.fillRect(28, 20, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(18, 21, 1, 2);
    ctx.fillRect(30, 21, 1, 2);
  } else if (type === 'luna') {
    // Luna - A Gatinha Branca Elegante
    ctx.fillStyle = '#ffffff'; // Pelagem Branca Neve
    ctx.fillRect(12, 16, 24, 18);
    // Orelhas pontudas brancas com interior rosa fofo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 10, 6, 6);
    ctx.fillRect(30, 10, 6, 6);
    ctx.fillStyle = '#ff80ab'; // Rosa interno das orelhas
    ctx.fillRect(14, 12, 2, 4);
    ctx.fillRect(32, 12, 2, 4);
    // Olhos azuis cristalinos brilhantes
    ctx.fillStyle = '#00b0ff';
    ctx.fillRect(16, 20, 4, 4);
    ctx.fillRect(28, 20, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(18, 21, 1, 2);
    ctx.fillRect(30, 21, 1, 2);
    // Narizinho rosa
    ctx.fillStyle = '#ff4081';
    ctx.fillRect(23, 24, 2, 2);
    // Rabo branco felpudo erguido
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(36, 12, 4, 16);
    ctx.fillRect(40, 8, 4, 6);
  } else {
    // Esquilo fofo com rabo grande
    ctx.fillStyle = '#8d6e63'; // Corpo marrom
    ctx.fillRect(16, 18, 18, 18);
    ctx.fillStyle = '#d7ccc8'; // Barriga
    ctx.fillRect(18, 22, 10, 12);
    ctx.fillStyle = '#5d4037'; // Rabo enorme felpudo
    ctx.fillRect(32, 10, 12, 22);
    ctx.fillRect(28, 6, 12, 10);
    ctx.fillStyle = '#000000'; // Olho preto grande
    ctx.fillRect(20, 14, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(21, 14, 1, 1);
  }

  return canvas;
}


// Renderizador do Tilemap do Cenário (Paredes, Piso de Madeira, Tapete Vermelho, Quadros, Plantas e ÁREA EXTERNA POKÉMON FIRE RED)
export function createMapTileSet(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const tileSize = 32;
  // 14 Tiles no total (8 colunas x 2 linhas)
  canvas.width = tileSize * 8;
  canvas.height = tileSize * 4;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;

  // Tile 0: Piso de Madeira da Galeria
  ctx.fillStyle = '#b7814c';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#9c6638';
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
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(64, 28, 32, 4);

  // Tile 3: Quadro de Arte Elegante na Parede (Vazio)
  ctx.fillStyle = '#455a64';
  ctx.fillRect(96, 0, 32, 32);
  ctx.fillStyle = '#fbc02d';
  ctx.fillRect(98, 4, 28, 22);
  ctx.fillStyle = '#fff9c4';
  ctx.fillRect(100, 6, 24, 18);
  ctx.fillStyle = '#1e88e5';
  ctx.fillRect(102, 8, 20, 14);
  ctx.fillStyle = '#ffb300';
  ctx.beginPath();
  ctx.arc(108, 12, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tile 4: Planta Decorativa em Vaso
  ctx.fillStyle = '#b7814c';
  ctx.fillRect(128, 0, 32, 32);
  ctx.fillStyle = '#d84315';
  ctx.fillRect(134, 18, 20, 12);
  ctx.fillStyle = '#bf360c';
  ctx.fillRect(132, 16, 24, 3);
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
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(164, 4, 24, 28);
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(166, 6, 20, 26);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(168, 8, 7, 10);
  ctx.fillRect(177, 8, 7, 10);
  ctx.fillRect(168, 20, 7, 10);
  ctx.fillRect(177, 20, 7, 10);
  ctx.fillStyle = '#fbc02d';
  ctx.fillRect(182, 18, 3, 3);

  // Tile 6: Quadro Secreto Trancado (x = 192)
  ctx.fillStyle = '#455a64';
  ctx.fillRect(192, 0, 32, 32);
  ctx.fillStyle = '#424242';
  ctx.fillRect(194, 4, 28, 22);
  ctx.fillStyle = '#212121';
  ctx.fillRect(196, 6, 24, 18);
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(198, 8, 20, 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('?', 208, 20);

  // Tile 7: Gramado Externo estilo Pokémon Fire Red (x = 224, y = 0)
  ctx.fillStyle = '#55a846'; // Verde Grama Vibrante FireRed
  ctx.fillRect(224, 0, 32, 32);
  ctx.fillStyle = '#48963a'; // Detalhes de grama
  ctx.fillRect(228, 6, 4, 4);
  ctx.fillRect(246, 18, 4, 4);
  ctx.fillRect(234, 24, 4, 4);

  // Tile 8: Grama Alta / Arbusto com Encontro de Animais (x = 0, y = 32)
  ctx.fillStyle = '#55a846';
  ctx.fillRect(0, 32, 32, 32);
  // Folhas de arbusto escuro estilo Pokémon
  ctx.fillStyle = '#2c7521';
  ctx.fillRect(2, 36, 12, 12);
  ctx.fillRect(18, 34, 12, 12);
  ctx.fillRect(8, 48, 14, 12);
  ctx.fillStyle = '#6ec75c'; // Brilhos nas pontas dos arbustos
  ctx.fillRect(4, 38, 4, 4);
  ctx.fillRect(20, 36, 4, 4);
  ctx.fillRect(10, 50, 4, 4);

  // Tile 9: Árvore Frondosa Topo (x = 32, y = 32)
  ctx.fillStyle = '#55a846';
  ctx.fillRect(32, 32, 32, 32);
  ctx.fillStyle = '#1e5a17';
  ctx.fillRect(34, 34, 28, 28);
  ctx.fillStyle = '#2c7521';
  ctx.fillRect(36, 36, 24, 24);
  ctx.fillStyle = '#48963a';
  ctx.fillRect(40, 40, 16, 16);

  // Tile 10: Tronco da Árvore (x = 64, y = 32)
  ctx.fillStyle = '#55a846';
  ctx.fillRect(64, 32, 32, 32);
  ctx.fillStyle = '#5d4037'; // Madeira
  ctx.fillRect(74, 32, 12, 32);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(74, 32, 3, 32);

  // Tile 11: Canteiro de Flores (x = 96, y = 32)
  ctx.fillStyle = '#55a846';
  ctx.fillRect(96, 32, 32, 32);
  // Flores vermelhas e brancas
  ctx.fillStyle = '#e91e63';
  ctx.fillRect(100, 38, 6, 6);
  ctx.fillRect(116, 46, 6, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(102, 40, 2, 2);
  ctx.fillRect(118, 48, 2, 2);
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(112, 36, 6, 6);
  ctx.fillRect(104, 52, 6, 6);

  // Tile 12: Caminho de Terra (x = 128, y = 32)
  ctx.fillStyle = '#d7ccc8'; // Terra Clara
  ctx.fillRect(128, 32, 32, 32);
  ctx.fillStyle = '#bcaaa4';
  ctx.fillRect(132, 36, 6, 4);
  ctx.fillRect(146, 50, 8, 4);

  // Tile 13: Portal de Saída para o Jardim Externo (x = 160, y = 32)
  ctx.fillStyle = '#37474f';
  ctx.fillRect(160, 32, 32, 32);
  ctx.fillStyle = '#4caf50'; // Luz da natureza
  ctx.fillRect(164, 36, 24, 28);
  ctx.fillStyle = '#81c784';
  ctx.fillRect(168, 40, 16, 24);

  // Tile 14: Rio / Água Cristalina estilo Pokémon (x = 192, y = 32)
  ctx.fillStyle = '#1e88e5'; // Azul Água
  ctx.fillRect(192, 32, 32, 32);
  ctx.fillStyle = '#1565c0';
  ctx.fillRect(192, 32, 32, 4);
  ctx.fillRect(192, 48, 32, 4);
  // Brilho de ondas cristalinas
  ctx.fillStyle = '#bbdefb';
  ctx.fillRect(196, 38, 8, 2);
  ctx.fillRect(212, 44, 10, 2);
  ctx.fillRect(202, 54, 6, 2);

  // Tile 15: Ponte de Madeira sobre o Rio (x = 224, y = 32)
  ctx.fillStyle = '#1e88e5'; // Água por baixo
  ctx.fillRect(224, 32, 32, 32);
  // Tábuas de madeira da ponte
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(224, 36, 32, 24);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(224, 42, 32, 2);
  ctx.fillRect(224, 48, 32, 2);
  ctx.fillRect(224, 54, 32, 2);
  // Corrimão/Guard-rail de madeira
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(224, 34, 32, 3);
  ctx.fillRect(224, 59, 32, 3);

  return canvas;
}


