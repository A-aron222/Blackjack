/* =======================
   DOM REFERENCES
======================= */
const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");

const dealerScoreEl = document.getElementById("dealer-score");
const playerScoreEl = document.getElementById("player-score");

const bankEl = document.getElementById("bank-amount");
const betEl = document.getElementById("bet-amount");
const resultEl = document.getElementById("result-text");

const hitBtn = document.getElementById("Button-hit");
const standBtn = document.getElementById("Button-stand");
const dealBtn = document.getElementById("Button-deal");
const doubleBtn = document.getElementById("Button-double");
const splitBtn = document.getElementById("Button-split");

const clearBetBtn = document.getElementById("Button-clear-bet");
const rebetBtn = document.getElementById("Button-rebet");
const doubleRebetBtn = document.getElementById("Button-double-rebet");
const tripleRebetBtn = document.getElementById("Button-triple-rebet");

const chips = document.querySelectorAll(".chip");
const safeBankAmountEl = document.getElementById("safe-bank-amount");

const helpModal = document.getElementById("help-modal");
document.getElementById("menu-help").onclick = () => helpModal.style.display = "flex";
document.getElementById("close-help").onclick = () => helpModal.style.display = "none";
document.getElementById("help-close-Button").onclick = () => helpModal.style.display = "none";

const modalCloseBtn = document.getElementById("modal-close");
if (modalCloseBtn) {
  modalCloseBtn.onclick = () => {
    document.getElementById("game-modal").style.display = "none";
  };
}

function resetTableOnly() {
  deck = [];
  dealerHand = [];
  playerHand = [];
  playerSplitHand = [];

  currentBet = 0;
  handBets = [0, 0];
  gameActive = false;
  isSplitActive = false;
  currentHandIndex = 0;

  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";
  playerSplitCardsEl.innerHTML = "";
  playerSplitArea.style.display = "none";

  dealerScoreEl.textContent = "0";
  playerScoreEl.textContent = "0";
  playerSplitScoreEl.textContent = "0";
  resultEl.textContent = "-";

  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  splitBtn.disabled = true;
  dealBtn.disabled = true;

  updateActiveHandUI();
  updateMoney();
}

/* =======================
   GAME STATE
======================= */
let deck = [];
let dealerHand = [];
let playerHand = [];

let bank = 1000;
let safeBank = 0;
let currentBet = 0;
let lastBet = 0;
let gameActive = false;

let handBets = [0, 0];

function getTotalActiveBet() {
  return handBets[0] + handBets[1];
}

/* =======================
   DECK LOGIC
======================= */
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const newDeck = [];

  for (let suit of suits) {
    for (let value of values) {
      newDeck.push({ suit, value });
    }
  }
  return newDeck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard() {
  if (deck.length === 0) {
    deck = createDeck();
    shuffle(deck);
  }
  return deck.pop();
}

