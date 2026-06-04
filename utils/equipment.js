class Equipment {
    constructor(bot, config) {
        this.bot = bot
        this.config = config
    }

    autoEquip() {
        if (!this.config.autoEquip) return

        console.log('[EQUIP] Auto-equipping best gear...')

        // Экипировка брони
        this.equipBestArmor()
        
        // Экипировка оружия
        this.equipBestWeapon()
        
        console.log('[EQUIP] ✓ Equipment optimized')
    }

    equipBestArmor() {
        const armorSlots = {
            helmet: 0,
            chestplate: 1,
            leggings: 2,
            boots: 3
        }

        for (const [slot, index] of Object.entries(armorSlots)) {
            const bestItem = this.findBestItem(slot)
            if (bestItem) {
                this.bot.equip(bestItem, slot)
                console.log(`[EQUIP] Equipped ${bestItem.name} as ${slot}`)
            }
        }
    }

    equipBestWeapon() {
        const priority = ['netherite', 'diamond', 'iron', 'stone', 'wooden']
        
        // Ищем мечи и топоры
        const weapons = this.bot.inventory.items().filter(item => 
            item.name.includes('sword') || item.name.includes('axe')
        )

        let bestWeapon = null
        let bestPriority = -1

        for (const weapon of weapons) {
            for (let i = 0; i < priority.length; i++) {
                if (weapon.name.includes(priority[i])) {
                    if (i > bestPriority) {
                        bestPriority = i
                        bestWeapon = weapon
                    }
                    break
                }
            }
        }

        if (bestWeapon) {
            this.bot.equip(bestWeapon, 'hand')
            console.log(`[EQUIP] Equipped ${bestWeapon.name} as weapon`)
        }
    }

    findBestItem(slot) {
        const priority = this.config.priority[slot] || ['netherite', 'diamond', 'iron']
        const items = this.bot.inventory.items()

        for (const material of priority) {
            const item = items.find(i => i.name.includes(material) && i.name.includes(slot))
            if (item) return item
        }

        return null
    }

    creativeEquip(itemList) {
        console.log('[CREATIVE] Equipping creative items...')
        
        for (const itemName of itemList) {
            this.bot.chat(`/give @s ${itemName} 64`)
        }
        
        // Небольшая задержка для загрузки предметов
        setTimeout(() => {
            this.autoEquip()
        }, 2000)
    }

    eat() {
        const food = this.bot.inventory.items().find(item => 
            item.name.includes('apple') || 
            item.name.includes('bread') || 
            item.name.includes('steak') ||
            item.name.includes('porkchop') ||
            item.name.includes('chicken')
        )

        if (food) {
            this.bot.equip(food, 'hand')
            this.bot.activateItem()
            console.log(`[EAT] Eating ${food.name}`)
            
            // Останавливаем еду через 2 секунды
            setTimeout(() => {
                this.bot.deactivateItem()
            }, 2000)
        }
    }
}

module.exports = Equipment
