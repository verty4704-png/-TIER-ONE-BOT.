/**
 * @fileoverview Telemetry HT1 — расширенные метрики MCTier HT1.
 *
 * Метрики:
 *   accuracy        — процент попаданий
 *   cps             — кликов в секунду (скользящее среднее)
 *   comboLength     — максимальная / средняя длина комбо
 *   damageEfficiency — урон за 1 атаку
 *   survivalScore   — интегральный показатель выживаемости
 *   winRate         — процент побед
 */

const EventBus = require('../core/EventBus');

const CPS_WINDOW_MS = 5000; // окно для расчёта CPS

class Telemetry {
    constructor() {
        this._reset();
        this._subscribeEvents();
    }

    _reset() {
        this.stats = {
            // базовые (из оригинала)
            totalAttacks:   0,
            hits:           0,
            damageTaken:    0,
            startTime:      Date.now(),

            // HT1 расширения
            damageDone:     0,
            wins:           0,
            losses:         0,
            comboCurrent:   0,
            comboMax:       0,
            comboHistory:   [],    // массив длин завершённых комбо
            attackTimestamps: [],  // для расчёта CPS
            survivalScores: [],    // массив survival score завершённых боёв
            fightCount:     0
        };
    }

    _subscribeEvents() {
        EventBus.on('COMBAT:ATTACK_EXECUTED', (data) => {
            this.recordAttack(data);
        });
        EventBus.on('COMBAT:DAMAGE_TAKEN', (data) => {
            this.recordDamage(data);
        });
        EventBus.on('COMBAT:COMBO_UPDATED', (data) => {
            this._updateCombo(data.count);
        });
        EventBus.on('METRICS:FIGHT_ENDED', (data) => {
            this._recordFightEnd(data);
        });
    }

    // ── Public API (совместимость с оригиналом) ───────────────

    recordAttack(data) {
        const now = Date.now();
        this.stats.totalAttacks++;
        this.stats.hits++;                          // уточняется при hit-confirm
        this.stats.attackTimestamps.push(now);

        // Очищаем старые временные метки за пределами окна
        const cutoff = now - CPS_WINDOW_MS;
        this.stats.attackTimestamps = this.stats.attackTimestamps.filter(t => t > cutoff);
    }

    /** @param {{ amount?: number }} data */
    recordDamage(data) {
        this.stats.damageTaken += data.amount || 0;
    }

    // ── HT1 методы ────────────────────────────────────────────

    /** @param {number} damage  урон, нанесённый боту */
    recordDamageDone(damage) {
        this.stats.damageDone += damage;
    }

    _updateCombo(count) {
        this.stats.comboCurrent = count;
        if (count > this.stats.comboMax) this.stats.comboMax = count;
    }

    /** Вызывается когда комбо прерывается */
    flushCombo() {
        if (this.stats.comboCurrent > 1) {
            this.stats.comboHistory.push(this.stats.comboCurrent);
        }
        this.stats.comboCurrent = 0;
    }

    /**
     * @param {{ result: 'win'|'loss'|'draw', finalHealth: number, durationMs: number }} data
     */
    _recordFightEnd(data) {
        this.stats.fightCount++;
        if (data.result === 'win')  this.stats.wins++;
        if (data.result === 'loss') this.stats.losses++;

        // Survival score = health_factor * 0.6 + duration_factor * 0.4
        const hf = (data.finalHealth ?? 20) / 20;
        const df = Math.min((data.durationMs ?? 0) / 30000, 1);
        const score = Math.round((hf * 60 + df * 40) * (data.result === 'win' ? 1 : 0.5));
        this.stats.survivalScores.push(score);
        this.flushCombo();
    }

    // ── Расчёт агрегированных метрик ─────────────────────────

    /**
     * Accuracy: hits / totalAttacks
     * @returns {number} 0..1
     */
    getAccuracy() {
        return this.stats.totalAttacks > 0
            ? this.stats.hits / this.stats.totalAttacks
            : 0;
    }

    /**
     * CPS: кликов в секунду за последние 5 секунд
     * @returns {number}
     */
    getCPS() {
        return this.stats.attackTimestamps.length / (CPS_WINDOW_MS / 1000);
    }

    /**
     * Combo: { current, max, avg }
     * @returns {{ current:number, max:number, avg:number }}
     */
    getComboStats() {
        const hist = this.stats.comboHistory;
        const avg = hist.length > 0
            ? hist.reduce((a, b) => a + b, 0) / hist.length
            : 0;
        return { current: this.stats.comboCurrent, max: this.stats.comboMax, avg };
    }

    /**
     * Damage Efficiency: урон за 1 атаку
     * @returns {number}
     */
    getDamageEfficiency() {
        return this.stats.totalAttacks > 0
            ? this.stats.damageDone / this.stats.totalAttacks
            : 0;
    }

    /**
     * Survival Score: среднее по боям
     * @returns {number} 0..100
     */
    getSurvivalScore() {
        const s = this.stats.survivalScores;
        return s.length > 0 ? s.reduce((a, b) => a + b, 0) / s.length : 0;
    }

    /**
     * Win Rate: wins / (wins + losses)
     * @returns {number} 0..1
     */
    getWinRate() {
        const total = this.stats.wins + this.stats.losses;
        return total > 0 ? this.stats.wins / total : 0;
    }

    // ── Полный снапшот (совместимость с оригиналом + HT1) ─────

    getStats() {
        const combo = this.getComboStats();
        return {
            // оригинальные поля
            totalAttacks: this.stats.totalAttacks,
            hits:         this.stats.hits,
            hitRate:      this.getAccuracy(),
            damageTaken:  this.stats.damageTaken,
            uptime:       Date.now() - this.stats.startTime,

            // HT1 метрики
            accuracy:         +(this.getAccuracy() * 100).toFixed(1),
            cps:              +this.getCPS().toFixed(2),
            comboMax:         combo.max,
            comboAvg:         +combo.avg.toFixed(1),
            comboCurrent:     combo.current,
            damageEfficiency: +this.getDamageEfficiency().toFixed(2),
            survivalScore:    +this.getSurvivalScore().toFixed(1),
            winRate:          +(this.getWinRate() * 100).toFixed(1),
            wins:             this.stats.wins,
            losses:           this.stats.losses,
            fightCount:       this.stats.fightCount
        };
    }

    /** Форматированный вывод для !status / status команды */
    formatStatus(health, strategyName) {
        const s = this.getStats();
        return [
            `[HT1 STATUS]`,
            `HP: ${Math.floor(health)}/20`,
            `Mode: ${strategyName}`,
            `Acc: ${s.accuracy}% | CPS: ${s.cps}`,
            `Combo: ${s.comboCurrent} (max ${s.comboMax}, avg ${s.comboAvg})`,
            `DMG eff: ${s.damageEfficiency} | Survival: ${s.survivalScore}`,
            `W/L: ${s.wins}/${s.losses} (${s.winRate}%)`
        ].join('  │  ');
    }
}

module.exports = Telemetry;
