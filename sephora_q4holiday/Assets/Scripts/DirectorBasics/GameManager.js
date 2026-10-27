class GameManager {
  constructor() {
    // set le nombre de differents objet
    // crée en random les paires

    this._squareNumber = 16;
    this._pairs = [];

    this.generatePair();
    print("pairs :" + this._pairs);

    this._status = "no"; // flip_1, flip_2

    this._flip_1 = null;
    this._flip_2 = null;
  }

  generatePair() {
    this._pairs = [];

    const pairNumber = this._squareNumber / 2;

    for (let pairId = 1; pairId <= pairNumber; pairId++) {
      this._pairs.push(pairId, pairId);
    }

    // Mélange de Fisher-Yates
    for (let i = this._pairs.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const currentPair = this._pairs[i];

      this._pairs[i] = this._pairs[randomIndex];
      this._pairs[randomIndex] = currentPair;
    }

    return this._pairs;
  }

  Reset() {
    this._anims.fade.Reset();
  }
}

global.GameManager = new GameManager();
