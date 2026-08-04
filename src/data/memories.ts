export interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

// Gerador de ilustrações SVG demonstrativas (fallback caso a foto local ainda não tenha sido adicionada)
function createMemoryIllustration(title: string, color1: string, color2: string, iconSymbol: string): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#bg)" />
    <rect x="10" y="10" width="300" height="180" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="8 4" opacity="0.6" />
    <rect x="16" y="16" width="288" height="168" fill="rgba(0,0,0,0.2)" />
    <text x="160" y="110" font-family="sans-serif" font-size="64" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.5))">
      ${iconSymbol}
    </text>
    <rect x="20" y="150" width="280" height="30" fill="rgba(0,0,0,0.6)" rx="4" />
    <text x="160" y="170" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">
      ${title.toUpperCase()}
    </text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ==========================================================================
   CONFIGURAÇÃO DAS MEMÓRIAS DOS QUADROS
   Para alterar as fotos, coloque as suas imagens na pasta 'public/images/'
   e ajuste o caminho no campo 'image' abaixo (ex: './images/quadro1.jpg').
   ========================================================================== */

export const MEMORIES: Memory[] = [
  {
    id: 0,
    title: "Frô de Lego",
    date: "1 de Fevereiro",
    description: "O dia em que a Laurla conheceu o Little Roger e inesperadamente ganhou uma flor de Lego, sem saber que Little Roger estava quase passando mal.",
    image: "./images/flor.jpeg" // Altere para a sua foto em public/images/quadro1.jpg
  },
  {
    id: 1,
    title: "Um pequeno imprevisto",
    date: "13 de Abril",
    description: "O que era para ser uma inofensiva dipirona para um estado febril acabou trazendo um susto vermelho e inchado k k k",
    image: "./images/maoqueimada.jpeg"
  },
  {
    id: 2,
    title: "Tutorial foda",
    date: "21 de Fevereiro",
    description: "Um tutorial via whatsapp totalmente inesperado, não imaginei que aprenderia a fazer triângulos perfeitos com guardanapo, valeeeu",
    image: "./images/tutorial.jpeg"
  },
  {
    id: 3,
    title: "Subway mocorongo",
    date: "30 de Junho",
    description: "O dia em que ficamos mais de 40 MINUTOS na fila so subway...só para a moça falar que acabou o pão na nossa vez! Voto de nunca mais retornar, apenas para usar o banheiro.",
    image: "./images/subway.jpeg"
  },
  {
    id: 4,
    title: "1 mês de academia concluído",
    date: "4 de Julho",
    description: "Recompensa mais que merecida por concluirmos o primeiro mês de treino 100%, com musculação E caminhadas quase todos os dias!",
    image: "./images/lamen2.jpeg"
  },
  {
    id: 5,
    title: "Rockzin",
    date: "10 de Julho",
    description: "Registro bem formal do primeiro dia do Rock Rio Pardo, que foi muito bão.",
    image: "./images/rock.jpeg"
  }
];

export function loadMemories(): Memory[] {
  // Retorna as memórias dos arquivos
  return MEMORIES.map((m, idx) => {
    // Se a imagem não for encontrada ou for um caminho relativo padrão, tem o fallback retro
    return {
      ...m,
      // Caso queira usar o fallback SVG enquanto a imagem não estiver presente, basta substituir se falhar
    };
  });
}