/* =======================
   SCORING
======================= */
function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === "A") {
      aces++;
      score += 11;
    } else if (["K", "Q", "J"].includes(card.value)) {
      score += 10;
    } else {
      score += parseInt(card.value);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

function isNaturalBlackjack(hand) {
  return hand.length === 2 && calculateScore(hand) === 21;
}

function checkInitialBlackjack() {
  const playerBlackjack = isNaturalBlackjack(playerHand);
  const dealerBlackjack = isNaturalBlackjack(dealerHand);

  if (!playerBlackjack && !dealerBlackjack) {
    return false;
  }

  renderCards(dealerCardsEl, dealerHand);
  updateScores(true);

  const mainBet = handBets[0];

  if (playerBlackjack && dealerBlackjack) {
    bank += mainBet;
    endRound("Both have blackjack. Push.");
  } else if (playerBlackjack) {
    bank += mainBet * 2.5;
    endRound("Blackjack! You win 3:2.");
  } else {
    endRound("Dealer has blackjack. Dealer wins.");
  }

  return true;
}

/* =======================
   PIP LAYOUTS
   Each array entry is [col, row] in a 3-col x 7-row grid (1-indexed)
   col: 1=left, 2=center, 3=right
   row: 1=top ... 7=bottom
======================= */
const PIP_LAYOUTS = {
  "A": [[2, 4]],
  "2": [[2, 1], [2, 7]],
  "3": [[2, 1], [2, 4], [2, 7]],
  "4": [[1, 1], [3, 1], [1, 7], [3, 7]],
  "5": [[1, 1], [3, 1], [2, 4], [1, 7], [3, 7]],
  "6": [[1, 1], [3, 1], [1, 4], [3, 4], [1, 7], [3, 7]],
  "7": [[1, 1], [3, 1], [2, 2.5], [1, 4], [3, 4], [1, 7], [3, 7]],
  "8": [[1, 1], [3, 1], [2, 2.5], [1, 4], [3, 4], [2, 5.5], [1, 7], [3, 7]],
  "9": [[1, 1], [3, 1], [1, 3], [3, 3], [2, 4], [1, 5], [3, 5], [1, 7], [3, 7]],
  "10": [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3], [1, 5], [3, 5], [2, 6], [1, 7], [3, 7]],
};

/* =======================
   CARD RENDERING
======================= */
function createCardElement(card, hidden = false) {
  const div = document.createElement("div");

  if (hidden) {
    div.className = "card card-back";
    return div;
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const colorClass = isRed ? "red" : "";
  div.className = "card";

  const isFaceCard = ["J", "Q", "K", "A"].includes(card.value);

  if (isFaceCard) {
    div.innerHTML = `
      <span class="card-corner top-left ${colorClass}">${card.value}<br>${card.suit}</span>
      <span class="card-center-suit ${colorClass}">${card.suit}</span>
      <span class="card-corner bottom-right ${colorClass}">${card.value}<br>${card.suit}</span>
    `;
  } else {
    const layout = PIP_LAYOUTS[card.value];
    const pipsHtml = layout.map(([col, row]) => {
      const x = col === 1 ? 20 : col === 2 ? 50 : 80;
      const y = 15 + ((row - 1) / 6) * 70;
      const flipClass = row > 4 ? "pip-flip" : "";
      return `<span class="pip ${colorClass} ${flipClass}" style="left:${x}%;top:${y}%">${card.suit}</span>`;
    }).join("");

    div.innerHTML = `
      <span class="card-corner top-left ${colorClass}">${card.value}<br>${card.suit}</span>
      <div class="pip-field">${pipsHtml}</div>
      <span class="card-corner bottom-right ${colorClass}">${card.value}<br>${card.suit}</span>
    `;
  }

  return div;
}

function renderCards(container, hand, hideLastN = 0) {
  container.innerHTML = "";
  hand.forEach((card, index) => {
    const isHidden = index >= hand.length - hideLastN;
    const el = createCardElement(card, isHidden);
    container.appendChild(el);
  });
}

// Append a single card element to a container and animate it
function appendAnimatedCard(container, card, hidden = false) {
  const el = createCardElement(card, hidden);
  container.appendChild(el);
  el.classList.add("dealing");
  el.addEventListener("animationend", () => el.classList.remove("dealing"), { once: true });
}

// Deal opening 4 cards one at a time: player1, dealer1, player2, dealer2 (face down)
function dealOpeningCards() {
  return new Promise(resolve => {
    const DELAY = 320;

    // Card 1: player card 1
    setTimeout(() => {
      playerCardsEl.innerHTML = "";
      appendAnimatedCard(playerCardsEl, playerHand[0]);
      updateScores(false);
    }, DELAY * 0);

    // Card 2: dealer card 1 (face up)
    setTimeout(() => {
      dealerCardsEl.innerHTML = "";
      appendAnimatedCard(dealerCardsEl, dealerHand[0]);
    }, DELAY * 1);

    // Card 3: player card 2
    setTimeout(() => {
      appendAnimatedCard(playerCardsEl, playerHand[1]);
      updateScores(false);
    }, DELAY * 2);

    // Card 4: dealer card 2 (face down)
    setTimeout(() => {
      appendAnimatedCard(dealerCardsEl, dealerHand[1], true);
      resolve();
    }, DELAY * 3);
  });
}

// Deal dealer extra cards one at a time, drawing each card just before animating it
function dealDealerCards() {
  return new Promise(resolve => {
    const ANIM_DURATION = 400;
    const INTERVAL = ANIM_DURATION + 100; // wait for animation to finish + small gap

    function dealNext() {
      if (calculateScore(dealerHand) >= 17) {
        setTimeout(resolve, ANIM_DURATION);
        return;
      }
      setTimeout(() => {
        const card = drawCard();
        dealerHand.push(card);
        appendAnimatedCard(dealerCardsEl, card);
        updateScores(true);
        dealNext();
      }, INTERVAL);
    }
    dealNext();
  });
}

function updateScores(showDealer = false) {
  playerScoreEl.textContent = calculateScore(playerHand);
  dealerScoreEl.textContent = showDealer ? calculateScore(dealerHand) : dealerHand.length ? "?" : 0;
}

function updateMoney() {
  const displayedBet = gameActive ? getTotalActiveBet() : currentBet;

  bankEl.textContent = `$${bank.toFixed(2)}`;
  betEl.textContent = `$${displayedBet.toFixed(2)}`;
  safeBankAmountEl.textContent = `$${safeBank.toFixed(2)}`;
  chips.forEach(chip => {
    chip.classList.toggle("disabled", gameActive);
  });
}

/* =======================
   BETTING
======================= */
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    if (gameActive) return;
    const value = parseFloat(chip.dataset.value);
    if (bank >= value) {
      bank = Math.round((bank - value) * 100) / 100;
      currentBet = Math.round((currentBet + value) * 100) / 100;
      updateMoney();
      dealBtn.disabled = false;
    }
  });
});

