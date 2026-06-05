/**
 * @fileoverview Humanized Aim V2 — моделирует человеческое наведение.
 * 
 * Профили:
 *   'aggressive' — быстрый, точный, иногда перелёт
 *   'balanced'   — стандартный HT1 профиль
 *   'defensive'  — осторожный, чуть медленнее
 *   'nervous'    — высокие микровибрации, быстрый
 *   'smooth'     — плавный, почти без ошибок
 * 
 * @typedef {'aggressive'|'balanced'|'defensive'|'nervous'|'smooth'} AimProfile
 * @typedef {{ yaw:number, pitch:number }} Angle
 */

/** Шум Перлина (1D упрощённый): лёгкий непрерывный дрейф */
function smoothNoise(t, freq = 1) {
    return Math.sin(t * freq * 2.39996) * Math.cos(t * freq * 1.61803);
}

/** @type {Record<AimProfile, Object>} */
const PROFILES = {
    aggressive: { speed: 0.38, microError: 1.8, overshoot: 0.15, recoveryRate: 0.55 },
    balanced:   { speed: 0.28, microError: 1.1, overshoot: 0.07, recoveryRate: 0.45 },
    defensive:  { speed: 0.20, microError: 0.8, overshoot: 0.03, recoveryRate: 0.35 },
    nervous:    { speed: 0.42, microError: 2.6, overshoot: 0.20, recoveryRate: 0.60 },
    smooth:     { speed: 0.32, microError: 0.5, overshoot: 0.02, recoveryRate: 0.50 }
};

class HumanizedAim {
    /**
     * @param {AimProfile} [profile='balanced']
     */
    constructor(profile = 'balanced') {
        this.setProfile(profile);
        this._currentYaw   = 0;
        this._currentPitch = 0;
        this._noiseT       = Math.random() * 1000;
        this._overshootRem = 0; // оставшийся перелёт (рад)
    }

    /** @param {AimProfile} profile */
    setProfile(profile) {
        this._profile = PROFILES[profile] || PROFILES.balanced;
        this._profileName = profile;
    }

    get profileName() { return this._profileName; }

    /**
     * Рассчитать следующий угол с имитацией человеческого движения
     * @param {Angle} current   - текущий угол бота
     * @param {Angle} target    - идеальный угол на цель
     * @param {number} dt       - дельта времени (секунды)
     * @returns {Angle}         - угол, который нужно установить
     */
    step(current, target, dt) {
        const p = this._profile;
        this._noiseT += dt;

        // Дельта до цели
        let dYaw   = this._angleDelta(target.yaw,   current.yaw);
        let dPitch = this._angleDelta(target.pitch,  current.pitch);

        // Плавное экспоненциальное приближение (lerp factor)
        const lerpK = Math.min(p.speed * (dt / 0.05), 1.0);

        // Микроошибки: непрерывный шум + случайная микровибрация
        const noiseScale = p.microError * 0.017; // конвертируем градусы → рад
        const microYaw   = smoothNoise(this._noiseT, 3.1) * noiseScale;
        const microPitch = smoothNoise(this._noiseT, 2.3) * noiseScale * 0.6;

        // Перелёт при быстрых движениях (agressive profile)
        if (Math.abs(dYaw) > 0.3 && Math.random() < p.overshoot) {
            this._overshootRem = dYaw * 0.12;
        }
        const overshootDecay = this._overshootRem * 0.7;
        this._overshootRem  -= overshootDecay;

        // Итоговый угол
        const newYaw   = current.yaw   + dYaw   * lerpK + microYaw   + overshootDecay;
        const newPitch = current.pitch + dPitch * lerpK + microPitch;

        return {
            yaw:   newYaw,
            pitch: Math.max(-1.57, Math.min(1.57, newPitch)) // ±90°
        };
    }

    /**
     * Рассчитать угол на позицию врага (используется в WorldState)
     * @param {{ x:number, y:number, z:number }} botPos
     * @param {{ x:number, y:number, z:number }} targetPos
     * @returns {Angle}
     */
    static idealAngle(botPos, targetPos) {
        const dx = targetPos.x - botPos.x;
        const dy = targetPos.y - botPos.y + 1.62; // eye height
        const dz = targetPos.z - botPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        return {
            yaw:   -Math.atan2(-dx, -dz),
            pitch: -Math.atan2(dy, dist)
        };
    }

    /** @private */
    _angleDelta(a, b) {
        let d = a - b;
        while (d > Math.PI)  d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return d;
    }

    /** Сбросить состояние при потере цели */
    reset() {
        this._overshootRem = 0;
    }
}

module.exports = HumanizedAim;
