/**
 * @fileoverview CombatExecutor HT1 — расширяет оригинальный executor.
 * Добавлены все HT1 техники: W-Tap, S-Tap, Jump Reset, Reach Control,
 * Combo Extension, Smart Retreat.
 */

const EventBus = require('../core/EventBus');
const Logger   = require('../core/Logger');

class CombatExecutor {
    /**
     * @param {import('mineflayer').Bot} bot
     * @param {import('../perception/WorldState')} worldState
     */
    constructor(bot, worldState) {
        this.bot         = bot;
        this.worldState  = worldState;
        this.lastAttackTime = 0;

        // HT1 state
        this._wTapActive    = false;
        this._sTapActive    = false;
        this._inJumpReset   = false;
        this._retreatActive = false;
        this._comboCount    = 0;
        this._lastHitTime   = 0;
    }

    // ─────────────────────────────────────────────────────────────
    // ATTACK (базовый, из оригинала)
    // ─────────────────────────────────────────────────────────────

    /**
     * @param {{ crit?: boolean }} [options]
     * @returns {boolean}
     */
    attack(options = {}) {
        const now = Date.now();
        if (now - this.lastAttackTime < 400) return false;
        if (!this.worldState.target) return false;

        if (options.crit && this.bot.entity.onGround) {
            this.bot.setControlState('jump', true);
            setTimeout(() => this.bot.setControlState('jump', false), 100);
        }

        this.bot.attack(this.worldState.target);
        this.lastAttackTime = now;

        // Обновляем combo
        if (now - this._lastHitTime < 1400) {
            this._comboCount++;
        } else {
            this._comboCount = 1;
        }
        this._lastHitTime = now;

        EventBus.emit('COMBAT:ATTACK_EXECUTED', {
            target:    this.worldState.target,
            crit:      options.crit,
            timestamp: now,
            combo:     this._comboCount
        });

        EventBus.emit('COMBAT:COMBO_UPDATED', { count: this._comboCount });

        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // W-TAP — отпустить sprint на ~50ms после удара → reset knockback
    // ─────────────────────────────────────────────────────────────

    wTap() {
        if (this._wTapActive) return;
        this._wTapActive = true;

        this.bot.setControlState('sprint', false);
        this.bot.setControlState('forward', false);

        setTimeout(() => {
            if (this.worldState.isInCombat) {
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', true);
            }
            this._wTapActive = false;
        }, 50 + Math.floor(Math.random() * 20)); // +рандом до 20ms

        EventBus.emit('COMBAT:WTAP', { timestamp: Date.now() });
    }

    // ─────────────────────────────────────────────────────────────
    // S-TAP — micro-back: reset sprint для максимального knockback
    // ─────────────────────────────────────────────────────────────

    sTap() {
        if (this._sTapActive) return;
        this._sTapActive = true;

        this.bot.setControlState('back', true);
        this.bot.setControlState('sprint', false);

        setTimeout(() => {
            this.bot.setControlState('back', false);
            if (this.worldState.isInCombat) {
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', true);
            }
            this._sTapActive = false;
        }, 60 + Math.floor(Math.random() * 25));

        EventBus.emit('COMBAT:STAP', { timestamp: Date.now() });
    }

    // ─────────────────────────────────────────────────────────────
    // JUMP RESET — прыжок для обнуления скорости падения → больше критов
    // ─────────────────────────────────────────────────────────────

    jumpReset() {
        if (this._inJumpReset || !this.bot.entity.onGround) return;
        this._inJumpReset = true;

        this.bot.setControlState('jump', true);
        setTimeout(() => {
            this.bot.setControlState('jump', false);
            this._inJumpReset = false;
        }, 100 + Math.floor(Math.random() * 30));

        EventBus.emit('COMBAT:JUMP_RESET', { timestamp: Date.now() });
    }

    // ─────────────────────────────────────────────────────────────
    // REACH CONTROL — держать оптимальную дистанцию 3.5–4.0 блоков
    // ─────────────────────────────────────────────────────────────

    reachControl(distance) {
        if (distance < 3.0) {
            // Слишком близко — чуть отойти
            this.bot.setControlState('forward', false);
            this.bot.setControlState('back', true);
            setTimeout(() => this.bot.setControlState('back', false), 80);
        } else if (distance > 4.0) {
            // Слишком далеко — приблизиться
            this.bot.setControlState('forward', true);
            this.bot.setControlState('sprint', true);
        } else {
            // В зоне — просто держать sprint
            this.bot.setControlState('back', false);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // COMBO EXTENSION — поддержать продолжение комбо
    // ─────────────────────────────────────────────────────────────

    /**
     * @param {number} comboCount
     */
    comboExtend(comboCount) {
        // При длинном комбо — чуть ускорить ритм страфинга
        const strafeInterval = Math.max(600 - comboCount * 40, 300);
        if (!this._comboExtendTimer) {
            this._comboExtendTimer = setInterval(() => {
                if (!this.worldState.isInCombat) {
                    clearInterval(this._comboExtendTimer);
                    this._comboExtendTimer = null;
                    return;
                }
                // Микро-страф смена направления
                const dir = Math.random() > 0.5 ? 'left' : 'right';
                this.bot.setControlState('left',  dir === 'left');
                this.bot.setControlState('right', dir === 'right');
            }, strafeInterval);
        }
    }

    stopComboExtend() {
        if (this._comboExtendTimer) {
            clearInterval(this._comboExtendTimer);
            this._comboExtendTimer = null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // SMART RETREAT — отход с оглядкой (не бежать прямо от врага)
    // ─────────────────────────────────────────────────────────────

    smartRetreat() {
        if (this._retreatActive) return;
        this._retreatActive = true;

        // Диагональный отход — более непредсказуемый
        const diagDir = Math.random() > 0.5 ? 'left' : 'right';
        this.bot.setControlState('back', true);
        this.bot.setControlState(diagDir, true);
        this.bot.setControlState('sprint', true);

        EventBus.emit('COMBAT:RETREAT', { direction: diagDir, timestamp: Date.now() });

        setTimeout(() => {
            this.bot.setControlState('back', false);
            this.bot.setControlState('left', false);
            this.bot.setControlState('right', false);
            this._retreatActive = false;
        }, 400 + Math.floor(Math.random() * 200));
    }

    resetCombo() {
        this._comboCount = 0;
        this.stopComboExtend();
    }

    get comboCount() { return this._comboCount; }
}

module.exports = CombatExecutor;
