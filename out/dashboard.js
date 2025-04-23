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
exports.ActivityDashboard = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ActivityDashboard {
    static viewType = 'activityTracker.dashboard';
    static currentPanel;
    panel;
    extensionUri;
    logsDir;
    disposables = [];
    static createOrShow(extensionUri, logsDir, githubData) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it
        if (ActivityDashboard.currentPanel) {
            ActivityDashboard.currentPanel.panel.reveal(column);
            ActivityDashboard.currentPanel.updateContent(githubData);
            return;
        }
        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(ActivityDashboard.viewType, 'Activity Dashboard', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'media')
            ]
        });
        ActivityDashboard.currentPanel = new ActivityDashboard(panel, extensionUri, logsDir);
        if (githubData) {
            ActivityDashboard.currentPanel.updateContent(githubData);
        }
    }
    constructor(panel, extensionUri, logsDir) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.logsDir = logsDir;
        // Update the content initially
        this.updateContent();
        // Update the content when the panel becomes visible
        this.panel.onDidChangeViewState(e => {
            if (this.panel.visible) {
                this.updateContent();
            }
        }, null, this.disposables);
        // When the panel is closed, clean up resources
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'refresh':
                    this.updateContent();
                    return;
            }
        }, null, this.disposables);
    }
    async updateContent(githubData) {
        // Read all log files
        const logs = this.getAllLogs();
        // Generate statistics
        const stats = this.generateStatistics(logs);
        // Set the webview content
        this.panel.webview.html = this.getWebviewContent(stats, githubData);
    }
    getAllLogs() {
        try {
            return fs.readdirSync(this.logsDir)
                .filter(file => file.startsWith('log-') || file.startsWith('final-log-'))
                .map(file => {
                try {
                    return JSON.parse(fs.readFileSync(path.join(this.logsDir, file), 'utf-8'));
                }
                catch (e) {
                    console.error(`Error parsing log file ${file}:`, e);
                    return null;
                }
            })
                .filter(Boolean); // Remove any null entries from parse errors
        }
        catch (e) {
            console.error('Error reading log directory:', e);
            return [];
        }
    }
    generateStatistics(logs) {
        // Extract all changes
        const allChanges = logs.flatMap(log => log.changes || []);
        // Group by date
        const changesByDate = allChanges.reduce((acc, change) => {
            const date = new Date(change.timestamp).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(change);
            return acc;
        }, {});
        // Group by file type
        const changesByFileType = allChanges.reduce((acc, change) => {
            const fileType = change.fileType || 'unknown';
            if (!acc[fileType]) {
                acc[fileType] = 0;
            }
            acc[fileType]++;
            return acc;
        }, {});
        // Group by hour
        const changesByHour = allChanges.reduce((acc, change) => {
            const hour = new Date(change.timestamp).getHours();
            if (!acc[hour]) {
                acc[hour] = 0;
            }
            acc[hour]++;
            return acc;
        }, {});
        // Group changes by file
        const changesByFile = allChanges.reduce((acc, change) => {
            const file = change.fileName;
            if (!acc[file]) {
                acc[file] = 0;
            }
            acc[file]++;
            return acc;
        }, {});
        // Get top 5 most changed files
        const topFiles = Object.entries(changesByFile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([file, count]) => ({ file, count }));
        return {
            totalChanges: allChanges.length,
            changesByDate,
            changesByFileType,
            changesByHour,
            totalFiles: Object.keys(changesByFile).length,
            topFiles
        };
    }
    getWebviewContent(stats, githubData) {
        // Generate the HTML for the webview
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Activity Dashboard</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                }
                .dashboard {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .card {
                    background-color: var(--vscode-editor-background);
                    border-radius: 5px;
                    padding: 15px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                }
                .card h2 {
                    margin-top: 0;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                .heatmap {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 3px;
                }
                .heatmap-cell {
                    width: 15px;
                    height: 15px;
                    border-radius: 2px;
                }
                .chart-container {
                    height: 200px;
                    position: relative;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                    margin-bottom: 20px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                th {
                    font-weight: bold;
                }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
            <h1>Activity Dashboard</h1>
            <button id="refresh">Refresh Data</button>
            
            <div class="card">
                <h2>Activity Overview</h2>
                <div class="dashboard">
                    <div>
                        <p>Total Changes: ${stats.totalChanges}</p>
                        <p>Total Files: ${stats.totalFiles}</p>
                        <p>Active Days: ${Object.keys(stats.changesByDate).length}</p>
                    </div>
                    <div>
                        <h3>Top 5 Most Modified Files</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Changes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.topFiles.map((file) => `
                                    <tr>
                                        <td>${file.file}</td>
                                        <td>${file.count}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="dashboard">
                <div class="card">
                    <h2>Activity by Language/File Type</h2>
                    <div class="chart-container">
                        <canvas id="fileTypeChart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <h2>Activity by Hour</h2>
                    <div class="chart-container">
                        <canvas id="hourlyChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>Activity Heatmap (Last 90 Days)</h2>
                <div class="heatmap" id="heatmap"></div>
            </div>
            
            ${githubData ? `
            <div class="card">
                <h2>GitHub Contributions</h2>
                <p>Total Contributions: ${githubData.viewer.contributionsCollection.contributionCalendar.totalContributions}</p>
                <div class="chart-container">
                    <canvas id="githubChart"></canvas>
                </div>
            </div>
            ` : ''}
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Activity by file type
                    const fileTypeData = ${JSON.stringify(stats.changesByFileType)};
                    const fileTypeCtx = document.getElementById('fileTypeChart').getContext('2d');
                    new Chart(fileTypeCtx, {
                        type: 'pie',
                        data: {
                            labels: Object.keys(fileTypeData),
                            datasets: [{
                                data: Object.values(fileTypeData),
                                backgroundColor: [
                                    '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#c9cbcf',
                                    '#ff9f40', '#7b4f9d', '#4d5360', '#51574a', '#a1c9a4'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                    
                    // Activity by hour
                    const hourlyData = Array(24).fill(0);
                    for (let hour in ${JSON.stringify(stats.changesByHour)}) {
                        hourlyData[hour] = ${JSON.stringify(stats.changesByHour)}[hour];
                    }
                    
                    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
                    new Chart(hourlyCtx, {
                        type: 'bar',
                        data: {
                            labels: Array.from({length: 24}, (_, i) => i + ':00'),
                            datasets: [{
                                label: 'Changes by Hour',
                                data: hourlyData,
                                backgroundColor: '#36a2eb'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Hour of Day'
                                    }
                                },
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Number of Changes'
                                    }
                                }
                            }
                        }
                    });
                    
                    // Generate heatmap
                    const heatmapContainer = document.getElementById('heatmap');
                    const today = new Date();
                    const startDate = new Date(today);
                    startDate.setDate(today.getDate() - 90); // Last 90 days
                    
                    // Fill in dates
                    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
                        const dateStr = d.toISOString().split('T')[0];
                        const count = ${JSON.stringify(stats.changesByDate)}[dateStr] ? 
                            ${JSON.stringify(stats.changesByDate)}[dateStr].length : 0;
                        
                        const cell = document.createElement('div');
                        cell.className = 'heatmap-cell';
                        cell.title = dateStr + ': ' + count + ' changes';
                        
                        // Color based on count
                        if (count === 0) {
                            cell.style.backgroundColor = '#ebedf0';
                        } else if (count < 5) {
                            cell.style.backgroundColor = '#c6e48b';
                        } else if (count < 10) {
                            cell.style.backgroundColor = '#7bc96f';
                        } else if (count < 20) {
                            cell.style.backgroundColor = '#239a3b';
                        } else {
                            cell.style.backgroundColor = '#196127';
                        }
                        
                        heatmapContainer.appendChild(cell);
                    }
                    
                    ${githubData ? `
                    // GitHub data
                    const githubCtx = document.getElementById('githubChart').getContext('2d');
                    const contributionDays = [];
                    const contributionCounts = [];
                    
                    // Process the GitHub data
                    const weeks = ${JSON.stringify(githubData.viewer.contributionsCollection.contributionCalendar.weeks)};
                    weeks.forEach(week => {
                        week.contributionDays.forEach(day => {
                            contributionDays.push(day.date);
                            contributionCounts.push(day.contributionCount);
                        });
                    });
                    
                    // Create the chart
                    new Chart(githubCtx, {
                        type: 'line',
                        data: {
                            labels: contributionDays.slice(-30), // Last 30 days
                            datasets: [{
                                label: 'GitHub Contributions',
                                data: contributionCounts.slice(-30), // Last 30 days
                                borderColor: '#4bc0c0',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.1,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                    ` : ''}
                    
                    // Refresh button handler
                    document.getElementById('refresh').addEventListener('click', () => {
                        vscode.postMessage({ command: 'refresh' });
                    });
                })();
            </script>
        </body>
        </html>`;
    }
    dispose() {
        ActivityDashboard.currentPanel = undefined;
        // Clean up resources
        this.panel.dispose();
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
exports.ActivityDashboard = ActivityDashboard;
//# sourceMappingURL=dashboard.js.map