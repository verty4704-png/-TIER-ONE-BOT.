const BaseCombat = require('./base_combat')
const vec3 = require('vec3')

class CrystalMode extends BaseCombat {
    constructor(bot, config, movement, anticheat) {
        super(bot, config, movement, anticheat)
        this.name = 'Crystal Mode'
        this.weaponType = 'crystal'
        this.lastPlaceTime = 0
        this.lastBreakTime = 0
    }

    update(target) {
        super.update(target)
        
        if (!this.isActive || !target) return

        const dist = this.getDistance(target)
        const canSee = this.hasLineOfSight(target)

        // Переключение на кристаллы
        this.manageWeapon()

        if (dist <= 5.0 && canSee) {
            this.crystalCombat(target)
        } else {
            this.approachTarget(target)
        }
    }

    approachTarget(target) {
        this.bot.pathfinder.setGoal(new this.bot.pathfinder.goals.GoalFollow(target, 4), true)
        this.bot.setControlState('sprint', true)
    }

    crystalCombat(target) {
        const now = Date.now()
        
        // Остановка для точности
        this.bot.pathfinder.stop()
        
        // Размещение кристалла
        if (now - this.lastPlaceTime > 500) {
            this.placeCrystal(target)
            this.lastPlaceTime = now
        }
        
        // Подрыв кристалла
        if (now - this.lastBreakTime > 300) {
            this.detonateCrystal(target)
            this.lastBreakTime = now
        }
        
        // Движение чтобы избежать урона
        this.evasiveMovement(target)
    }

    placeCrystal(target) {
        // Ищем кристаллы в инвентаре
        const crystal = this.bot.inventory.items().find(item => 
            item.name.includes('end_crystal')
        )
        
        if (!crystal) {
            console.log('[CRYSTAL] No crystals in inventory')
            return
        }

        // Экипируем кристалл
        this.bot.equip(crystal, 'hand')
        
        // Ищем блок под врагом
        const blockBelow = this.bot.blockAt(target.position.offset(0, -1, 0))
        
        if (blockBelow && this.canPlaceCrystal(blockBelow)) {
            this.bot.placeEntity(blockBelow, vec3(0, 1, 0))
            console.log('[CRYSTAL] Crystal placed!')
        }
    }

    detonateCrystal(target) {
        // Ищем кристаллы рядом с врагом
        const crystal = this.bot.nearestEntity(entity => 
            entity.name === 'end_crystal' && 
            entity.position.distanceTo(target.position) < 2
        )
        
        if (crystal) {
            this.bot.attack(crystal)
            console.log('[CRYSTAL] Crystal detonated!')
        }
    }

    canPlaceCrystal(block) {
        // Проверка: блок должен быть обсидианом или бедроком
        return block.name === 'obsidian' || block.name === 'bedrock'
    }

    evasiveMovement(target) {
        // Хаотичное движение чтобы избежать ответных кристаллов
        const time = Date.now() / 1000
        const strafe = Math.sin(time * 3) > 0 ? 'left' : 'right'
        
        this.bot.setControlState(strafe, true)
        this.bot.setControlState('back', Math.random() > 0.5)
        
        // Случайные прыжки
        if (Math.random() < 0.1 && this.bot.entity.onGround) {
            this.bot.setControlState('jump', true)
            setTimeout(() => {
                this.bot.setControlState('jump', false)
            }, 100)
        }
    }

    manageWeapon() {
        const crystal = this.bot.inventory.items().find(item => 
            item.name.includes('end_crystal')
        )
        
        if (crystal && (!this.bot.heldItem || !this.bot.heldItem.name.includes('end_crystal'))) {
            this.bot.equip(crystal, 'hand')
        }
    }
}

module.exports = CrystalMode
