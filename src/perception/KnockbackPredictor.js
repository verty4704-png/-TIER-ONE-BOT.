/**
 * KnockbackPredictor HT1
 * Предсказывает отбрасывание и траекторию движения противника
 */
const EventBus = require('../core/EventBus');
const Logger = require('../core/Logger');

const KB_MULTIPLIERS = {
    sword: 1.0,
    axe: 0.85,
    crystal: 1.45
};

class KnockbackPredictor {
    constructor() {
        this.lastPrediction = null;
    }

    /**
     * Вычислить вектор направления отбрасывания
     */
    calculateKnockbackVector(attackerPos, targetPos) {
        const dx = targetPos.x - attackerPos.x;
        const dz = targetPos.z - attackerPos.z;
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        return { x: dx / len, z: dz / len };
    }

    /**
     * Вычислить силу отбрасывания на основе оружия и дистанции
     */
    calculateKnockbackStrength({ distance, weaponType = 'sword' }) {
        const weaponMultiplier = KB_MULTIPLIERS[weaponType] ?? 1.0;
        const distanceModifier = Math.max(0.6, 1.15 - distance * 0.1);
        return weaponMultiplier * distanceModifier;
    }

    /**
     * Предсказать позицию через N тиков с учётом отбрасывания
     */
    predictFuturePosition(currentPos, velocity, knockbackVector, strength, ticks = 3) {
        let x = currentPos.x;
        let y = currentPos.y;
        let z = currentPos.z;

        let vx = velocity.x + knockbackVector.x * strength;
        let vz = velocity.z + knockbackVector.z * strength;
        let vy = 0.36;

        for (let i = 0; i < ticks; i++) {
            x += vx;
            y += vy;
            z += vz;
            vx *= 0.91;
            vz *= 0.91;
            vy -= 0.08;
            vy *= 0.98;
        }

        return { x, y, z };
    }

    /**
     * Главный метод: предсказать результат удара
     */
    predictHit(data) {
        const kbVector = this.calculateKnockbackVector(data.attackerPos, data.targetPos);
        const strength = this.calculateKnockbackStrength(data);

        const result = {
            kbVector,
            strength,
            future2Ticks: this.predictFuturePosition(data.targetPos, data.targetVelocity, kbVector, strength, 2),
            future3Ticks: this.predictFuturePosition(data.targetPos, data.targetVelocity, kbVector, strength, 3),
            future4Ticks: this.predictFuturePosition(data.targetPos, data.targetVelocity, kbVector, strength, 4),
            timestamp: Date.now()
        };

        this.lastPrediction = result;

        if (EventBus && EventBus.emit) {
            EventBus.emit('PERCEPTION:KNOCKBACK_PREDICTED', result);
            Logger.ht1(`[KB] Predicted: str=${strength.toFixed(2)} vec=(${kbVector.x.toFixed(2)},${kbVector.z.toFixed(2)})`);
        }

        return result;
    }

    /**
     * Получить последнее предсказание
     */
    getLastPrediction() {
        return this.lastPrediction;
    }
}

module.exports = KnockbackPredictor;
