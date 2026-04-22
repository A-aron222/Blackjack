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

/* =======================
   RENDERING
======================= */
function renderCards(container, hand, hideLastN = 0) {
    container.innerHTML = "";
    hand.forEach((card, index) => {
        const div = document.createElement("div");
        const isHidden = index >= hand.length - hideLastN;
        if (isHidden) {
            div.className = "card card-back";
        } else {
            div.className = "card";
            div.innerHTML = `<span class="card-value ${card.suit === "♥" || card.suit === "♦" ? "red" : ""}">${card.value}</span><span class="card-suit ${card.suit === "♥" || card.suit === "♦" ? "red" : ""}">${card.suit}</span><span class="card-value-bottom ${card.suit === "♥" || card.suit === "♦" ? "red" : ""}">${card.value}</span>`;
        }
        container.appendChild(div);
    });
}

function updateScores(showDealer = false) {
    playerScoreEl.textContent = calculateScore(playerHand);
    dealerScoreEl.textContent = showDealer ? calculateScore(dealerHand) : dealerHand.length ? "?" : 0;
}

function updateMoney() {
    bankEl.textContent = `$${bank.toFixed(2)}`;
    betEl.textContent = `$${currentBet.toFixed(2)}`;
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
    resultEl.textContent = "-";

    deck = createDeck();
    shuffle(deck);

    dealerHand = [drawCard(), drawCard()];
    playerHand = [drawCard(), drawCard()];

    renderCards(playerCardsEl, playerHand);
    renderCards(dealerCardsEl, dealerHand, 1);

    updateScores(false);

    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = bank < currentBet;
    dealBtn.disabled = true;
    updateMoney();
};

/* =======================
   PLAYER ACTIONS
======================= */
hitBtn.onclick = () => {
    if (!gameActive) return;

    playerHand.push(drawCard());
    renderCards(playerCardsEl, playerHand);
    updateScores(false);

    if (calculateScore(playerHand) > 21) {
        endRound("Player busts. Dealer wins.");
    }
};

standBtn.onclick = () => {
    if (!gameActive) return;
    dealerTurn();
};

doubleBtn.onclick = () => {
    if (!gameActive || playerHand.length !== 2 || bank < currentBet) return;
    bank = Math.round((bank - currentBet) * 100) / 100;
    currentBet = Math.round((currentBet * 2) * 100) / 100;
    playerHand.push(drawCard());
    renderCards(playerCardsEl, playerHand);
    updateScores(false);
    updateMoney();
    if (calculateScore(playerHand) > 21) {
        endRound("Player busts. Dealer wins.");
    } else {
        dealerTurn();
    }
};

/* =======================
   DEALER LOGIC
======================= */
function animateReveal(container) {
    const lastCard = container.lastElementChild;
    if (!lastCard) return;

    lastCard.classList.add("revealing");
    lastCard.addEventListener("animationend", () => {
        lastCard.classList.remove("revealing");
    }, { once: true });
}

function dealerTurn() {
    renderCards(dealerCardsEl, dealerHand);
    animateReveal(dealerCardsEl);
    updateScores(true);

    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(drawCard());
        renderCards(dealerCardsEl, dealerHand);
        updateScores(true);
    }

    determineWinner();
}

/* =======================
   RESULT
======================= */
function determineWinner() {

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (playerHand.length === 2 && playerScore === 21) {
        bank += currentBet * 2.5;
        endRound("Blackjack! You win!");
        return;
    }
    
    if (dealerScore > 21 || playerScore > dealerScore) {
        bank += currentBet * 2;
        endRound("You win!");
    } else if (playerScore < dealerScore) {
        endRound("Dealer wins.");
    } else {
        bank += currentBet;
        endRound("Push.");
    }
}

function updateDealAvailability() {
    dealBtn.disabled = gameActive || currentBet <= 0;
}

function endRound(message) {
    resultEl.textContent = message;
    currentBet = 0;
    gameActive = false;

    renderCards(dealerCardsEl, dealerHand);
    updateScores(true);

    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    splitBtn.disabled = true;
    dealBtn.disabled = false;

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

function dealCards() {
    deck = createDeck();
    shuffle(deck);

    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];

    renderCards(playerCardsEl, playerHand);
    renderCards(dealerCardsEl, [dealerHand[0]]); 

    updateScores(false);
}
