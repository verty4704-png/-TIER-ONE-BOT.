/**
 * @fileoverview UtilityScorer HT1 — расширяет оригинальный scorer.
 * Добавлены: W-Tap, S-Tap, Jump Reset, Reach Control, Combo Extension, Smart Retreat.
 * Все веса адаптируются через AdaptiveLearner.
 * 
 * @typedef {{
 *   attackBase:      number,
 *   critBonus:       number,
 *   comboExtension:  number,
 *   retreatUrgency:  number,
 *   reachControl:    number,
 *   jumpReset:       number,
 *   sTapWeight:      number,
 *   wTapWeight:      number
 * }} UtilityWeights
 */

class UtilityScorer {
    constructor() {
        this.thresholds = {
            lowHealth:    8,
            safeDistance: 6.0,
            attackRange:  3.8,
            reachMax:     4.2
        };

        /** @type {UtilityWeights} */
        this.weights = {
            attackBase:     1.0,
            critBonus:      1.0,
            comboExtension: 1.0,
            retreatUrgency: 1.0,
            reachControl:   1.0,
            jumpReset:      1.0,
            sTapWeight:     1.0,
            wTapWeight:     1.0
        };

        // Состояние combo
        this._comboCount  = 0;
        this._lastHitTime = 0;
        this._comboWindow = 1400; // ms
    }

    /**
     * @param {Object} ws  - world state snapshot
     * @param {number} ws.health
     * @param {number} ws.distance
     * @param {number} ws.cooldown       0–1 (0 = готов)
     * @param {boolean} ws.onGround
     * @param {boolean} ws.targetHasShield
     * @param {boolean} ws.hasAxe
     * @param {number} ws.targetVelocity  magnitude
     * @param {number} ws.comboCount
     * @param {number} ws.timeSinceLastHit ms
     * @returns {Record<string,number>}
     */
    calculateUtilities(ws) {
        const w = this.weights;
        const scores = {
            ATTACK:         0,
            RETREAT:        0,
            EAT:            0,
            STRAFE_LEFT:    0,
            STRAFE_RIGHT:   0,
            WTAP:           0,
            STAP:           0,
            JUMP_RESET:     0,
            REACH_CONTROL:  0,
            COMBO_EXTEND:   0,
            SMART_RETREAT:  0,
            IDLE:           10
        };

        const ready = ws.cooldown <= 0.05;
        const inRange = ws.distance <= this.thresholds.attackRange;

        // ── ATTACK ───────────────────────────────────────────────
        if (ready && inRange) {
            scores.ATTACK = 80 * w.attackBase;
            if (ws.onGround) scores.ATTACK += 15 * w.critBonus;
            if (ws.targetHasShield && !ws.hasAxe) scores.ATTACK -= 40;
        }

        // ── W-TAP (knockback после удара) ──────────────────────
        if (ws.timeSinceLastHit < 200 && ws.timeSinceLastHit > 0) {
            scores.WTAP = 65 * w.wTapWeight;
        }

        // ── S-TAP (micro-retreat для sprint reset) ─────────────
        if (ready && ws.distance < 3.0) {
            scores.STAP = 55 * w.sTapWeight;
        }

        // ── JUMP RESET ─────────────────────────────────────────
        if (ws.onGround && ws.distance < 4.0 && ws.comboCount >= 2) {
            scores.JUMP_RESET = 60 * w.jumpReset;
        }

        // ── REACH CONTROL ─────────────────────────────────────
        if (ws.distance > this.thresholds.attackRange && ws.distance < this.thresholds.reachMax) {
            scores.REACH_CONTROL = 50 * w.reachControl;
        }

        // ── COMBO EXTENSION ───────────────────────────────────
        if (ws.comboCount >= 3) {
            scores.COMBO_EXTEND = (40 + ws.comboCount * 5) * w.comboExtension;
        }

        // ── HEALTH / RETREAT ──────────────────────────────────
        if (ws.health < this.thresholds.lowHealth) {
            scores.EAT           = 95;
            scores.SMART_RETREAT = 90 * w.retreatUrgency;
            scores.RETREAT       = 85 * w.retreatUrgency;
        } else if (ws.health < 14) {
            scores.EAT           = 60;
            scores.SMART_RETREAT = 50 * w.retreatUrgency;
            scores.RETREAT       = 45 * w.retreatUrgency;
        }

        // ── STRAFE ─────────────────────────────────────────────
        if (scores.ATTACK > 50 || scores.RETREAT > 50) {
            scores.STRAFE_LEFT  = 70 + Math.random() * 10;
            scores.STRAFE_RIGHT = 70 + Math.random() * 10;
        }

        return scores;
    }

    /** @param {Record<string,number>} scores */
    getBestAction(scores) {
        let best = 'IDLE', max = 0;
        for (const [action, score] of Object.entries(scores)) {
            if (score > max) { max = score; best = action; }
        }
        return best;
    }

    /** Обновить счётчик комбо */
    registerHit() {
        const now = Date.now();
        if (now - this._lastHitTime < this._comboWindow) {
            this._comboCount++;
        } else {
            this._comboCount = 1;
        }
        this._lastHitTime = now;
        return this._comboCount;
    }

    resetCombo() { this._comboCount = 0; }
    get comboCount() { return this._comboCount; }
}

module.exports = UtilityScorer;