clearBetBtn.onclick = () => {
  if (gameActive) return;
  bank = Math.round((bank + currentBet) * 100) / 100;
  currentBet = 0;
  dealBtn.disabled = true;
  updateMoney();
};

rebetBtn.onclick = () => {
  if (gameActive || lastBet <= 0) return;

  bank += currentBet;
  currentBet = 0;

  if (lastBet > bank) return;

  bank -= lastBet;
  currentBet = lastBet;
  dealBtn.disabled = false;
  updateMoney();
};

doubleRebetBtn.onclick = () => {
  if (gameActive || lastBet <= 0) return;

  bank += currentBet;
  currentBet = 0;

  if (lastBet * 2 > bank) return;

  bank -= lastBet * 2;
  currentBet = lastBet * 2;
  dealBtn.disabled = false;
  updateMoney();
};

tripleRebetBtn.onclick = () => {
  if (gameActive || lastBet <= 0) return;

  bank += currentBet;
  currentBet = 0;

  if (lastBet * 3 > bank) return;

  bank -= lastBet * 3;
  currentBet = lastBet * 3;
  dealBtn.disabled = false;
  updateMoney();
};

/* =======================
   DEAL / GAME FLOW
======================= */
dealBtn.onclick = () => {
  if (currentBet <= 0) return;

  gameActive = true;
  lastBet = currentBet;
  handBets = [currentBet, 0];
  resultEl.textContent = "-";

  deck = createDeck();
  shuffle(deck);

  dealerHand = [drawCard(), drawCard()];
  playerHand = [drawCard(), drawCard()];

  playerSplitHand = [];
  isSplitActive = false;
  currentHandIndex = 0;
  playerSplitArea.style.display = "none";
  playerSplitCardsEl.innerHTML = "";
  playerSplitScoreEl.textContent = "0";
  updateActiveHandUI();

  // Lock all buttons during deal animation
  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  splitBtn.disabled = true;
  dealBtn.disabled = true;

  updateMoney();

  dealOpeningCards().then(() => {
    if (checkInitialBlackjack()) return;

    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = bank < handBets[0];
    splitBtn.disabled = !(playerHand.length === 2 && getCardSplitValue(playerHand[0]) === getCardSplitValue(playerHand[1]) && bank >= handBets[0]);
  });
};

