module.exports = {
    server: {
        host: 'localhost',
        port: 25565,
        username: 'TierOneHT1',
        version: 'auto',
        auth: 'offline'
    },

    op: {
        autoRequest: true,
        requestMessage: 'Please grant OP: /op TierOneHT1'
    },

    creative: {
        items: [
            'netherite_sword',
            'netherite_axe',
            'netherite_helmet',
            'netherite_chestplate',
            'netherite_leggings',
            'netherite_boots',
            'golden_apple',
            'ender_pearl'
        ]
    },

    ht1: {
        // Начальная стратегия: aggressive | balanced | defensive | sword | axe | crystal
        defaultStrategy: 'balanced',

        // Профиль прицеливания по умолчанию: aggressive | balanced | defensive | nervous | smooth
        defaultAimProfile: 'balanced',

        // Адаптивное обучение
        adaptiveLearning: {
            enabled: true,
            adaptIntervalTicks: 200,
            learningRate: 0.04
        },

        // Параметры прицеливания
        aim: {
            predictionTicks: 3   // 3..5
        },

        // Авто-переключение стратегии по HP
        autoStrategySwitch: {
            enabled: true,
            lowHP: 8,            // < 8 HP → defensive
            midHP: 14            // < 14 HP → balanced
        }
    }
};
