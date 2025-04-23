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
exports.ActivityTracker = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const GitService_1 = require("./GitService");
class ActivityTracker {
    workspaceRoot;
    config;
    logsDir;
    gitService;
    currentLog;
    fileWatcher;
    statusBarItem;
    projectDetails;
    constructor(workspaceRoot, config) {
        this.workspaceRoot = workspaceRoot;
        this.config = { ...utils_1.ActivityUtils.DEFAULT_CONFIG, ...config };
        this.logsDir = path.join(workspaceRoot, '.activity-logs');
        this.gitService = new GitService_1.GitService();
        // Initialize with defaults (will be properly set in initialize())
        this.currentLog = this.createEmptyLog();
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.projectDetails = {
            name: '',
            branch: '',
            commitHash: '',
            remote: ''
        };
    }
    createEmptyLog() {
        return {
            date: new Date().toISOString().split('T')[0],
            changes: [],
            totalChanges: 0,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            projectName: '',
            branchName: ''
        };
    }
    async startTracking() {
        await this.initialize();
        this.setupFileWatcher();
        this.setupAutoSave();
    }
    async initialize() {
        this.ensureLogsDirectory();
        this.projectDetails = await this.gitService.getDetails(this.workspaceRoot);
        this.initializeCurrentLog();
        this.setupStatusBar();
    }
    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
            fs.writeFileSync(path.join(this.logsDir, '.gitignore'), 'log-*.json\n!final-log-*.json\n.DS_Store');
        }
    }
    initializeCurrentLog() {
        this.currentLog = {
            ...this.createEmptyLog(),
            projectName: this.projectDetails.name,
            branchName: this.projectDetails.branch
        };
    }
    setupStatusBar() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.updateStatusBar();
        this.statusBarItem.command = 'activity-tracker.pushLogs';
        this.statusBarItem.show();
    }
    setupFileWatcher() {
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.fileWatcher.onDidChange(uri => this.handleFileChange(uri, 'modified'));
        this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri, 'created'));
        this.fileWatcher.onDidDelete(uri => this.handleFileChange(uri, 'deleted'));
    }
    setupAutoSave() {
        setInterval(() => this.saveCurrentLog(), this.config.autoSaveInterval);
    }
    async handleFileChange(uri, changeType) {
        try {
            const relativePath = path.relative(this.workspaceRoot, uri.fsPath);
            if (utils_1.ActivityUtils.shouldIgnoreFile(relativePath, this.config.ignoredPaths)) {
                return;
            }
            const change = {
                fileName: relativePath,
                timestamp: new Date(),
                changeType,
                linesChanged: changeType !== 'deleted' ?
                    await utils_1.ActivityUtils.countLines(uri) : 0,
                fileType: utils_1.ActivityUtils.getFileExtension(uri.fsPath)
            };
            this.currentLog.changes.push(change);
            this.currentLog.totalChanges++;
            this.currentLog.endTime = new Date().toISOString();
            this.updateStatusBar();
            if (this.currentLog.changes.length >= this.config.maxChangesBeforeAutoSave) {
                await this.saveCurrentLog();
            }
        }
        catch (error) {
            console.error('Error tracking file change:', error);
        }
    }
    updateStatusBar() {
        const emoji = this.currentLog.totalChanges > 0 ? '📝' : '👨‍💻';
        this.statusBarItem.text = `${emoji} Changes: ${this.currentLog.totalChanges}`;
        this.statusBarItem.tooltip =
            `Click to push activity logs\nLast change: ${new Date().toLocaleTimeString()}`;
    }
    async saveCurrentLog() {
        if (this.currentLog.changes.length > 0) {
            const logFileName = `log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            fs.writeFileSync(path.join(this.logsDir, logFileName), JSON.stringify(this.currentLog, null, 2));
            this.initializeCurrentLog();
        }
    }
    async pushLogs() {
        try {
            await this.saveCurrentLog();
            const summary = await this.createDailySummary();
            const finalLogPath = path.join(this.logsDir, `final-log-${summary.date}.json`);
            fs.writeFileSync(finalLogPath, JSON.stringify(summary, null, 2));
            await this.gitService.commitAndPush(this.workspaceRoot, this.createCommitMessage(summary), [finalLogPath]);
            await utils_1.ActivityUtils.showNotification(`Successfully pushed activity logs! 🎉\n${this.createSuccessMessage(summary)}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            await utils_1.ActivityUtils.showNotification(`Failed to push logs: ${errorMessage}`, 'error');
            throw error;
        }
    }
    async createDailySummary() {
        const logs = this.getAllLogs();
        const fileChanges = new Map();
        const fileTypes = new Map();
        let totalChanges = 0;
        let totalLinesChanged = 0;
        logs.forEach(log => {
            log.changes.forEach(change => {
                fileChanges.set(change.fileName, (fileChanges.get(change.fileName) || 0) + 1);
                fileTypes.set(change.fileType, (fileTypes.get(change.fileType) || 0) + 1);
                totalChanges++;
                totalLinesChanged += change.linesChanged;
            });
        });
        const mostEditedFile = Array.from(fileChanges.entries())
            .sort((a, b) => b[1] - a[1])[0] || ['None', 0];
        const startTime = new Date(logs[0]?.startTime || new Date());
        const endTime = new Date(logs[logs.length - 1]?.endTime || new Date());
        const duration = utils_1.ActivityUtils.formatDuration(endTime.getTime() - startTime.getTime());
        const allChanges = logs.flatMap(log => log.changes);
        return {
            date: new Date().toISOString().split('T')[0],
            summary: this.createDetailedSummary(fileChanges),
            statistics: {
                totalFiles: fileChanges.size,
                totalChanges,
                mostEditedFile: mostEditedFile[0],
                workDuration: duration,
                fileTypes: Object.fromEntries(fileTypes),
                peakActivityHour: utils_1.ActivityUtils.getPeakActivityHour(allChanges),
                totalLinesChanged
            },
            projectDetails: this.projectDetails
        };
    }
    getAllLogs() {
        return fs.readdirSync(this.logsDir)
            .filter(file => file.startsWith('log-'))
            .map(file => JSON.parse(fs.readFileSync(path.join(this.logsDir, file), 'utf-8')));
    }
    createDetailedSummary(fileChanges) {
        return Array.from(fileChanges.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([file, count]) => `- ${file}: ${count} changes`)
            .join('\n');
    }
    createCommitMessage(summary) {
        return `📊 Daily Activity Log: ${summary.date}
    
    🔍 Summary:
    - Files changed: ${summary.statistics.totalFiles}
    - Total changes: ${summary.statistics.totalChanges}
    - Lines changed: ${summary.statistics.totalLinesChanged}
    - Duration: ${summary.statistics.workDuration}
    - Peak activity: ${summary.statistics.peakActivityHour}
    
    Most edited: ${summary.statistics.mostEditedFile}
    Branch: ${summary.projectDetails.branch}
    Hash: ${summary.projectDetails.commitHash}`;
    }
    createSuccessMessage(summary) {
        return `
    📈 Today's Statistics:
    • Total Files: ${summary.statistics.totalFiles}
    • Changes: ${summary.statistics.totalChanges}
    • Lines: ${summary.statistics.totalLinesChanged}
    • Duration: ${summary.statistics.workDuration}
    • Peak Time: ${summary.statistics.peakActivityHour}
    
    🔧 File Types:
    ${Object.entries(summary.statistics.fileTypes)
            .map(([type, count]) => `• ${type}: ${count}`)
            .join('\n')}
    
    Keep up the great work! 🚀`;
    }
    dispose() {
        this.fileWatcher.dispose();
        this.statusBarItem.dispose();
    }
}
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=ActivityTracker.js.map