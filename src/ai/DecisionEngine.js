/**
 * @fileoverview DecisionEngine HT1 — расширяет оригинальный движок решений.
 * Интегрирует AdaptiveLearner, UtilityScorer HT1, все боевые техники.
 */

const UtilityScorer  = require('./UtilityScorer');
const AdaptiveLearner = require('./AdaptiveLearner');
const EventBus       = require('../core/EventBus');
const Logger         = require('../core/Logger');

class DecisionEngine {
    /**
     * @param {import('../perception/WorldState')} worldState
     * @param {import('../strategy/StrategyManager')} strategyManager
     * @param {import('../perception/CombatAnalyzer')} combatAnalyzer
     * @param {import('./CombatHistoryStore')} historyStore
     */
    constructor(worldState, strategyManager, combatAnalyzer, historyStore) {
        this.worldState      = worldState;
        this.strategyManager = strategyManager;
        this.combatAnalyzer  = combatAnalyzer;
        this.scorer          = new UtilityScorer();
        this.learner         = new AdaptiveLearner(historyStore, this.scorer);
        this._tickCount      = 0;
    }

    tick(worldData) {
        this._tickCount++;
        this.learner.tick();

        if (!this.worldState.isInCombat || !this.worldState.target) return;

        const executor  = this.strategyManager.combatExecutor;
        const movement  = this.strategyManager.movementEngine;
        const { distance, cooldown, prediction } = worldData;
        const bot       = this.worldState.bot;

        // ── Сборка контекста ──────────────────────────────────
        const context = {
            health:            bot.health ?? 20,
            distance,
            cooldown:          cooldown ?? 0,
            onGround:          bot.entity.onGround,
            targetHasShield:   false,
            hasAxe:            this.strategyManager.currentStrategy.includes('axe'),
            targetVelocity:    prediction
                ? Math.sqrt(prediction.velocitySmoothed.x**2 + prediction.velocitySmoothed.z**2)
                : 0,
            comboCount:        executor.comboCount ?? 0,
            timeSinceLastHit:  executor.lastAttackTime ? Date.now() - executor.lastAttackTime : 9999
        };

        // ── Utility scoring ───────────────────────────────────
        const scores    = this.scorer.calculateUtilities(context);
        const bestAction = this.scorer.getBestAction(scores);

        // ── Диспетчеризация действий ─────────────────────────
        switch (bestAction) {
            case 'ATTACK':
                this.strategyManager.executeCurrentStrategy(worldData);
                break;

            case 'WTAP':
                executor.wTap();
                break;

            case 'STAP':
                executor.sTap();
                break;

            case 'JUMP_RESET':
                executor.jumpReset();
                break;

            case 'REACH_CONTROL':
                executor.reachControl(distance);
                break;

            case 'COMBO_EXTEND':
                executor.comboExtend(context.comboCount);
                this.strategyManager.executeCurrentStrategy(worldData);
                break;

            case 'SMART_RETREAT':
                executor.smartRetreat();
                movement.stopDynamicStrafe();
                break;

            case 'RETREAT':
            case 'EAT':
                movement.resetControls();
                movement.strafe(Math.random() > 0.5 ? 'left' : 'right');
                break;

            default:
                // IDLE / STRAFE
                break;
        }

        // Логируем топ-3 действия каждые 100 тиков для отладки
        if (process.env.DEBUG && this._tickCount % 100 === 0) {
            const top3 = Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([k, v]) => `${k}:${v.toFixed(1)}`)
                .join(' | ');
            Logger.debug(`[DE] scores → ${top3} → best: ${bestAction}`);
        }
    }
}

module.exports = DecisionEngine;
