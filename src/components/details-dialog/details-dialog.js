import './details-dialog.css';

export class DetailsDialog {
  constructor() {
    this.dialog = null;
    this.init();
  }

  init() {
    // Create dialog element if it doesn't exist
    if (!document.querySelector('.details-dialog')) {
      this.dialog = document.createElement('dialog');
      this.dialog.className = 'details-dialog';

      this.dialog.innerHTML = `
        <div class="details-dialog__content">
          <div class="details-dialog__header">
            <h2 class="details-dialog__title"></h2>
            <button class="details-dialog__close" aria-label="Close details">×</button>
          </div>
          <div class="details-dialog__body"></div>
        </div>
      `;

      document.body.appendChild(this.dialog);
      this.attachEventListeners();
    } else {
      this.dialog = document.querySelector('.details-dialog');
      this.attachEventListeners();
    }
  }

  attachEventListeners() {
    const closeBtn = this.dialog.querySelector('.details-dialog__close');
    closeBtn.addEventListener('click', () => this.close());

    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) {
        this.close();
      }
    });
  }

  setTitle(title) {
    const titleEl = this.dialog.querySelector('.details-dialog__title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  setContent(htmlContent) {
    const bodyEl = this.dialog.querySelector('.details-dialog__body');
    if (bodyEl) {
      bodyEl.innerHTML = htmlContent;
    }
  }

  open() {
    if (this.dialog) {
      this.dialog.showModal();
    }
  }

  close() {
    if (this.dialog) {
      this.dialog.close();
    }
  }
}
