/**
 * @fileoverview ReplayRecorder HT1 — оригинальный рекордер + запись результата боя.
 */

const fs   = require('fs');
const path = require('path');
const EventBus = require('../core/EventBus');

class ReplayRecorder {
    constructor() {
        this.isRecording = false;
        this.events      = [];
        this.startTime   = 0;
        this._meta       = {};
    }

    /** @param {string} [weaponType] */
    startRecording(weaponType = 'unknown') {
        this.isRecording = true;
        this.events      = [];
        this.startTime   = Date.now();
        this._meta       = { weaponType, startTime: this.startTime };
    }

    /** @param {'win'|'loss'|'draw'} [result] */
    stopRecording(result = 'draw') {
        if (!this.isRecording) return;
        this.isRecording   = false;
        this._meta.result  = result;
        this._meta.durationMs = Date.now() - this.startTime;
        this.saveToFile();
    }

    /** @param {string} type  @param {any} data */
    recordEvent(type, data) {
        if (!this.isRecording) return;
        this.events.push({ timestamp: Date.now() - this.startTime, type, data });
    }

    saveToFile() {
        const replayDir = path.join(__dirname, '../../replays');
        if (!fs.existsSync(replayDir)) fs.mkdirSync(replayDir, { recursive: true });

        const filename = `replay_${Date.now()}_${this._meta.result}.json`;
        const payload  = { meta: this._meta, events: this.events };
        fs.writeFileSync(path.join(replayDir, filename), JSON.stringify(payload, null, 2));
        console.log(`[Replay] Saved → ${filename}  (${this.events.length} events, ${this._meta.result})`);
    }
}

module.exports = ReplayRecorder;
