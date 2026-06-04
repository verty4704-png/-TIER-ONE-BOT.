class BaseCombat {
    constructor(bot, config, movement, anticheat) {
        this.bot = bot
        this.config = config
        this.movement = movement
        this.anticheat = anticheat
        this.target = null
        this.isActive = false
        this.lastAttackTime = 0
        this.comboCount = 0
    }

    start(target) {
        this.target = target
        this.isActive = true
        this.comboCount = 0
        console.log(`[COMBAT] ${this.config.name} started`)
    }

    stop() {
        this.isActive = false
        this.target = null
        this.comboCount = 0
        this.movement.resetControls()
        console.log('[COMBAT] Combat stopped')
    }

    update(target) {
        if (!this.isActive || !target) return
        
        this.target = target
    }

    canAttack() {
        // Проверка кулдауна (1.9+)
        if (this.bot.getCooldown) {
            return this.bot.getCooldown('attack') === 0
        }
        return true
    }

    getDistance(entity) {
        return this.bot.entity.position.distanceTo(entity.position)
    }

    hasLineOfSight(entity) {
        const block = this.bot.blockAtCursor(5)
        return block && block.entity === entity
    }

    performAttack() {
        const now = Date.now()
        if (now - this.lastAttackTime < this.bot.config?.combat?.attackCooldown || 400) {
            return false
        }

        this.bot.attack(this.target)
        this.lastAttackTime = now
        this.comboCount++

        return true
    }

    performCrit() {
        if (this.bot.entity.onGround) {
            this.bot.setControlState('jump', true)
            setTimeout(() => {
                this.bot.setControlState('jump', false)
            }, 100)
            return true
        }
        return false
    }

    performWTap() {
        const delay = this.randomInt(
            this.bot.config?.combat?.wTapDelayMin || 30,
            this.bot.config?.combat?.wTapDelayMax || 60
        )
        
        this.bot.setControlState('sprint', false)
        setTimeout(() => {
            if (this.isActive) {
                this.bot.setControlState('sprint', true)
            }
        }, delay)
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}

module.exports = BaseCombat
