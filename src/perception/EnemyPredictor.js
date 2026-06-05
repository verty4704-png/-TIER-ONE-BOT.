/**
 * @fileoverview Advanced Prediction — прогнозирует позицию врага на 3–5 тиков вперёд.
 * Использует скользящее среднее скорости + Kalman-подобную фильтрацию.
 * Дополнительно определяет вероятность смены направления движения.
 *
 * @typedef {{ x:number, y:number, z:number }} Vec3Like
 * @typedef {{
 *   position: Vec3Like,
 *   velocitySmoothed: Vec3Like,
 *   directionChangeProbability: number,
 *   predictedPositions: Vec3Like[]
 * }} PredictionResult
 */

const TICK_DT    = 0.05;  // секунд на тик
const HISTORY_LEN = 10;   // хранить N тиков
const ALPHA       = 0.35; // коэффициент EMA для скорости
const GRAVITY     = -0.08; // приблизительное y-ускорение в Minecraft (тики)

class EnemyPredictor {
    constructor() {
        /** @type {Array<{pos: Vec3Like, vel: Vec3Like, ts: number}>} */
        this._history = [];
        /** @type {Vec3Like} */
        this._velEMA  = { x: 0, y: 0, z: 0 };
        /** @type {Vec3Like} */
        this._prevVelEMA = { x: 0, y: 0, z: 0 };
    }

    /**
     * Обновить состояние предиктора (вызывать каждый тик)
     * @param {Vec3Like} position
     * @param {Vec3Like} rawVelocity
     */
    update(position, rawVelocity) {
        // EMA сглаживание скорости
        this._prevVelEMA = { ...this._velEMA };
        this._velEMA = {
            x: ALPHA * rawVelocity.x + (1 - ALPHA) * this._velEMA.x,
            y: ALPHA * rawVelocity.y + (1 - ALPHA) * this._velEMA.y,
            z: ALPHA * rawVelocity.z + (1 - ALPHA) * this._velEMA.z
        };

        this._history.push({ pos: { ...position }, vel: { ...this._velEMA }, ts: Date.now() });
        if (this._history.length > HISTORY_LEN) this._history.shift();
    }

    /**
     * Получить прогноз позиций на ticksAhead тиков (3–5)
     * @param {number} ticksAhead  3..5
     * @returns {PredictionResult}
     */
    predict(ticksAhead = 3) {
        ticksAhead = Math.min(Math.max(ticksAhead, 1), 5);

        const base = this._history[this._history.length - 1];
        if (!base) return this._empty();

        const predicted = [];
        let px = base.pos.x;
        let py = base.pos.y;
        let pz = base.pos.z;
        let vx = this._velEMA.x;
        let vy = this._velEMA.y;
        let vz = this._velEMA.z;

        for (let t = 1; t <= ticksAhead; t++) {
            px += vx * TICK_DT;
            py += vy * TICK_DT;
            pz += vz * TICK_DT;
            vy += GRAVITY * TICK_DT; // гравитация
            predicted.push({ x: px, y: py, z: pz });
        }

        return {
            position: base.pos,
            velocitySmoothed: { ...this._velEMA },
            directionChangeProbability: this._calcDirectionChangeProbability(),
            predictedPositions: predicted
        };
    }

    /**
     * Вероятность смены направления на основе угла между текущим и предыдущим вектором скорости
     * @returns {number}  0..1
     */
    _calcDirectionChangeProbability() {
        const cur  = this._velEMA;
        const prev = this._prevVelEMA;

        const dot = cur.x * prev.x + cur.z * prev.z;
        const magCur  = Math.sqrt(cur.x**2  + cur.z**2)  + 1e-6;
        const magPrev = Math.sqrt(prev.x**2 + prev.z**2) + 1e-6;
        const cosAngle = dot / (magCur * magPrev);

        // cosAngle < 0.7 → угол > 45° → высокая вероятность смены
        return Math.max(0, Math.min(1, 1 - (cosAngle + 1) / 2));
    }

    /** Получить предсказанную позицию через N тиков (удобный хелпер) */
    getPredictedPos(ticksAhead = 3) {
        const result = this.predict(ticksAhead);
        return result.predictedPositions[ticksAhead - 1] || result.position;
    }

    _empty() {
        return { position: {x:0,y:0,z:0}, velocitySmoothed: {x:0,y:0,z:0}, directionChangeProbability: 0, predictedPositions: [] };
    }

    reset() {
        this._history = [];
        this._velEMA = { x:0, y:0, z:0 };
        this._prevVelEMA = { x:0, y:0, z:0 };
    }
}

module.exports = EnemyPredictor;