/* =======================
   PLAYER ACTIONS
======================= */
hitBtn.onclick = () => {
  if (!gameActive) return;

  const activeHand = currentHandIndex === 0 ? playerHand : playerSplitHand;
  const activeCardsEl = currentHandIndex === 0 ? playerCardsEl : playerSplitCardsEl;
  const activeScoreEl = currentHandIndex === 0 ? playerScoreEl : playerSplitScoreEl;

  activeHand.push(drawCard());
  renderCards(activeCardsEl, activeHand);
  animateNewCard(activeCardsEl);

  doubleBtn.disabled = true;
  splitBtn.disabled = true;

  activeScoreEl.textContent = calculateScore(activeHand);

  if (calculateScore(activeHand) > 21) {
    if (isSplitActive && currentHandIndex === 0) {
      currentHandIndex = 1;
      updateActiveHandUI();
    } else {
      dealerTurn();
    }
  }
};

// Animate the last card in a container with the deal animation
function animateNewCard(container) {
  const card = container.lastElementChild;
  if (!card) return;
  card.classList.add("dealing");
  card.addEventListener("animationend", () => card.classList.remove("dealing"), { once: true });
}

standBtn.onclick = () => {
  if (!gameActive) return;

  if (isSplitActive && currentHandIndex === 0) {
    currentHandIndex = 1;
    updateActiveHandUI();
  } else {
    dealerTurn();
  }
};

doubleBtn.onclick = () => {
  if (!gameActive) return;

  if (bank < handBets[currentHandIndex]) return;

  bank -= handBets[currentHandIndex];
  handBets[currentHandIndex] *= 2;
  currentBet = getTotalActiveBet();

  const activeHand = currentHandIndex === 0 ? playerHand : playerSplitHand;
  const activeCardsEl = currentHandIndex === 0 ? playerCardsEl : playerSplitCardsEl;
  const activeScoreEl = currentHandIndex === 0 ? playerScoreEl : playerSplitScoreEl;

  activeHand.push(drawCard());
  renderCards(activeCardsEl, activeHand);
  animateNewCard(activeCardsEl);
  activeScoreEl.textContent = calculateScore(activeHand);

  updateMoney();

  if (isSplitActive && currentHandIndex === 0) {
    currentHandIndex = 1;
    updateActiveHandUI();
  } else {
    dealerTurn();
  }
};

/* =======================
   SPLIT LOGIC
======================= */
let playerSplitHand = [];
let isSplitActive = false;
let currentHandIndex = 0;

const playerSplitCardsEl = document.getElementById("player-split-cards");
const playerSplitScoreEl = document.getElementById("player-split-score");
const playerSplitArea = document.getElementById("player-split-area");

function updateActiveHandUI() {
  const playerArea = document.querySelector(".player-area");

  playerArea.classList.toggle("active-hand", currentHandIndex === 0);
  playerSplitArea.classList.toggle("active-hand", currentHandIndex === 1);
}

playerCardsEl.onclick = () => {
  // Hand clicking is visual only for now.
  // Turn order should stay controlled by Hit / Stand / Double.
  if (!gameActive || !isSplitActive) return;
};

playerSplitCardsEl.onclick = () => {
  // Hand clicking is visual only for now.
  // This prevents players from jumping between split hands out of order.
  if (!gameActive || !isSplitActive) return;
};

function getCardSplitValue(card) {
  if (["10", "J", "Q", "K"].includes(card.value)) return 10;
  return card.value;
}

