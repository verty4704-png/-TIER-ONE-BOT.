<div align="center">

# 🏆 TIER-ONE BOT

### H1 Level PvP Framework for MCTIER Rating System

![License](https://img.shields.io/badge/License-TOEL%201.0-red.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js)
![Mineflayer](https://img.shields.io/badge/Mineflayer-4.20.1-blue.svg?style=for-the-badge)
![MC Version](https://img.shields.io/badge/Minecraft-1.16.5_--_1.21%2B-yellow.svg?style=for-the-badge)

**Advanced AI-powered combat system with predictive movement, humanized inputs, and multi-mode support.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Configuration](#-configuration) • [License](#-license)

</div>

---

## 📖 Overview

**TIER-ONE BOT** is an elite Minecraft PvP bot designed to reach **H1 (High Tier 1)** ranking on MCTIER ladders. Unlike basic scripts, TIER-ONE uses **vector mathematics**, **movement prediction**, and **packet-level manipulation** to replicate the mechanics of top-tier players (like Swight, Stimpay, etc.) while maintaining human-like behavior to bypass modern anticheats.

It supports both **In-Game Chat** and **Terminal (Console)** control, making it perfect for headless VPS hosting or local testing.

---

## ✨ Features

### 🧠 Intelligent Combat Engine
*   **Movement Prediction:** Calculates enemy velocity to attack where the target *will be* in 3-5 ticks.
*   **Humanization:** Randomized W-Tap delays (30-60ms), micro-head movements, and input lag simulation.
*   **Dynamic Strafing:** Vector-based circle strafing and perpendicular evasion.

### ⚔️ Combat Modes
| Mode | Icon | Description | Best For |
| :--- | :---: | :--- | :--- |
| **Axe Mode** | 🪓 | Swight-style gameplay. Prioritizes shield disabling and critical hits. | Crystal/Axe Duels |
| **Sword Mode** | 🗡️ | Fast combos, aggressive reach abuse (3.8+ blocks), and sprint-resetting. | SMP / Pot PvP |
| **Crystal Mode** | 💎 | End Crystal placement/detonation logic with obsidian support. | Anarchy / 2b2t |

### 🤖 Smart Automation
*   **Auto-Equip:** Instantly swaps to Netherite/Diamond gear based on durability and enchantments.
*   **Auto-Eat:** Monitors health/hunger bars and consumes Golden Apples or food automatically.
*   **Creative Integration:** `!creative` command (requires OP) instantly fills inventory with meta gear.

---

## 🚀 Installation

### Prerequisites
*   **Node.js** v18 or higher
*   **Minecraft Server** (Vanilla, Paper, or Spigot)

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

3.  **Configure the bot:**
    Open `config.js` and set your server details.
    ```javascript
    server: {
        host: 'localhost',
        port: 25565,
        version: 'auto' // Auto-detects 1.16.5 - 1.21+
    }
    ```

4.  **Run the bot:**
    ```bash
    npm start
    ```

---

## 🎮 Usage

You can control the bot via **In-Game Chat** (prefix `!`) or the **Terminal** (no prefix).

### 💬 In-Game Commands (Chat)
*Type these in the Minecraft chat.*

| Command | Description |
| :--- | :--- |
| `!fight <player>` | Lock target and engage combat. |
| `!stop` | Disengage and reset state. |
| `!mode <axe\|sword\|crystal>` | Switch combat style on the fly. |
| `!creative` | (Requires OP) Switch to Creative and get meta gear. |
| `!survival` | (Requires OP) Switch back to Survival. |
| `!equip` | Auto-equip best armor from inventory. |
| `!status` | Display Health, Hunger, Ping, and Mode. |

### 💻 Terminal Commands (Console)
*Type these directly into the Node.js terminal window.*

| Command | Description |
| :--- | :--- |
| `fight <player>` | Same as chat command. |
| `mode <type>` | Change combat mode. |
| `chat <message>` | Send a message to the game chat from console. |
| `status` | Print detailed bot stats to console. |
| `exit` | Gracefully disconnect and shut down. |

---

## 🏗️ Project Structure

```text
tier-one-bot/
├── index.js              # Main entry point & Event loop
├── config.js             # Combat & Server configuration
├── package.json          # Dependencies
│
├── combat/               # Combat Logic Modules
│   ├── base_combat.js    # Abstract class for combat modes
│   ├── axe_mode.js       # 🪓 Axe/Shield logic
│   ├── sword_mode.js     # 🗡️ Sword/Combo logic
│   └── crystal_mode.js   # 💎 Crystal/Anchor logic
│
└── utils/                # Utilities & Helpers
    ├── equipment.js      # Inventory management
    ├── movement.js       # Pathfinding & Strafing
    ├── anticheat.js      # Humanization algorithms
    └── prediction.js     # Velocity & Position tracking
⚙️ Configuration
Edit config.js to fine-tune the bot's behavior:
combat.reach: Max attack distance (Default: 3.8).
combat.wTapDelay: Randomization range for sprint-resetting (Default: 30-60ms).
combat.critChance: Probability of jumping for a critical hit (Default: 0.95).
op.autoRequest: Automatically asks for OP on spawn (useful for private testing).
⚖️ License & Disclaimer
This project is licensed under the TIER-ONE Educational & Open License (TOEL) 1.0.
See the LICENSE file for full legal text.
⚠️ WARNING: EDUCATIONAL PURPOSE ONLY
This software is designed for stress-testing private servers and researching AI behavior.
EULA: Using automated bots on public servers violates the Minecraft EULA.
Bans: Modern anticheats (Watchdog, Vulcan, Grim, Matrix) detect packet anomalies. The authors are NOT responsible for banned accounts.
No Warranty: The software is provided "AS IS" without warranty of any kind.
<div align="center">

Made with ❤️ for the technical Minecraft community.
If you use this code, please star the repo and credit the original authors.
</div>
```
