const vec3 = require('vec3')

class Movement {
    constructor(bot, config) {
        this.bot = bot
        this.config = config
    }

    resetControls() {
        this.bot.setControlState('forward', false)
        this.bot.setControlState('back', false)
        this.bot.setControlState('left', false)
        this.bot.setControlState('right', false)
        this.bot.setControlState('sprint', false)
        this.bot.setControlState('jump', false)
    }

    strafeCircle(target, radius = 2.5, speed = 1) {
        const time = Date.now() / 1000
        const angle = time * speed
        
        const x = target.position.x + Math.cos(angle) * radius
        const z = target.position.z + Math.sin(angle) * radius
        
        const goalPos = vec3(x, target.position.y, z)
        
        this.bot.lookAt(target.position.offset(0, 1.6, 0))
        this.bot.pathfinder.setGoal(new this.bot.pathfinder.goals.GoalBlock(goalPos.x, goalPos.y, goalPos.z), true)
    }

    strafeAggressive(target) {
        const time = Date.now() / 500
        
        // Быстрая смена направлений
        const strafeLeft = Math.sin(time * 2) > 0
        const moveForward = Math.cos(time) > -0.5
        
        this.bot.setControlState('left', strafeLeft)
        this.bot.setControlState('right', !strafeLeft)
        this.bot.setControlState('forward', moveForward)
        this.bot.setControlState('sprint', true)
        
        this.bot.lookAt(target.position.offset(0, 1.6, 0))
    }

    evasiveMovement() {
        // Хаотичное движение для уклонения
        const rand = Math.random()
        
        if (rand < 0.33) {
            this.bot.setControlState('left', true)
            this.bot.setControlState('right', false)
        } else if (rand < 0.66) {
            this.bot.setControlState('right', true)
            this.bot.setControlState('left', false)
        } else {
            this.bot.setControlState('back', true)
            this.bot.setControlState('forward', false)
        }
        
        // Случайные прыжки
        if (Math.random() < 0.1 && this.bot.entity.onGround) {
            this.bot.setControlState('jump', true)
            setTimeout(() => {
                this.bot.setControlState('jump', false)
            }, 100)
        }
    }
}

module.exports = Movement
