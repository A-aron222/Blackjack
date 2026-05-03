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

// Tracks the real bet attached to each player hand.
// handBets[0] = Player Hand 1
// handBets[1] = Player Hand 2 after split
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

    playerSplitHand = [];
    isSplitActive = false;
    currentHandIndex = 0;
    playerSplitArea.style.display = "none";
    playerSplitCardsEl.innerHTML = "";
    playerSplitScoreEl.textContent = "0";
    updateActiveHandUI();

    renderCards(playerCardsEl, playerHand);
    renderCards(dealerCardsEl, dealerHand, 1);

    updateScores(false);

    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = bank < currentBet;
    splitBtn.disabled = !(playerHand.length === 2 && getCardSplitValue(playerHand[0]) === getCardSplitValue(playerHand[1]) && bank >= currentBet);
    dealBtn.disabled = true;

    updateMoney();
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

    // Deduct additional bet equal to current bet
    if (bank < currentBet) return;
    bank -= currentBet;
    currentBet *= 2;

    // Draw exactly one card
    const activeHand = currentHandIndex === 0 ? playerHand : playerSplitHand;
    const activeCardsEl = currentHandIndex === 0 ? playerCardsEl : playerSplitCardsEl;
    const activeScoreEl = currentHandIndex === 0 ? playerScoreEl : playerSplitScoreEl;

    activeHand.push(drawCard());
    renderCards(activeCardsEl, activeHand);
    activeScoreEl.textContent = calculateScore(activeHand);

    updateMoney();

    // Automatically stand (move to next hand or dealer turn)
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
    if (!gameActive || !isSplitActive) return;
    currentHandIndex = 0;
    updateActiveHandUI();
};

playerSplitCardsEl.onclick = () => {
    if (!gameActive || !isSplitActive) return;
    currentHandIndex = 1;
    updateActiveHandUI();
};

function getCardSplitValue(card) {
    if (["10", "J", "Q", "K"].includes(card.value)) return 10;
    return card.value;
}

splitBtn.onclick = () => {
    if (!gameActive) return;

    // Only allow split if 2 cards of same value
    if (playerHand.length !== 2 || getCardSplitValue(playerHand[0]) !== getCardSplitValue(playerHand[1])) return;

    if (bank < currentBet) return; // need equal bet

    // Deduct second bet
    bank -= currentBet;

    // Split hands
    playerSplitHand = [playerHand.pop()];
    playerHand.push(drawCard());
    playerSplitHand.push(drawCard());

    isSplitActive = true;
    currentHandIndex = 0;

    // Show split area
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
    const dealerScore = calculateScore(dealerHand);

    if (!isSplitActive) {
        const playerScore = calculateScore(playerHand);

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
        bank += currentBet * 2;
    } else if (hand1Score < dealerScore) {
        hand1Result = "lose";
    } else {
        hand1Result = "push";
        bank += currentBet;
    }

    if (hand2Score > 21) {
        hand2Result = "lose";
    } else if (dealerScore > 21 || hand2Score > dealerScore) {
        hand2Result = "win";
        bank += currentBet * 2;
    } else if (hand2Score < dealerScore) {
        hand2Result = "lose";
    } else {
        hand2Result = "push";
        bank += currentBet;
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
