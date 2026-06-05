<div align="center">

# 🏆 TIER-ONE AI Framework

### Advanced Research Platform for Minecraft Combat Simulation

![License](https://img.shields.io/badge/License-TERL--2.0-blue.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=for-the-badge&logo=node.js)
![Mineflayer](https://img.shields.io/badge/Mineflayer-4.20.1-blue.svg?style=for-the-badge)
![MC Version](https://img.shields.io/badge/Minecraft-1.16.5_--_1.21%2B-yellow.svg?style=for-the-badge)

**A modular, event-driven framework for studying AI decision-making, movement prediction, and behavioral modeling in sandboxed environments.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [License](#-license)

</div>

---

> ⚠️ **EDUCATIONAL USE ONLY**  
> This project is for private testing and AI research. Using automated clients on public servers violates the Minecraft EULA. The authors are **NOT responsible** for account bans.

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
*   **Dynamic Strafing:** Vector-based circle strafing and perpendicular evasion algorithms.

### ⚔️ Simulation Modes
| Mode | Icon | Description | Research Focus |
| :--- | :---: | :--- | :--- |
| **Axe Mode** |  | Simulates shield-disabling mechanics and critical hit timing. | Cooldown Management |
| **Sword Mode** | 🗡️ | Studies aggressive engagement optimization and combo sequences. | Action Frequency |
| **Crystal Mode** | 💎 | Explores area-denial tactics and explosive placement logic. | Spatial Awareness |

### 🤖 Smart Automation
*   **Auto-Equip:** Instantly swaps to Netherite/Diamond gear based on durability and enchantments.
*   **Auto-Eat:** Monitors health/hunger bars and consumes Golden Apples or food automatically.
*   **Creative Integration:** `!creative` command (requires OP) instantly fills inventory with test gear.

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
        version: 'auto' // Auto-detects 1.16.5 - 1.21+
    }
    ```

4.  **Run the framework:**
    ```bash
    npm start
    ```

---

##  Usage & Control

The framework supports dual-control interfaces for flexible testing.

### 💬 In-Game Commands (Chat)
*Type these in the Minecraft chat.*

| Command | Description |
| :--- | :--- |
| `!fight <player>` | Initiate combat simulation with a target. |
| `!stop` | Terminate current simulation session. |
| `!mode <axe\|sword\|crystal>` | Switch behavioral model. |
| `!creative` | (Requires OP) Switch to Creative and get test gear. |
| `!survival` | (Requires OP) Switch back to Survival. |
| `!equip` | Auto-equip best armor from inventory. |
| `!status` | Display Health, Hunger, Ping, and Mode. |

### 💻 Terminal Commands (CLI)
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
── utils/                # Utilities & Helpers
    ├── equipment.js      # Inventory management
    ├── movement.js       # Pathfinding & Strafing
    ├── anticheat.js      # Input randomization & humanization
    └── prediction.js     # Velocity & Position tracking
```
---

## ⚙️ Configuration

Edit `config.js` to fine-tune the framework's behavior:

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `combat.reach` | Max engagement distance (blocks) | `3.8` |
| `combat.wTapDelay` | Randomization range for sprint-resetting (ms) | `30-60` |
| `combat.critChance` | Probability of jumping for a critical hit | `0.95` |
| `op.autoRequest` | Automatically asks for OP on spawn | `true` |

**Example snippet:**
```javascript
combat: {
    reach: 3.8,
    wTapDelayMin: 30,
    wTapDelayMax: 60,
    critChance: 0.95,
    predictionTicks: 3
},
op: {
    autoRequest: true
}
```
---

## ⚖️ License & Disclaimer

This project is licensed under the **TIER-ONE Educational & Research License (TERL) 2.0**.  
See the [LICENSE](LICENSE) file for full legal text.

> ### ⚠️ IMPORTANT NOTICE
> 
> *   🎓 **Educational Use Only:** This software is provided for academic research and private testing.
> *   🛡️ **No Warranty:** The authors assume **NO responsibility** for account bans, IP blocks, or hardware restrictions imposed by server administrators or platform holders (Mojang/Microsoft).
> *   ⚖️ **Compliance:** Using automated clients on public servers violates the Minecraft EULA. Users are solely responsible for complying with the rules of the environments in which they run this software.

---

<div align="center">

**Made with ❤️ for the AI Research Community.**

*If you use this code for research, please cite the original repository.*

<br>

⭐ [Star the repo](https://github.com/verty4704-png/-TIER-ONE-BOT) •  [Report an issue](https://github.com/verty4704-png/-TIER-ONE-BOT/issues) • 📖 [Read the Wiki](https://github.com/verty4704-png/-TIER-ONE-BOT/wiki)

</div>
