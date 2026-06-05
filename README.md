<div align="center">

# 🏆 TIER-ONE AI Framework v3.0.0

### MCTier HT1 PvP Research Platform — Adaptive Learning · Advanced Prediction · Humanized Aim V2

![License](https://img.shields.io/badge/License-TERL--2.0-blue.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js)
![Mineflayer](https://img.shields.io/badge/Mineflayer-4.20.1-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/badge/v3.0.0-HT1-orange.svg?style=for-the-badge)

**A modular, event-driven AI framework for studying adaptive combat behavior, predictive movement, and humanized input patterns in sandboxed Minecraft environments.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Configuration](#-configuration) • [License](#-license)

</div>

---

> ⚠️ **EDUCATIONAL USE ONLY**  
> This project is for private testing and AI research. Using automated clients on public servers violates the Minecraft EULA. The authors are **NOT responsible** for account bans.

---

## 📖 Overview

**TIER-ONE v3.0** is an advanced research framework that goes beyond static scripts. It introduces **Adaptive Combat Learning**, where the bot analyzes its own performance over 50+ fights and automatically adjusts its decision-making weights using gradient descent. Combined with **EMA-based prediction** and **5-profile Humanized Aim**, it simulates high-tier player behavior for academic study and private server stress-testing.

*Note: This project is intended solely for educational purposes, private server testing, and AI state machine research. It is not designed for use on public multiplayer servers.*

---

## ✨ Key Features (v3.0 HT1)

### 🧠 Adaptive Combat Learning
*   **CombatHistoryStore:** Stores metadata from the last 50 fights (win rate, accuracy, combo length).
*   **AdaptiveLearner:** Every 200 ticks, analyzes performance and applies a gradient step to adjust `UtilityScorer` weights.
*   **Self-Optimization:** Automatically shifts aggression vs. survival priorities based on historical success rates.

### 🎯 Humanized Aim V2
Five distinct aiming profiles that mimic different player psychotypes:
| Profile | Speed | Micro-errors | Overshoot | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Aggressive** | High | Medium | 15% | Aggressive Strategy |
| **Balanced** | Medium | Low | 7% | Default / Balanced |
| **Defensive** | Low | Minimal | 3% | Survival / Kiting |
| **Nervous** | Max | High | 20% | Sword Combos |
| **Smooth** | Medium | Minimal | 2% | Axe / Crit Timing |

###  Advanced Prediction (EMA + Physics)
*   Uses **Exponential Moving Average** to smooth enemy velocity vectors.
*   Predicts position 3–5 ticks ahead based on physics constraints.
*   Detects direction change probability; switches to predicted point when P(change) > 0.55.

### ⚔️ 6 Specialized Strategies
| Strategy | Behavior | Auto-Switch Trigger |
| :--- | :--- | :--- |
| **Aggressive** | Max DPS, constant pressure | HP < 14 → Balanced |
| **Balanced** | Standard HT1 playstyle | Default |
| **Defensive** | Priority survival, 4-5 block range | HP < 8 |
| **Sword** | Fast combos, frequent W/S-tap | Manual / Adaptive |
| **Axe** | Guaranteed crits, jump resets | Manual / Adaptive |
| **Crystal** | Positioning + burst phases | Manual / Adaptive |

### 📊 Comprehensive Telemetry (6 Metrics)
*   **Accuracy:** Hit percentage over sliding window.
*   **CPS:** Clicks per second (5s average).
*   **Combo Length:** Current / Max / Average.
*   **Damage Efficiency:** Damage dealt per attack.
*   **Survival Score:** Integral metric (0–100) based on HP retention.
*   **Win Rate:** Historical win percentage.

---

## 🚀 Installation

### Prerequisites
*   **Node.js** v18 or higher
*   **Minecraft Server** (Local/Private Instance recommended)

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/verty4704-png/-TIER-ONE-BOT.git
    cd -TIER-ONE-BOT
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure the environment:**
    Open `config.js` and set your local server details.
    ```javascript
    server: {
        host: 'localhost',
        port: 25565,
        version: 'auto' 
    }
    ```

4.  **Run the framework:**
    ```bash
    npm start          # Normal run
    npm run dev        # With auto-reload (nodemon)
    npm run debug      # With verbose logging
    ```

---

## 🎮 Usage & Control

The framework supports dual-control interfaces.

### 💬 In-Game Commands (Chat)
*Prefix: `!`*

| Command | Description |
| :--- | :--- |
| `!fight <player>` | Initiate combat simulation. |
| `!stop` | Terminate current session. |
| `!strategy <name>` | Switch strategy (`aggressive`, `balanced`, `defensive`, `sword`, `axe`, `crystal`). |
| `!aim <profile>` | Switch aim profile (`aggressive`, `balanced`, `defensive`, `nervous`, `smooth`). |
| `!status` | Display all 6 HT1 metrics. |
| `!learn` | Show adaptive learning results & weight updates. |
| `!creative` | (Requires OP) Equip test gear. |
| `!help` | List all commands. |

### 💻 Terminal Commands (CLI)
*No prefix required.*

| Command | Description |
| :--- | :--- |
| `fight <player>` | Start simulation via console. |
| `stop` | End combat session. |
| `strategy <name>` | Change active strategy. |
| `aim <profile>` | Change aiming profile. |
| `status` | Print detailed HT1 stats to console. |
| `learn` | Show adaptation statistics. |
| `chat <message>` | Send message to game chat. |
| `exit` | Gracefully shut down. |

---

## 🏗️ Architecture (v3.0)

```text
tier-one-ht1/
├── index.js                         # Entry point & orchestrator
├── config.js                        # HT1 configuration
├── src/
│   ├── core/
│   │   ├── EventBus.js              # Pub/Sub communication
│   │   ├── Logger.js                # Colored structured logging
│   │   ── ConfigManager.js         # Validated config loading
│   │
│   ├── perception/
│   │   ├── WorldState.js            # Unified world snapshot (20 TPS)
│   │   ├── EntityTracker.js         # Velocity & position tracking
│   │   ├── CombatAnalyzer.js        # Real-time combat assessment
│   │   └── EnemyPredictor.js        # ★ EMA-based position forecasting
│   │
│   ├── ai/
│   │   ├── DecisionEngine.js        # Utility-based action selection
│   │   ├── UtilityScorer.js         # Dynamic weight evaluation
│   │   ├── AdaptiveLearner.js       # ★ Gradient-based self-optimization
│   │   └── CombatHistoryStore.js    # Last 50 fights memory
│   │
│   ├── execution/
│   │   ├── CombatExecutor.js        # W-Tap, S-Tap, Jump Reset, Reach
│   │   ├── MovementEngine.js        # Dynamic strafing & evasion
│   │   ├── ItemManager.js           # Hotbar & creative equip
│   │   └── HumanizedAim.js          # ★ 5-profile aim simulation
│   │
│   ├── strategy/
│   │   ├── StrategyManager.js       # 6-strategy router + aim sync
│   │   └── strategies/
│   │       ├── BaseStrategy.js      # Abstract base class
│   │       ├── AggressiveStrategy.js
│   │       ├── BalancedStrategy.js
│   │       ├── DefensiveStrategy.js
│   │       ├── SwordStrategy.js
│   │       ├── AxeStrategy.js
│   │       └── CrystalStrategy.js
│   │
│   └── metrics/
│       ├── Telemetry.js             # 6-metric real-time tracking
│       ── ReplayRecorder.js        # JSONL fight recording
