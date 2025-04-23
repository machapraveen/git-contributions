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
const gitService_1 = require("./gitService");
const smartCommit_1 = require("./smartCommit");
const utilityService_1 = require("./utilityService");
/**
 * Main class responsible for tracking activity and managing logs
 */
class ActivityTracker {
    workspaceRoot;
    config;
    logsDir;
    gitService;
    currentLog;
    fileWatcher;
    statusBarItem;
    projectDetails;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        // Initialize with default configuration
        this.config = {
            ignoredPaths: utilityService_1.UtilityService.DEFAULT_CONFIG.ignoredPaths,
            autoSaveInterval: utilityService_1.UtilityService.DEFAULT_CONFIG.autoSaveInterval,
            maxChangesBeforeAutoSave: utilityService_1.UtilityService.DEFAULT_CONFIG.maxChangesBeforeAutoSave,
            smartCommitEnabled: true
        };
        // Set up paths and services
        this.logsDir = path.join(workspaceRoot, '.activity-logs');
        this.gitService = new gitService_1.GitService();
        this.currentLog = this.createEmptyLog();
        // Initialize file watcher and status bar
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        // Set default project details
        this.projectDetails = {
            name: '',
            branch: '',
            commitHash: '',
            remote: ''
        };
    }
    /**
     * Creates an empty log structure for a new tracking session
     */
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
    /**
     * Starts the activity tracking process
     */
    async startTracking() {
        await this.initialize();
        this.setupFileWatcher();
        this.setupAutoSave();
    }
    /**
     * Initializes the tracker with configuration and project details
     */
    async initialize() {
        // Load configuration from VS Code settings
        const vsCodeConfig = vscode.workspace.getConfiguration('activityTracker');
        this.config.ignoredPaths = vsCodeConfig.get('ignoredPaths', this.config.ignoredPaths);
        this.config.autoSaveInterval = vsCodeConfig.get('autoSaveInterval', this.config.autoSaveInterval);
        this.config.smartCommitEnabled = vsCodeConfig.get('smartCommit.enabled', true);
        // Create logs directory if it doesn't exist
        this.ensureLogsDirectory();
        // Get Git repository details
        this.projectDetails = await this.gitService.getDetails(this.workspaceRoot);
        // Initialize the current log with project details
        this.initializeCurrentLog();
        // Set up the status bar
        this.setupStatusBar();
    }
    /**
     * Ensures the logs directory exists
     */
    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
            fs.writeFileSync(path.join(this.logsDir, '.gitignore'), `log-*.json
!final-log-*.json
.DS_Store`);
        }
    }
    /**
     * Initializes the current log with project details
     */
    initializeCurrentLog() {
        this.currentLog = {
            ...this.createEmptyLog(),
            projectName: this.projectDetails.name,
            branchName: this.projectDetails.branch
        };
    }
    /**
     * Sets up the status bar item
     */
    setupStatusBar() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.updateStatusBar();
        this.statusBarItem.command = 'activity-tracker.pushLogs';
        this.statusBarItem.show();
    }
    /**
     * Sets up file watchers to track changes
     */
    setupFileWatcher() {
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.fileWatcher.onDidChange(uri => this.handleFileChange(uri, 'modified'));
        this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri, 'created'));
        this.fileWatcher.onDidDelete(uri => this.handleFileChange(uri, 'deleted'));
    }
    /**
     * Sets up auto-save interval
     */
    setupAutoSave() {
        setInterval(() => this.saveCurrentLog(), this.config.autoSaveInterval);
    }
    /**
     * Handles file change events (modify, create, delete)
     */
    async handleFileChange(uri, changeType) {
        try {
            const relativePath = path.relative(this.workspaceRoot, uri.fsPath);
            // Skip ignored paths
            if (utilityService_1.UtilityService.shouldIgnoreFile(relativePath, this.config.ignoredPaths)) {
                return;
            }
            // Create a change record
            const change = {
                fileName: relativePath,
                timestamp: new Date(),
                changeType: changeType,
                linesChanged: changeType !== 'deleted' ? await utilityService_1.UtilityService.countLines(uri) : 0,
                fileType: utilityService_1.UtilityService.getFileExtension(uri.fsPath)
            };
            // Add to current log
            this.currentLog.changes.push(change);
            this.currentLog.totalChanges++;
            this.currentLog.endTime = new Date().toISOString();
            // Update status bar
            this.updateStatusBar();
            // Auto-save if we've accumulated many changes
            if (this.currentLog.changes.length >= this.config.maxChangesBeforeAutoSave) {
                await this.saveCurrentLog();
            }
        }
        catch (error) {
            console.error('Error tracking file change:', error);
        }
    }
    /**
     * Updates the status bar with current activity information
     */
    updateStatusBar() {
        const icon = this.currentLog.totalChanges > 0 ? '📝' : '👨‍💻';
        this.statusBarItem.text = `${icon} Changes: ${this.currentLog.totalChanges}`;
        this.statusBarItem.tooltip = `Click to push activity logs
Last change: ${new Date().toLocaleTimeString()}`;
    }
    /**
     * Saves the current log to a file
     */
    async saveCurrentLog() {
        if (this.currentLog.changes.length > 0) {
            const filename = `log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            fs.writeFileSync(path.join(this.logsDir, filename), JSON.stringify(this.currentLog, null, 2));
            this.initializeCurrentLog();
        }
    }
    /**
     * Pushes the activity logs to the Git repository
     */
    async pushLogs() {
        try {
            // Save any pending changes
            await this.saveCurrentLog();
            // Create a summary of the day's activity
            const summary = await this.createDailySummary();
            // Write the summary to a file
            const summaryFilename = `final-log-${summary.date}.json`;
            const summaryPath = path.join(this.logsDir, summaryFilename);
            fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
            // Generate commit message (smart or default)
            let commitMessage = this.createCommitMessage(summary);
            if (this.config.smartCommitEnabled) {
                try {
                    // Try to use the smart commit generator
                    const changes = this.getAllFileChanges();
                    const smartMessage = smartCommit_1.SmartCommitGenerator.generateCommitMessage(changes.length > 0 ? changes : summary.summary);
                    if (smartMessage) {
                        commitMessage = smartMessage;
                    }
                }
                catch (error) {
                    console.error('Error generating smart commit message:', error);
                    // Fallback to default message format
                }
            }
            // Commit and push the changes
            await this.gitService.commitAndPush(this.workspaceRoot, commitMessage, [summaryPath]);
            // Show success notification
            await utilityService_1.UtilityService.showNotification(`Successfully pushed activity logs! 🎉
${this.createSuccessMessage(summary)}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            await utilityService_1.UtilityService.showNotification(`Failed to push logs: ${errorMessage}`, 'error');
            throw error;
        }
    }
    /**
     * Creates a daily summary of all activity
     */
    async createDailySummary() {
        const logs = this.getAllLogs();
        const fileChangeCounts = new Map();
        const fileTypeChangeCounts = new Map();
        let totalChanges = 0;
        let totalLinesChanged = 0;
        // Process all logs and collect statistics
        logs.forEach(log => {
            log.changes.forEach(change => {
                // Count changes by file
                fileChangeCounts.set(change.fileName, (fileChangeCounts.get(change.fileName) || 0) + 1);
                // Count changes by file type
                fileTypeChangeCounts.set(change.fileType, (fileTypeChangeCounts.get(change.fileType) || 0) + 1);
                // Track totals
                totalChanges++;
                totalLinesChanged += change.linesChanged || 0;
            });
        });
        // Find the most frequently edited file
        const mostEditedFileEntry = Array.from(fileChangeCounts.entries())
            .sort((a, b) => b[1] - a[1])[0] || ['None', 0];
        // Calculate time span
        const startTime = new Date(logs[0]?.startTime || new Date());
        const endTime = new Date(logs[logs.length - 1]?.endTime || new Date());
        const workDuration = utilityService_1.UtilityService.formatDuration(endTime.getTime() - startTime.getTime());
        // Get all changes for peak hour calculation
        const allChanges = logs.flatMap(log => log.changes);
        return {
            date: new Date().toISOString().split('T')[0],
            summary: this.createDetailedSummary(fileChangeCounts),
            statistics: {
                totalFiles: fileChangeCounts.size,
                totalChanges,
                mostEditedFile: mostEditedFileEntry[0],
                workDuration,
                fileTypes: Object.fromEntries(fileTypeChangeCounts),
                peakActivityHour: utilityService_1.UtilityService.getPeakActivityHour(allChanges),
                totalLinesChanged
            },
            projectDetails: this.projectDetails
        };
    }
    /**
     * Gets all file changes from all logs
     * Returns the changes as an array to be used with SmartCommitGenerator
     */
    getAllFileChanges() {
        const logs = this.getAllLogs();
        return logs.flatMap(log => log.changes || []);
    }
    /**
     * Gets all saved logs from the logs directory
     */
    getAllLogs() {
        try {
            return fs.readdirSync(this.logsDir)
                .filter(file => file.startsWith('log-'))
                .map(file => {
                try {
                    return JSON.parse(fs.readFileSync(path.join(this.logsDir, file), 'utf-8'));
                }
                catch (e) {
                    console.error(`Error reading log file ${file}:`, e);
                    return null;
                }
            })
                .filter(Boolean);
        }
        catch (error) {
            console.error('Error reading logs directory:', error);
            return [];
        }
    }
    /**
     * Creates a detailed summary of file changes
     */
    createDetailedSummary(fileChanges) {
        return Array.from(fileChanges.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([file, count]) => `- ${file}: ${count} changes`)
            .join('\n');
    }
    /**
     * Creates a commit message for the activity summary
     */
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
    /**
     * Creates a success message for the notification
     */
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
    /**
     * Disposes of resources
     */
    dispose() {
        this.fileWatcher.dispose();
        this.statusBarItem.dispose();
    }
}
exports.ActivityTracker = ActivityTracker;
//# sourceMappingURL=activityTracker.js.map