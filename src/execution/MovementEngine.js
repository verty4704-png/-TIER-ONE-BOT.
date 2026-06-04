class MovementEngine {
    constructor(bot, worldState) {
        this.bot = bot;
        this.worldState = worldState;
    }

    strafe(direction = 'left') {
        this.bot.setControlState('left', direction === 'left');
        this.bot.setControlState('right', direction === 'right');
    }

    approach(distance = 3.0) {
        if (!this.worldState.target) return;
        
        const GoalFollow = this.bot.pathfinder.goals.GoalFollow;
        this.bot.pathfinder.setGoal(new GoalFollow(this.worldState.target, distance), true);
        this.bot.setControlState('sprint', true);
    }

    resetControls() {
        this.bot.setControlState('forward', false);
        this.bot.setControlState('back', false);
        this.bot.setControlState('left', false);
        this.bot.setControlState('right', false);
        this.bot.setControlState('sprint', false);
        this.bot.setControlState('jump', false);
        this.bot.pathfinder.stop();
    }
}

module.exports = MovementEngine;
