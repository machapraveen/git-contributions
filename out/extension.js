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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
async function activate(context) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder found!");
        return;
    }
    try {
        // Dynamically import modules to avoid circular dependencies
        const { ActivityTracker } = await Promise.resolve().then(() => __importStar(require('./activityTracker')));
        const { StreakAgent } = await Promise.resolve().then(() => __importStar(require('./streakAgent')));
        const { ActivityDashboard } = await Promise.resolve().then(() => __importStar(require('./dashboard')));
        const { GitHubIntegration } = await Promise.resolve().then(() => __importStar(require('./githubIntegration')));
        // Create the activity tracker
        const activityTracker = new ActivityTracker(workspaceRoot);
        // Start tracking
        await activityTracker.startTracking().catch((error) => {
            vscode.window.showErrorMessage(`Failed to start activity tracking: ${error.message}`);
        });
        // Create and start the streak agent
        const streakAgent = new StreakAgent(workspaceRoot, activityTracker);
        await streakAgent.start().catch((error) => {
            vscode.window.showErrorMessage(`Failed to start streak agent: ${error.message}`);
        });
        // Initialize GitHub integration
        const githubIntegration = new GitHubIntegration();
        // Register the push logs command
        const pushLogsCommand = vscode.commands.registerCommand('activity-tracker.pushLogs', async () => {
            try {
                await activityTracker.pushLogs();
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to push logs: ${error.message}`);
            }
        });
        // Register the toggle streak agent command
        const toggleStreakAgentCommand = vscode.commands.registerCommand('activity-tracker.toggleStreakAgent', async () => {
            try {
                const config = vscode.workspace.getConfiguration('activityTracker');
                const currentEnabled = config.get('streakAgent.enabled', false);
                // Toggle the enabled state
                await config.update('streakAgent.enabled', !currentEnabled, vscode.ConfigurationTarget.Global);
                if (!currentEnabled) {
                    await streakAgent.start();
                    vscode.window.showInformationMessage('Streak agent enabled. Your GitHub streak will be maintained automatically.');
                }
                else {
                    streakAgent.stop();
                    vscode.window.showInformationMessage('Streak agent disabled.');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to toggle streak agent: ${error.message}`);
            }
        });
        // Open dashboard command
        const openDashboardCommand = vscode.commands.registerCommand('activity-tracker.openDashboard', async () => {
            try {
                let githubData = undefined;
                // Try to fetch GitHub data if integration is configured
                if (githubIntegration.isConfigured()) {
                    try {
                        githubData = await githubIntegration.getContributionData();
                    }
                    catch (error) {
                        console.error('Failed to fetch GitHub data:', error);
                        // Show a non-blocking warning but continue loading the dashboard
                        vscode.window.showWarningMessage(`GitHub integration error: ${error.message || 'Unknown error'}`);
                    }
                }
                ActivityDashboard.createOrShow(context.extensionUri, path.join(workspaceRoot, '.activity-logs'), githubData);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to open dashboard: ${error.message || 'Unknown error'}`);
            }
        });
        // Register GitHub integration command
        const configureGitHubCommand = vscode.commands.registerCommand('activity-tracker.configureGitHub', async () => {
            if (!githubIntegration.isConfigured()) {
                const result = await vscode.window.showInformationMessage('GitHub integration requires a personal access token. Would you like to configure it now?', 'Configure', 'Cancel');
                if (result === 'Configure') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'activityTracker.github');
                }
            }
            else {
                vscode.window.showInformationMessage('GitHub integration is already configured.');
            }
        });
        // Add everything to the subscriptions
        context.subscriptions.push(pushLogsCommand);
        context.subscriptions.push(toggleStreakAgentCommand);
        context.subscriptions.push(openDashboardCommand);
        context.subscriptions.push(configureGitHubCommand);
        context.subscriptions.push(activityTracker);
        // Add a disposable for the streak agent
        context.subscriptions.push({
            dispose: () => {
                streakAgent.stop();
            }
        });
        // Show welcome message
        if (vscode.workspace.getConfiguration('activityTracker').get('showWelcomeMessage', true)) {
            vscode.window.showInformationMessage('Push Activity Logs extension is now active! Use the command palette to access features like activity dashboard and automatic streak maintenance.', 'Open Dashboard', 'Configure', 'Don\'t Show Again').then(result => {
                if (result === 'Open Dashboard') {
                    vscode.commands.executeCommand('activity-tracker.openDashboard');
                }
                else if (result === 'Configure') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'activityTracker');
                }
                else if (result === 'Don\'t Show Again') {
                    vscode.workspace.getConfiguration('activityTracker').update('showWelcomeMessage', false, vscode.ConfigurationTarget.Global);
                }
            });
        }
    }
    catch (error) {
        // Handle any activation errors
        vscode.window.showErrorMessage(`Failed to activate extension: ${error.message || 'Unknown error'}`);
        console.error('Extension activation error:', error);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map