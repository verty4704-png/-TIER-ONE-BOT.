/**
 * @fileoverview Хранилище истории боёв для адаптивного обучения.
 * Хранит последние MAX_FIGHTS записей, используется AdaptiveLearner.
 * 
 * @typedef {{
 *   id: string,
 *   timestamp: number,
 *   durationMs: number,
 *   result: 'win'|'loss'|'draw',
 *   weaponType: 'sword'|'axe'|'crystal',
 *   attacks: number,
 *   hits: number,
 *   damageDone: number,
 *   damageTaken: number,
 *   comboLengths: number[],
 *   wTapCount: number,
 *   sTapCount: number,
 *   jumpResets: number,
 *   retreatCount: number,
 *   cpsAvg: number,
 *   survivalScore: number
 * }} FightRecord
 */

const MAX_FIGHTS = 50;

class CombatHistoryStore {
    constructor() {
        /** @type {FightRecord[]} */
        this.history = [];
        /** @type {FightRecord|null} */
        this._current = null;
    }

    /**
     * Начать запись нового боя
     * @param {'sword'|'axe'|'crystal'} weaponType
     */
    startFight(weaponType) {
        this._current = {
            id: `fight_${Date.now()}`,
            timestamp: Date.now(),
            durationMs: 0,
            result: 'draw',
            weaponType,
            attacks: 0,
            hits: 0,
            damageDone: 0,
            damageTaken: 0,
            comboLengths: [],
            wTapCount: 0,
            sTapCount: 0,
            jumpResets: 0,
            retreatCount: 0,
            cpsAvg: 0,
            survivalScore: 0
        };
    }

    /** @param {Partial<FightRecord>} patch */
    updateCurrent(patch) {
        if (!this._current) return;
        Object.assign(this._current, patch);
    }

    /** @param {'win'|'loss'|'draw'} result */
    endFight(result, finalHealth = 20) {
        if (!this._current) return;
        this._current.durationMs = Date.now() - this._current.timestamp;
        this._current.result = result;

        // Survival score: 0–100, чем больше HP и длиннее бой — тем выше
        const healthFactor = finalHealth / 20;
        const durationBonus = Math.min(this._current.durationMs / 30000, 1);
        this._current.survivalScore = Math.round(
            (healthFactor * 70 + durationBonus * 30) * (result === 'win' ? 1 : 0.5)
        );

        this.history.push(this._current);
        if (this.history.length > MAX_FIGHTS) {
            this.history.shift();
        }
        this._current = null;
    }

    /** @returns {FightRecord[]} */
    getRecent(n = MAX_FIGHTS) {
        return this.history.slice(-n);
    }

    /** @returns {FightRecord|null} */
    getCurrent() { return this._current; }

    /**
     * Статистика по последним n боям
     * @returns {{winRate:number, avgAccuracy:number, avgCombo:number, avgCps:number, avgSurvival:number}}
     */
    aggregate(n = MAX_FIGHTS) {
        const fights = this.getRecent(n);
        if (fights.length === 0) return { winRate: 0.5, avgAccuracy: 0.7, avgCombo: 2, avgCps: 8, avgSurvival: 50 };

        const wins = fights.filter(f => f.result === 'win').length;
        const totalAcc = fights.reduce((s, f) => s + (f.attacks > 0 ? f.hits / f.attacks : 0), 0);
        const totalCombo = fights.reduce((s, f) => {
            if (f.comboLengths.length === 0) return s;
            return s + f.comboLengths.reduce((a, b) => a + b, 0) / f.comboLengths.length;
        }, 0);
        const totalCps = fights.reduce((s, f) => s + f.cpsAvg, 0);
        const totalSurv = fights.reduce((s, f) => s + f.survivalScore, 0);

        return {
            winRate:     wins / fights.length,
            avgAccuracy: totalAcc / fights.length,
            avgCombo:    totalCombo / fights.length,
            avgCps:      totalCps / fights.length,
            avgSurvival: totalSurv / fights.length
        };
    }
}

module.exports = CombatHistoryStore;
