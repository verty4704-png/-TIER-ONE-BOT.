/**
 * @fileoverview Adaptive Combat Learning — анализирует последние 50 боёв
 * и автоматически подстраивает utility-веса в UtilityScorer.
 * 
 * Алгоритм:
 *  1. Каждые ADAPT_INTERVAL тиков пересчитываем агрегаты из CombatHistoryStore
 *  2. Сравниваем показатели с целевыми (HT1 baseline)
 *  3. Градиентным шагом корректируем веса, не выходя за [MIN, MAX]
 *  4. Публикуем AI:WEIGHTS_UPDATED в EventBus
 */

const EventBus = require('../core/EventBus');
const Logger   = require('../core/Logger');

/** @typedef {import('./UtilityScorer').UtilityWeights} UtilityWeights */

// Целевые показатели игрока HT1
const HT1_TARGETS = {
    winRate:     0.72,
    avgAccuracy: 0.78,
    avgCombo:    4.5,
    avgCps:      10.0,
    avgSurvival: 70
};

const ADAPT_INTERVAL = 200; // тиков
const LEARNING_RATE  = 0.04;
const WEIGHT_MIN     = 0.3;
const WEIGHT_MAX     = 2.5;

class AdaptiveLearner {
    /**
     * @param {import('./CombatHistoryStore')} historyStore
     * @param {import('./UtilityScorer')} scorer
     */
    constructor(historyStore, scorer) {
        this.store   = historyStore;
        this.scorer  = scorer;
        this.tickCount = 0;
        this.lastAdapt = null;
    }

    tick() {
        this.tickCount++;
        if (this.tickCount % ADAPT_INTERVAL !== 0) return;

        const recent = this.store.getRecent(50);
        if (recent.length < 5) return; // нужно минимум 5 боёв

        this._adapt(this.store.aggregate(50));
    }

    /**
     * @param {{winRate:number, avgAccuracy:number, avgCombo:number, avgCps:number, avgSurvival:number}} stats
     */
    _adapt(stats) {
        const w = this.scorer.weights;

        // Чем ниже winRate — тем больше усиливаем ATTACK aggressiveness
        const winDelta = stats.winRate - HT1_TARGETS.winRate;
        w.attackBase = this._clamp(w.attackBase - LEARNING_RATE * winDelta * 20, WEIGHT_MIN, WEIGHT_MAX);

        // Плохая точность → снижаем вес крита (бот слишком спешит)
        const accDelta = stats.avgAccuracy - HT1_TARGETS.avgAccuracy;
        w.critBonus = this._clamp(w.critBonus - LEARNING_RATE * (-accDelta) * 10, WEIGHT_MIN, WEIGHT_MAX);

        // Слабые комбо → усиливаем W-tap / combo extension
        const comboDelta = stats.avgCombo - HT1_TARGETS.avgCombo;
        w.comboExtension = this._clamp(w.comboExtension - LEARNING_RATE * (-comboDelta) * 5, WEIGHT_MIN, WEIGHT_MAX);

        // Выживаемость → баланс отступления
        const survDelta = stats.avgSurvival - HT1_TARGETS.avgSurvival;
        w.retreatUrgency = this._clamp(w.retreatUrgency - LEARNING_RATE * survDelta * 0.02, WEIGHT_MIN, WEIGHT_MAX);

        this.lastAdapt = { stats, weights: { ...w }, timestamp: Date.now() };
        Logger.ht1(`[AdaptiveLearner] Weights updated | win:${(stats.winRate*100).toFixed(0)}% acc:${(stats.avgAccuracy*100).toFixed(0)}% combo:${stats.avgCombo.toFixed(1)}`);

        EventBus.emit('AI:WEIGHTS_UPDATED', { weights: { ...w }, stats });
    }

    _clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

    getLastAdaptInfo() { return this.lastAdapt; }
}

module.exports = AdaptiveLearner;