splitBtn.onclick = () => {
  if (!gameActive) return;

  if (playerHand.length !== 2 || getCardSplitValue(playerHand[0]) !== getCardSplitValue(playerHand[1])) return;

  if (bank < currentBet) return;

  bank -= handBets[0];
  handBets[1] = handBets[0];
  currentBet = getTotalActiveBet();

  playerSplitHand = [playerHand.pop()];
  playerHand.push(drawCard());
  playerSplitHand.push(drawCard());

  isSplitActive = true;
  currentHandIndex = 0;

  playerSplitArea.style.display = "block";

  renderCards(playerCardsEl, playerHand);
  renderCards(playerSplitCardsEl, playerSplitHand);

  updateScores(false);
  playerSplitScoreEl.textContent = calculateScore(playerSplitHand);
  updateActiveHandUI();

  updateMoney();
};

/* =======================
   DEALER LOGIC
======================= */
function dealerTurn() {
  // Disable buttons during dealer turn
  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  splitBtn.disabled = true;

  // Replace the face-down card with the face-up card using reveal animation
  const hiddenCardEl = dealerCardsEl.lastElementChild;
  if (hiddenCardEl) {
    const revealedEl = createCardElement(dealerHand[1]);
    revealedEl.classList.add("revealing");
    revealedEl.addEventListener("animationend", () => revealedEl.classList.remove("revealing"), { once: true });
    hiddenCardEl.replaceWith(revealedEl);
  }
  updateScores(true);

  // Brief pause after reveal, then draw extra cards one at a time
  setTimeout(() => {
    dealDealerCards().then(() => {
      determineWinner();
    });
  }, 320);
}

/* =======================
   RESULT
======================= */
function determineWinner() {
  const dealerScore = calculateScore(dealerHand);

  if (!isSplitActive) {
    const playerScore = calculateScore(playerHand);

    if (playerHand.length === 2 && playerScore === 21) {
      bank += currentBet * 2.5;
      endRound("Blackjack! You win!");
      return;
    }

    if (playerScore > 21) {
      endRound("Bust! Dealer wins.");
    } else if (playerScore <= 21 && (dealerScore > 21 || playerScore > dealerScore)) {
      bank += currentBet * 2;
      endRound("You win!");
    } else if (playerScore < dealerScore) {
      endRound("Dealer wins.");
    } else {
      bank += currentBet;
      endRound("Push.");
    }

    return;
  }

  const hand1Score = calculateScore(playerHand);
  const hand2Score = calculateScore(playerSplitHand);

  let hand1Result = "";
  let hand2Result = "";

  if (hand1Score > 21) {
    hand1Result = "lose";
  } else if (dealerScore > 21 || hand1Score > dealerScore) {
    hand1Result = "win";
    bank += handBets[0] * 2;
  } else if (hand1Score < dealerScore) {
    hand1Result = "lose";
  } else {
    hand1Result = "push";
    bank += handBets[0];
  }

  if (hand2Score > 21) {
    hand2Result = "lose";
  } else if (dealerScore > 21 || hand2Score > dealerScore) {
    hand2Result = "win";
    bank += handBets[1] * 2;
  } else if (hand2Score < dealerScore) {
    hand2Result = "lose";
  } else {
    hand2Result = "push";
    bank += handBets[1];
  }

  if (hand1Result === "win" && hand2Result === "win") {
    endRound("You won both hands!");
  } else if (hand1Result === "lose" && hand2Result === "lose") {
    endRound("You lost both hands.");
  } else if (
    (hand1Result === "win" && hand2Result === "lose") ||
    (hand1Result === "lose" && hand2Result === "win")
  ) {
    endRound("You won one hand and lost the other hand.");
  } else if (hand1Result === "push" && hand2Result === "push") {
    endRound("Both hands pushed.");
  } else if (
    (hand1Result === "win" && hand2Result === "push") ||
    (hand1Result === "push" && hand2Result === "win")
  ) {
    endRound("You won one hand and pushed the other.");
  } else if (
    (hand1Result === "lose" && hand2Result === "push") ||
    (hand1Result === "push" && hand2Result === "lose")
  ) {
    endRound("You lost one hand and pushed the other.");
  }
}

