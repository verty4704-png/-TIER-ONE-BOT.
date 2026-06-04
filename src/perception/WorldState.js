const vec3 = require('vec3');
const EventBus = require('../core/EventBus');
const Logger = require('../core/Logger');

class WorldState {
    constructor(bot) {
        this.bot = bot;
        this.target = null;
        this.targetVelocity = vec3(0, 0, 0);
        this.lastTargetPos = null;
        this.myCooldown = 0;
        this.isInCombat = false;
        
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
        this.target = entity;
        this.lastTargetPos = entity.position.clone();
        this.isInCombat = true;
        EventBus.emit('COMBAT:TARGET_ACQUIRED', { entity });
    }

    clearTarget() {
        if (this.target) {
            EventBus.emit('COMBAT:TARGET_LOST', { entity: this.target });
        }
        this.target = null;
        this.isInCombat = false;
        this.targetVelocity = vec3(0, 0, 0);
    }

    update() {
        if (!this.target || !this.target.position) return;

        const currentPos = this.target.position;
        if (this.lastTargetPos) {
            this.targetVelocity = currentPos.minus(this.lastTargetPos).scaled(20);
        }
        this.lastTargetPos = currentPos.clone();

        if (this.bot.getCooldown) {
            this.myCooldown = this.bot.getCooldown('attack');
        }

        EventBus.emit('WORLD:TICK_UPDATED', {
            botPos: this.bot.entity.position,
            targetPos: this.target.position,
            targetVelocity: this.targetVelocity,
            cooldown: this.myCooldown,
            distance: this.bot.entity.position.distanceTo(this.target.position)
        });
    }

    getPredictedPosition(ticksAhead = 3) {
        if (!this.target) return null;
        const timeDelta = ticksAhead * 0.05;
        return this.target.position.plus(this.targetVelocity.scaled(timeDelta));
    }
}

module.exports = WorldState;
