class ItemManager {
    constructor(bot) {
        this.bot = bot;
    }

    equipBestWeapon() {
        const weapons = this.bot.inventory.items().filter(i => 
            i.name.includes('sword') || i.name.includes('axe')
        );

        if (weapons.length === 0) return;

        // Приоритет: netherite > diamond > iron
        const priority = ['netherite', 'diamond', 'iron'];
        let bestWeapon = null;
        let bestPriority = -1;

        for (const weapon of weapons) {
            for (let i = 0; i < priority.length; i++) {
                if (weapon.name.includes(priority[i]) && i > bestPriority) {
                    bestPriority = i;
                    bestWeapon = weapon;
                    break;
                }
            }
        }

        if (bestWeapon && bestWeapon !== this.bot.heldItem) {
            this.bot.equip(bestWeapon, 'hand');
        }
    }

    creativeEquip(items) {
        for (const item of items) {
            this.bot.chat(`/give @s ${item} 64`);
        }
    }
}

module.exports = ItemManager;