function updateDealAvailability() {
  dealBtn.disabled = gameActive || currentBet <= 0;
}

function endRound(message) {
  resultEl.textContent = message;
  currentBet = 0;
  handBets = [0, 0];
  gameActive = false;
  isSplitActive = false;
  currentHandIndex = 0;

  renderCards(dealerCardsEl, dealerHand);
  updateScores(true);
  updateActiveHandUI();

  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  splitBtn.disabled = true;

  // After a round ends, player must place a new bet or use Rebet.
  dealBtn.disabled = true;

  if (bank <= 0 && safeBank <= 0) {
    resultEl.textContent = message + " You're out of money! Click New Game to restart.";
  }

  updateMoney();
}

hitBtn.disabled = true;
standBtn.disabled = true;
updateMoney();

/* =======================
   SAFE BANK
======================= */
const safeBankModal = document.getElementById("safe-bank-modal");
const safeBankInput = document.getElementById("safe-bank-input");
const safeBankInfo = document.getElementById("safe-bank-modal-info");

document.getElementById("manage-safe-bank").onclick = () => {
  safeBankInfo.textContent = `Bank: $${bank.toFixed(2)} | Safe Bank: $${safeBank.toFixed(2)}`;
  safeBankInput.value = "";
  safeBankModal.style.display = "flex";
};

document.getElementById("safe-bank-deposit").onclick = () => {
  const amount = Math.round(parseFloat(safeBankInput.value) * 100) / 100;
  if (isNaN(amount) || amount <= 0 || amount > bank) return;
  bank = Math.round((bank - amount) * 100) / 100;
  safeBank = Math.round((safeBank + amount) * 100) / 100;
  updateMoney();
  safeBankModal.style.display = "none";
};

document.getElementById("safe-bank-withdraw").onclick = () => {
  const amount = Math.round(parseFloat(safeBankInput.value) * 100) / 100;
  if (isNaN(amount) || amount <= 0 || amount > safeBank) return;
  safeBank = Math.round((safeBank - amount) * 100) / 100;
  bank = Math.round((bank + amount) * 100) / 100;
  updateMoney();
  safeBankModal.style.display = "none";
};

document.getElementById("safe-bank-cancel").onclick = () => {
  safeBankModal.style.display = "none";
};

/* =======================
   NEW GAME / QUIT
======================= */
document.getElementById("menu-new-game").onclick = () => {
  bank = 1000;
  safeBank = 0;
  currentBet = 0;
  lastBet = 0;
  gameActive = false;
  isSplitActive = false;
  deck = [];
  dealerHand = [];
  playerHand = [];
  playerSplitHand = [];
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";
  playerSplitCardsEl.innerHTML = "";
  playerSplitArea.style.display = "none";
  dealerScoreEl.textContent = "0";
  playerScoreEl.textContent = "0";
  resultEl.textContent = "-";
  hitBtn.disabled = true;
  standBtn.disabled = true;
  doubleBtn.disabled = true;
  splitBtn.disabled = true;
  dealBtn.disabled = true;
  updateMoney();
};

const quitModal = document.getElementById("quit-modal");
document.getElementById("menu-quit").onclick = () => quitModal.style.display = "flex";
document.getElementById("quit-cancel").onclick = () => quitModal.style.display = "none";
document.getElementById("quit-confirm").onclick = () => window.close();

function dealCards() {
  deck = createDeck();
  shuffle(deck);

  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];

  renderCards(playerCardsEl, playerHand);
  renderCards(dealerCardsEl, [dealerHand[0]]);

  updateScores(false);
}
