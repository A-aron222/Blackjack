# CPSC 362 Project

* Arun George: arungm@csu.fullerton.edu
* Aaron Anil: Aaronanil45@csu.fullerton.edu
* Julie Yun: jyun36@csu.fullerton.edu
* Jackson Thompson: jthompson5@csu.fullerton.edu

# Accessing Instructions

Open `index.html` in a web browser to launch the game. No server or installation required.

# Project Files

- `index.html` — main game page and UI structure
- `fixed_script.js` — all game logic (deck, betting, split, safe bank, animations)
- `styles.css` — visual styling and layout

# Gameplay Instructions

1. Blackjack is played against the dealer with the goal of getting as close to 21 as possible without going over.
1. Number cards are worth their face value, face cards (J, Q, K) are worth 10, and aces are worth 11 (or 1 if 11 would cause a bust).
1. You are dealt two cards face up; the dealer gets one card face up and one face down.
1. After cards are dealt, choose an action: Hit, Stand, Double Down, or Split.
1. If your hand exceeds 21, you bust and lose immediately.
1. A hand totaling exactly 21 with the first two cards is a Blackjack and pays 3:2.
1. After you finish, the dealer reveals their hidden card and must keep hitting until reaching at least 17.
1. If the dealer busts, you win. If neither busts, the hand closest to 21 wins. Ties result in a push (bet returned).

# Player Actions

- **Hit** — Take another card.
- **Stand** — End your turn with your current hand.
- **Double Down** — Double your bet, receive exactly one more card, then automatically stand.
- **Split** — If your first two cards have the same value, split them into two separate hands. Each hand gets a new card and plays independently. Your bet is doubled (one bet per hand).

# Betting

Click chips to build your bet before dealing. Available denominations: $0.01, $0.05, $0.10, $0.25, $1, $5, $10, $25, $100.

- **Clear Bet** — Remove your current bet and return it to your bank.
- **Rebet** — Repeat your last bet amount.
- **Double Rebet** — Place double your last bet.
- **Triple Rebet** — Place triple your last bet.

# Safe Bank

A separate savings account to store money outside your active bank. Use the **Withdraw/Deposit** button in the info panel to move funds between your bank and safe bank. Safe bank funds are protected — you cannot go bust if you have money stored there.

# Menu Options

- **New Game** — Reset everything and start fresh with $1000.
- **Options > Reset Bank** — Reset your bank balance to $1000.
- **Options > Help / Rules** — Open the in-game rules reference.
- **Options > Quit Game** — Exit the game.
