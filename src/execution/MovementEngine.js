/**
 * @fileoverview MovementEngine HT1 — оригинальный движок + HT1 улучшения.
 */

class MovementEngine {
    constructor(bot, worldState) {
        this.bot        = bot;
        this.worldState = worldState;
        this._strafeTimer = null;
    }

    strafe(direction = 'left') {
        this.bot.setControlState('left',  direction === 'left');
        this.bot.setControlState('right', direction === 'right');
    }

    approach(distance = 3.0) {
        if (!this.worldState.target) return;
        const { GoalFollow } = require('mineflayer-pathfinder').goals;
        this.bot.pathfinder.setGoal(new GoalFollow(this.worldState.target, distance), true);
        this.bot.setControlState('sprint', true);
    }

    resetControls() {
        ['forward','back','left','right','sprint','jump'].forEach(k =>
            this.bot.setControlState(k, false)
        );
        try { this.bot.pathfinder.stop(); } catch (_) {}
    }

    /**
     * Периодический страф с изменением направления — HT1 паттерн
     * @param {number} intervalMs   базовый интервал смены направления
     */
    startDynamicStrafe(intervalMs = 700) {
        this.stopDynamicStrafe();
        let dir = Math.random() > 0.5 ? 'left' : 'right';
        this.strafe(dir);

        this._strafeTimer = setInterval(() => {
            if (!this.worldState.isInCombat) { this.stopDynamicStrafe(); return; }
            // Иногда держим направление дольше (HT1-like)
            if (Math.random() > 0.35) {
                dir = dir === 'left' ? 'right' : 'left';
            }
            this.strafe(dir);
        }, intervalMs + Math.floor(Math.random() * 200 - 100));
    }

    stopDynamicStrafe() {
        if (this._strafeTimer) {
            clearInterval(this._strafeTimer);
            this._strafeTimer = null;
        }
        this.bot.setControlState('left', false);
        this.bot.setControlState('right', false);
    }

    /**
     * Навестить цель и удерживать sprint
     * @param {number} targetDist  желаемая дистанция (по умолчанию 3.2 для reach control)
     */
    chaseTarget(targetDist = 3.2) {
        if (!this.worldState.target) return;
        try {
            const { GoalFollow } = require('mineflayer-pathfinder').goals;
            this.bot.pathfinder.setGoal(new GoalFollow(this.worldState.target, targetDist), true);
        } catch (_) {
            this.bot.setControlState('forward', true);
        }
        this.bot.setControlState('sprint', true);
    }
}

module.exports = MovementEngine;
