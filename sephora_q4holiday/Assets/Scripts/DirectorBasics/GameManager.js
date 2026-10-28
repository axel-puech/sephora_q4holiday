class GameManager {
  constructor() {
    this._squareNumber = 16;
    this._shuffle = true;
    this._pairs = [];

    this._remainingTime = 0;
    this._score = 0;
  }

  getPairNumber() {
    return this._squareNumber / 2;
  }

  generatePair() {
    this._pairs = [];

    for (let pairId = 1; pairId <= this.getPairNumber(); pairId++) {
      this._pairs.push(pairId, pairId);
    }

    // Mélange de Fisher-Yates
    if (this._shuffle) {
      for (let i = this._pairs.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const currentPair = this._pairs[i];

        this._pairs[i] = this._pairs[randomIndex];
        this._pairs[randomIndex] = currentPair;
      }
    }

    return this._pairs;
  }
}

global.GameManager = new GameManager();
