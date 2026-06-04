const fs = require('fs');
const path = require('path');

class ReplayRecorder {
    constructor() {
        this.isRecording = false;
        this.events = [];
        this.startTime = 0;
    }

    startRecording() {
        this.isRecording = true;
        this.events = [];
        this.startTime = Date.now();
    }

    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        this.saveToFile();
    }

    recordEvent(type, data) {
        if (!this.isRecording) return;

        this.events.push({
            timestamp: Date.now() - this.startTime,
            type,
            data
        });
    }

    saveToFile() {
        const replayDir = path.join(__dirname, '../../replays');
        if (!fs.existsSync(replayDir)) {
            fs.mkdirSync(replayDir);
        }

        const filename = `replay_${Date.now()}.json`;
        const filepath = path.join(replayDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(this.events, null, 2));
        console.log(`[Replay] Saved to ${filename}`);
    }
}

module.exports = ReplayRecorder;
