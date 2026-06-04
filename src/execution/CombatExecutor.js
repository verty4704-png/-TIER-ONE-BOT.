const EventBus = require('../core/EventBus');
const Logger = require('../core/Logger');

class CombatExecutor {
    constructor(bot, worldState) {
        this.bot = bot;
        this.worldState = worldState;
        this.lastAttackTime = 0;
    }

    attack(options = {}) {
        const now = Date.now();
        if (now - this.lastAttackTime < 400) return false;

        if (!this.worldState.target) return false;

        // Крит
        if (options.crit && this.bot.entity.onGround) {
            this.bot.setControlState('jump', true);
            setTimeout(() => this.bot.setControlState('jump', false), 100);
        }

        // Атака
        this.bot.attack(this.worldState.target);
        this.lastAttackTime = now;

        EventBus.emit('COMBAT:ATTACK_EXECUTED', {
            target: this.worldState.target,
            crit: options.crit,
            timestamp: now
        });

        return true;
    }

    wTap() {
        this.bot.setControlState('sprint', false);
        setTimeout(() => {
            if (this.worldState.isInCombat) {
                this.bot.setControlState('sprint', true);
            }
        }, 50);
    }
}

module.exports = CombatExecutor;
