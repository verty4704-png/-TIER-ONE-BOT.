class Anticheat {
    constructor(bot, config) {
        this.bot = bot
        this.config = config
    }

    humanizeDelay(baseDelay) {
        if (!this.config.randomizeTiming) return baseDelay
        
        // Добавляем случайную вариацию ±20%
        const variance = baseDelay * 0.2
        const randomVariance = (Math.random() - 0.5) * 2 * variance
        
        return Math.max(10, baseDelay + randomVariance)
    }

    addMicroMovements() {
        if (!this.config.microMovements) return
        
        // Микро-движения головой для имитации человека
        if (Math.random() < 0.05) {
            const currentYaw = this.bot.entity.yaw
            const randomOffset = (Math.random() - 0.5) * 0.1
            
            this.bot.look(currentYaw + randomOffset, this.bot.entity.pitch)
        }
    }

    randomizeMovementSpeed(baseSpeed) {
        if (!this.config.humanizeMovement) return baseSpeed
        
        // Случайное изменение скорости ±15%
        const variance = baseSpeed * 0.15
        return baseSpeed + (Math.random() - 0.5) * 2 * variance
    }
}

module.exports = Anticheat
