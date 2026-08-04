/* ==========================================================================
   Gerenciador do Modal de Memórias dos Quadros (Pokédex/Fire Red Style)
   ========================================================================== */

import { Memory } from '../data/memories';
import { sound } from '../game/Audio';

export class MemoryModal {
  private modalEl: HTMLElement;
  private titleEl: HTMLElement;
  private imageEl: HTMLImageElement;
  private dateEl: HTMLElement;
  private descriptionEl: HTMLElement;
  private closeBtnX: HTMLElement;
  private closeBtnAction: HTMLElement;

  private isVisible: boolean = false;
  private onCloseCallback: (() => void) | null = null;

  constructor() {
    this.modalEl = document.getElementById('memory-modal')!;
    this.titleEl = document.getElementById('memory-title')!;
    this.imageEl = document.getElementById('memory-image') as HTMLImageElement;
    this.dateEl = document.getElementById('memory-date')!;
    this.descriptionEl = document.getElementById('memory-description')!;
    this.closeBtnX = document.getElementById('memory-close-x')!;
    this.closeBtnAction = document.getElementById('memory-btn-close')!;

    this.bindEvents();
  }

  private bindEvents() {
    const handleClose = () => this.close();
    this.closeBtnX.addEventListener('click', handleClose);
    this.closeBtnAction.addEventListener('click', handleClose);
  }

  public open(memory: Memory, onClose?: () => void) {
    this.titleEl.textContent = memory.title;
    
    // Trata erro de carregamento caso o arquivo de foto ainda não tenha sido colocado na pasta
    this.imageEl.onerror = () => {
      this.imageEl.src = `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
          <rect width="320" height="200" fill="#2c3e50" />
          <text x="160" y="90" font-family="monospace" font-size="36" text-anchor="middle" fill="#ffffff">🖼️</text>
          <text x="160" y="130" font-family="monospace" font-size="11" text-anchor="middle" fill="#ecf0f1">Coloque a foto em public/images/</text>
        </svg>
      `)}`;
    };
    this.imageEl.src = memory.image;

    this.dateEl.textContent = memory.date;
    this.descriptionEl.textContent = memory.description;
    this.onCloseCallback = onClose || null;

    this.modalEl.classList.remove('hidden');
    this.isVisible = true;

    sound.playOpenModal();
  }

  public close() {
    if (!this.isVisible) return;
    this.modalEl.classList.add('hidden');
    this.isVisible = false;
    sound.playCancel();

    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  public isOpen(): boolean {
    return this.isVisible;
  }
}
