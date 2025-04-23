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
exports.ActivityUtils = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ActivityUtils {
    static DEFAULT_CONFIG = {
        ignoredPaths: [
            '.activity-logs',
            'node_modules',
            '.git',
            '.vscode',
            'dist',
            'build',
            '.DS_Store'
        ],
        autoSaveInterval: 30 * 60 * 1000, // 30 minutes
        maxChangesBeforeAutoSave: 100
    };
    static async getFileContent(uri) {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            return document.getText();
        }
        catch {
            return '';
        }
    }
    static async countLines(uri) {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            return document.lineCount;
        }
        catch {
            return 0;
        }
    }
    static getFileExtension(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return ext ? ext.slice(1) : 'unknown';
    }
    static formatDuration(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
    static getPeakActivityHour(changes) {
        const hourCounts = new Array(24).fill(0);
        changes.forEach(change => {
            const hour = new Date(change.timestamp).getHours();
            hourCounts[hour]++;
        });
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        return `${peakHour}:00-${(peakHour + 1) % 24}:00`;
    }
    static async showNotification(message, type = 'info') {
        const actions = ['View Details', 'Dismiss'];
        const selection = await vscode.window.showInformationMessage(message, ...actions);
        if (selection === 'View Details') {
            const details = await vscode.workspace.openTextDocument({
                content: message,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(details);
        }
    }
    static shouldIgnoreFile(relativePath, ignoredPaths) {
        return ignoredPaths.some(pattern => relativePath.includes(pattern));
    }
}
exports.ActivityUtils = ActivityUtils;
//# sourceMappingURL=index.js.map