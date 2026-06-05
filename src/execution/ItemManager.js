/**
 * @fileoverview ItemManager — оригинальный модуль сохранён без изменений.
 */
class ItemManager {
    constructor(bot) {
        this.bot = bot;
    }

    equipBestWeapon() {
        const weapons = this.bot.inventory.items().filter(i =>
            i.name.includes('sword') || i.name.includes('axe')
        );
        if (weapons.length === 0) return;

        const priority = ['netherite', 'diamond', 'iron'];
        let bestWeapon = null, bestPriority = -1;

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
            this.bot.equip(bestWeapon, 'hand').catch(() => {});
        }
    }

    /**
     * Получить тип текущего оружия
     * @returns {'sword'|'axe'|'other'}
     */
    getCurrentWeaponType() {
        const held = this.bot.heldItem;
        if (!held) return 'other';
        if (held.name.includes('sword')) return 'sword';
        if (held.name.includes('axe'))   return 'axe';
        return 'other';
    }

    creativeEquip(items) {
        for (const item of items) {
            this.bot.chat(`/give @s ${item} 64`);
        }
    }

    equipFood() {
        const food = this.bot.inventory.items().find(i =>
            i.name.includes('golden_apple') || i.name.includes('cooked')
        );
        if (food) this.bot.equip(food, 'hand').catch(() => {});
    }

    useItem() {
        this.bot.activateItem();
    }
}

module.exports = ItemManager;
