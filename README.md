<div align="center">

#  TIER-ONE AI Framework

### Advanced Research Platform for Minecraft Combat Simulation

![License](https://img.shields.io/badge/License-TERL--2.0-blue.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js)
![Mineflayer](https://img.shields.io/badge/Mineflayer-4.20.1-blue.svg?style=for-the-badge)
![MC Version](https://img.shields.io/badge/Minecraft-1.16.5_--_1.21%2B-yellow.svg?style=for-the-badge)

**A modular, event-driven framework for studying AI decision-making, movement prediction, and behavioral modeling in sandboxed environments.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [License](#-license)

</div>

---

## 📖 Overview

**TIER-ONE** is an open-source research framework designed to explore the capabilities of Node.js in simulating complex agent behaviors within Minecraft. It utilizes a layered architecture (**Perception → AI → Execution**) to study vector mathematics, utility-based decision making, and human-like input patterns.

*Note: This project is intended solely for educational purposes, private server stress-testing, and academic research into AI state machines. It is not designed for use on public multiplayer servers.*

---

## ✨ Key Features

### 🧠 AI & Behavioral Modeling
*   **Predictive Movement:** Studies velocity vectors to calculate future target positions (3-5 ticks ahead) for simulation accuracy.
*   **Humanization Layer:** Implements randomized input delays (W-Tap 30-60ms), micro-movements, and variance to simulate natural user behavior for research validity.
*   **Utility-Based Decision Engine:** Evaluates actions based on dynamic scoring (Attack, Retreat, Heal) rather than hardcoded scripts.

### ⚔️ Simulation Modes
| Mode | Icon | Description | Research Focus |
| :--- | :---: | :--- | :--- |
| **Axe Mode** | 🪓 | Simulates shield-disabling mechanics and critical hit timing. | Cooldown Management |
| **Sword Mode** | 🗡️ | Studies aggressive reach optimization and combo sequences. | Action Frequency |
| **Crystal Mode** | 💎 | Explores area-denial tactics and explosive placement logic. | Spatial Awareness |

### 🛠️ Framework Capabilities
*   **Event-Driven Core:** Uses a centralized `EventBus` for loose coupling between modules.
*   **Telemetry System:** Tracks Hit Ratio, CPS, and Reaction Time for post-simulation analysis.
*   **Replay Recorder:** Saves match data to JSONL for offline analysis and ML training datasets.
*   **Headless Support:** Full control via Terminal CLI, ideal for remote VPS testing.

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
    npm start
    ```

---

## 🎮 Usage & Control

The framework supports dual-control interfaces for flexible testing.

### 💬 In-Game Commands (Chat)
*Prefix: `!`*

| Command | Description |
| :--- | :--- |
| `!fight <player>` | Initiate combat simulation with a target. |
| `!stop` | Terminate current simulation session. |
| `!mode <axe|sword|crystal>` | Switch behavioral model. |
| `!creative` | (Requires OP) Equip test gear in Creative mode. |
| `!status` | Display real-time telemetry data. |

### 💻 Terminal Commands (CLI)
*No prefix required.*

| Command | Description |
| :--- | :--- |
| `fight <player>` | Start simulation via console. |
| `mode <type>` | Change active strategy. |
| `chat <message>` | Send message to game chat from CLI. |
| `status` | Print detailed metrics to console. |
| `exit` | Gracefully shut down the instance. |

---

## 🏗️ Architecture (v2.0)

TIER-ONE uses a professional layered structure to ensure scalability and maintainability:

```text
src/
├── core/               # EventBus, Logger, ConfigManager
├── perception/         # WorldState, EntityTracker (Sensors)
├── ai/                 # DecisionEngine, UtilityScorer (Brain)
├── execution/          # CombatExecutor, MovementEngine (Actuators)
── strategy/           # Axe/Sword/Crystal Strategies
└── metrics/            # Telemetry, ReplayRecorder
