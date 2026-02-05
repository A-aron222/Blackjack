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

/* =======================
   GAME STATE
======================= */
let deck = [];
let dealerHand = [];
let playerHand = [];

let bank = 1000;
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
function renderCards(container, hand) {
    container.innerHTML = "";
    hand.forEach(card => {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = `${card.value}${card.suit}`;
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
}

/* =======================
   BETTING
======================= */
chips.forEach(chip => {
    chip.addEventListener("click", () => {
        if (gameActive) return;
        const value = parseFloat(chip.dataset.value);
        if (bank >= value) {
            bank -= value;
            currentBet += value;
            updateMoney();
        }
    });
});

clearBetBtn.onclick = () => {
    if (gameActive) return;
    bank += currentBet;
    currentBet = 0;
    updateMoney();
};

rebetBtn.onclick = () => {
    if (gameActive || lastBet > bank) return;
    bank -= lastBet;
    currentBet = lastBet;
    updateMoney();
};

doubleRebetBtn.onclick = () => {
    if (gameActive || lastBet * 2 > bank) return;
    bank -= lastBet * 2;
    currentBet = lastBet * 2;
    updateMoney();
};

tripleRebetBtn.onclick = () => {
    if (gameActive || lastBet * 3 > bank) return;
    bank -= lastBet * 3;
    currentBet = lastBet * 3;
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
    renderCards(dealerCardsEl, [dealerHand[0]]);

    updateScores(false);

    hitBtn.disabled = false;
    standBtn.disabled = false;
    dealBtn.disabled = true;
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

/* =======================
   DEALER LOGIC
======================= */
function dealerTurn() {
    renderCards(dealerCardsEl, dealerHand);
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

function endRound(message) {
    resultEl.textContent = message;
    currentBet = 0;
    gameActive = false;

    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;

    updateMoney();
}

/* =======================
   INIT
======================= */
hitBtn.disabled = true;
standBtn.disabled = true;
updateMoney();
