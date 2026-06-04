class CombatAnalyzer {
    constructor(worldState) {
        this.worldState = worldState;
    }

    canAttack() {
        return this.worldState.myCooldown === 0;
    }

    isInRange(distance = 4.0) {
        if (!this.worldState.target) return false;
        return this.worldState.bot.entity.position.distanceTo(this.worldState.target.position) <= distance;
    }

    shouldCrit() {
        // Логика: делаем крит если на земле и 90% шанс
        return this.worldState.bot.entity.onGround && Math.random() < 0.90;
    }

    shouldWTap() {
        // W-tap после каждого удара для knockback
        return Math.random() < 0.95;
    }
}

module.exports = CombatAnalyzer;
