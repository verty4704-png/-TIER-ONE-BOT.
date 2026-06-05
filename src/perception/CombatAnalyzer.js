/**
 * @fileoverview CombatAnalyzer HT1 — оригинальный модуль + HT1 хелперы.
 */
class CombatAnalyzer {
    constructor(worldState) {
        this.worldState = worldState;
    }

    // ── оригинальные методы ────────────────────────────────────

    canAttack() {
        return this.worldState.myCooldown <= 0.05;
    }

    isInRange(distance = 4.0) {
        if (!this.worldState.target) return false;
        return this.worldState.bot.entity.position
            .distanceTo(this.worldState.target.position) <= distance;
    }

    shouldCrit() {
        return this.worldState.bot.entity.onGround && Math.random() < 0.90;
    }

    shouldWTap() {
        return Math.random() < 0.95;
    }

    // ── HT1 расширения ────────────────────────────────────────

    shouldSTap(distance) {
        // S-tap при дистанции < 3 и готовом кулдауне
        return distance < 3.0 && this.canAttack() && Math.random() < 0.70;
    }

    shouldJumpReset(comboCount) {
        // Jump reset при комбо >= 2 и на земле
        return this.worldState.bot.entity.onGround
            && comboCount >= 2
            && Math.random() < 0.65;
    }

    shouldReachControl(distance) {
        // Держать reach control при дистанции 3.5–4.2
        return distance > 3.5 && distance < 4.2;
    }

    shouldSmartRetreat() {
        return this.worldState.bot.health < 8;
    }

    /**
     * Общая оценка угрозы 0–1
     * @param {number} distance
     * @returns {number}
     */
    threatLevel(distance) {
        const hp = this.worldState.bot.health ?? 20;
        const hpFactor = 1 - (hp / 20);
        const distFactor = Math.max(0, 1 - distance / 6);
        return Math.min(1, hpFactor * 0.6 + distFactor * 0.4);
    }
}

module.exports = CombatAnalyzer;
