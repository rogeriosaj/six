/* ==========================================================================
   Ponto de Entrada Principal (Main Entry Point)
   ========================================================================== */

import './styles/game.css';
import { GameEngine } from './game/Engine';

window.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
