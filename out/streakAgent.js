"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreakAgent = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class StreakAgent {
    timer;
    workspaceRoot;
    activityTracker; // Using any to avoid circular dependency
    targetFile;
    isRunning = false;
    constructor(workspaceRoot, activityTracker) {
        this.workspaceRoot = workspaceRoot;
        this.activityTracker = activityTracker;
    }
    async start() {
        if (this.isRunning) {
            return;
        }
        // Get configuration
        const config = vscode.workspace.getConfiguration('activityTracker');
        const intervalHours = config.get('streakAgent.intervalHours', 12);
        const enabled = config.get('streakAgent.enabled', false);
        if (!enabled) {
            return;
        }
        // Find a suitable target file
        await this.findTargetFile();
        if (!this.targetFile) {
            vscode.window.showWarningMessage('Streak agent could not find a suitable file to modify.');
            return;
        }
        // Set up timer (convert hours to milliseconds)
        const intervalMs = intervalHours * 60 * 60 * 1000;
        this.timer = setInterval(() => this.performFakeChange(), intervalMs);
        // Run once immediately if configured to do so
        if (config.get('streakAgent.runOnStart', false)) {
            this.performFakeChange();
        }
        this.isRunning = true;
        vscode.window.showInformationMessage(`Streak agent started. Will run every ${intervalHours} hours.`);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.isRunning = false;
        vscode.window.showInformationMessage('Streak agent stopped.');
    }
    async findTargetFile() {
        // Look for a .streakagent file first
        const streakAgentFile = path.join(this.workspaceRoot, '.streakagent');
        if (fs.existsSync(streakAgentFile)) {
            this.targetFile = streakAgentFile;
            return;
        }
        // Try to find a README or similar file
        const commonFiles = [
            'README.md',
            'CHANGELOG.md',
            '.streakagent.md'
        ];
        for (const file of commonFiles) {
            const filePath = path.join(this.workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                this.targetFile = filePath;
                return;
            }
        }
        // Create a .streakagent file if none exists
        try {
            fs.writeFileSync(streakAgentFile, '# Streak Agent\n' +
                '# This file is used by the VS Code Push Activity Logs extension to maintain your GitHub contribution streak.\n' +
                '# You can safely ignore this file.\n' +
                '\n' +
                'Last updated: ' + new Date().toISOString() + '\n');
            this.targetFile = streakAgentFile;
        }
        catch (error) {
            console.error('Failed to create streak agent file:', error);
        }
    }
    async performFakeChange() {
        if (!this.targetFile || !fs.existsSync(this.targetFile)) {
            await this.findTargetFile();
            if (!this.targetFile) {
                vscode.window.showErrorMessage('Streak agent failed: No target file available');
                return;
            }
        }
        try {
            // Read the current content
            const content = fs.readFileSync(this.targetFile, 'utf8');
            // Make a small change - append a timestamp comment
            const newContent = content + `\n<!-- Streak update: ${new Date().toISOString()} -->\n`;
            fs.writeFileSync(this.targetFile, newContent);
            // Wait briefly for the file watcher to detect the change
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Restore the original content
            fs.writeFileSync(this.targetFile, content);
            // Wait again briefly
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Push the logs
            await this.activityTracker.pushLogs();
            console.log(`Streak agent ran successfully at ${new Date().toISOString()}`);
        }
        catch (error) {
            console.error('Streak agent encountered an error:', error);
            vscode.window.showErrorMessage(`Streak agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.StreakAgent = StreakAgent;
//# sourceMappingURL=streakAgent.js.map