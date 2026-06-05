/**
 * @fileoverview WorldState HT1 — оригинал сохранён + интеграция EnemyPredictor и HumanizedAim.
 */

const vec3       = require('vec3');
const EventBus   = require('../core/EventBus');
const Logger     = require('../core/Logger');
const EnemyPredictor = require('./EnemyPredictor');
const HumanizedAim   = require('../execution/HumanizedAim');

class WorldState {
    constructor(bot) {
        this.bot            = bot;
        this.target         = null;
        this.targetVelocity = vec3(0, 0, 0);
        this.lastTargetPos  = null;
        this.myCooldown     = 0;
        this.isInCombat     = false;

        // HT1 additions
        this.predictor  = new EnemyPredictor();
        this.aim        = new HumanizedAim('balanced');
        this._aimAngle  = { yaw: 0, pitch: 0 };
        this._tickCount = 0;

        this._setupListeners();
    }

    _setupListeners() {
        this.bot.on('entityGone', (entity) => {
            if (this.target && entity.id === this.target.id) {
                Logger.warn(`Target ${this.target.username} lost`);
                this.clearTarget();
            }
        });
    }

    setTarget(entity) {
        this.target        = entity;
        this.lastTargetPos = entity.position.clone();
        this.isInCombat    = true;
        this.predictor.reset();
        this.aim.reset();
        EventBus.emit('COMBAT:TARGET_ACQUIRED', { entity });
    }

    clearTarget() {
        if (this.target) EventBus.emit('COMBAT:TARGET_LOST', { entity: this.target });
        this.target         = null;
        this.isInCombat     = false;
        this.targetVelocity = vec3(0, 0, 0);
        this.predictor.reset();
    }

    update() {
        if (!this.target || !this.target.position) return;
        this._tickCount++;

        const currentPos = this.target.position;

        // Скорость из позиции
        if (this.lastTargetPos) {
            this.targetVelocity = currentPos.minus(this.lastTargetPos).scaled(20);
        }
        this.lastTargetPos = currentPos.clone();

        // Обновить предиктор
        this.predictor.update(
            { x: currentPos.x, y: currentPos.y, z: currentPos.z },
            { x: this.targetVelocity.x, y: this.targetVelocity.y, z: this.targetVelocity.z }
        );

        // Плавное прицеливание HumanizedAim
        const idealAngle = HumanizedAim.idealAngle(
            this.bot.entity.position,
            this._getAimTarget()
        );
        this._aimAngle = this.aim.step(this._aimAngle, idealAngle, 0.05);

        // Применить угол к боту
        try {
            this.bot.look(this._aimAngle.yaw, this._aimAngle.pitch, false);
        } catch (_) {}

        // Кулдаун атаки
        if (this.bot.getCooldown) {
            this.myCooldown = this.bot.getCooldown('attack') ?? 0;
        }

        const distance = this.bot.entity.position.distanceTo(currentPos);
        const prediction = this.predictor.predict(3);

        EventBus.emit('WORLD:TICK_UPDATED', {
            botPos:          this.bot.entity.position,
            targetPos:       currentPos,
            targetVelocity:  this.targetVelocity,
            cooldown:        this.myCooldown,
            distance,
            prediction,
            comboCount:      0 // заполняется из CombatExecutor через DecisionEngine
        });
    }

    /**
     * Выбрать точку прицеливания: при высокой вероятности смены направления
     * используем предсказанную позицию (+2 тика), иначе текущую.
     */
    _getAimTarget() {
        const pred = this.predictor.predict(2);
        if (pred.directionChangeProbability > 0.55) {
            return pred.predictedPositions[1] || this.target.position;
        }
        return this.target.position;
    }

    /** @param {number} [ticksAhead=3] */
    getPredictedPosition(ticksAhead = 3) {
        return this.predictor.getPredictedPos(ticksAhead);
    }

    /** @param {'aggressive'|'balanced'|'defensive'|'nervous'|'smooth'} profile */
    setAimProfile(profile) {
        this.aim.setProfile(profile);
        Logger.ht1(`[Aim] Profile set to: ${profile}`);
    }
}

module.exports = WorldState;
