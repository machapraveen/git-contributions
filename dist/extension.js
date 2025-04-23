"use strict";var rt=Object.create;var $=Object.defineProperty;var st=Object.getOwnPropertyDescriptor;var ot=Object.getOwnPropertyNames;var nt=Object.getPrototypeOf,ct=Object.prototype.hasOwnProperty;var F=(r,t)=>()=>(r&&(t=r(r=0)),t);var x=(r,t)=>{for(var e in t)$(r,e,{get:t[e],enumerable:!0})},G=(r,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of ot(t))!ct.call(r,a)&&a!==e&&$(r,a,{get:()=>t[a],enumerable:!(i=st(t,a))||i.enumerable});return r};var p=(r,t,e)=>(e=r!=null?rt(nt(r)):{},G(t||!r||!r.__esModule?$(e,"default",{value:r,enumerable:!0}):e,r)),lt=r=>G($({},"__esModule",{value:!0}),r);var v,P,L,W=F(()=>{"use strict";v=require("child_process"),P=p(require("vscode")),L=class{async getDetails(t){try{let e=(0,v.execSync)("git rev-parse --abbrev-ref HEAD",{cwd:t}).toString().trim(),i=(0,v.execSync)("git rev-parse --short HEAD",{cwd:t}).toString().trim(),a=(0,v.execSync)("git config --get remote.origin.url",{cwd:t}).toString().trim(),o=t.split("/").pop()||"";return{branch:e,commitHash:i,remote:a,name:o}}catch(e){return console.error("Error getting git details:",e),{branch:"unknown",commitHash:"unknown",remote:"unknown",name:"unknown"}}}async commitAndPush(t,e,i){return P.window.withProgress({location:P.ProgressLocation.Notification,title:"Pushing activity logs",cancellable:!1},async a=>{try{a.report({message:"Adding files...",increment:33});for(let o of i)(0,v.execSync)(`git add "${o}"`,{cwd:t});a.report({message:"Committing changes...",increment:33}),(0,v.execSync)(`git commit -m "${e}"`,{cwd:t}),a.report({message:"Pushing to remote...",increment:34}),(0,v.execSync)("git push",{cwd:t})}catch(o){throw new Error(`Git operation failed: ${o}`)}})}async hasTodayCommit(t){try{let e=new Date().toISOString().split("T")[0];return(0,v.execSync)(`git log --since="${e}T00:00:00" --until="${e}T23:59:59" --format="%h"`,{cwd:t}).toString().trim().length>0}catch(e){return console.error("Error checking today commits:",e),!1}}getTotalCommitCount(t){try{return parseInt((0,v.execSync)("git rev-list --count HEAD",{cwd:t}).toString().trim())}catch(e){return console.error("Error getting commit count:",e),0}}getCommitHistory(t,e=30){try{let i=(0,v.execSync)(`git log --date=short --pretty=format:"%h|%ad|%an|%s" --since="${e} days ago"`,{cwd:t}).toString().trim();return i?i.split(`
`).map(a=>{let[o,g,h,s]=a.split("|");return{hash:o,date:g,author:h,message:s}}):[]}catch(i){return console.error("Error getting commit history:",i),[]}}}});var E,I,U=F(()=>{"use strict";E=p(require("path")),I=class{static CHANGE_TYPE_VERBS={created:"Add",modified:"Update",deleted:"Remove"};static FILE_TYPE_CONTEXT={js:"JavaScript",ts:"TypeScript",css:"CSS",html:"HTML",json:"JSON config",md:"documentation",py:"Python",java:"Java",c:"C",cpp:"C++",cs:"C#",go:"Go",rb:"Ruby",php:"PHP",jsx:"React",tsx:"React TypeScript"};static generateCommitMessage(t){if(typeof t=="string")return`Update files with ${t.split(`
`).length} changes`;let e=Array.isArray(t)?t:[];if(!e||e.length===0)return"Update project files";let i=e.reduce((d,S)=>(d[S.changeType]||(d[S.changeType]=[]),d[S.changeType].push(S),d),{}),a="modified",o=0;for(let d in i)i[d].length>o&&(o=i[d].length,a=d);let g=e.reduce((d,S)=>{let O=E.extname(S.fileName).slice(1).toLowerCase();return d[O]||(d[O]=[]),d[O].push(S),d},{}),h="";o=0;for(let d in g)g[d].length>o&&(o=g[d].length,h=d);let s=this.CHANGE_TYPE_VERBS[a]||"Update",c=this.FILE_TYPE_CONTEXT[h]||(h?`${h} files`:"project files"),C=[...e].sort((d,S)=>(S.linesChanged||0)-(d.linesChanged||0))[0]?.fileName||"",m=E.dirname(C).split("/")[0]||"",l="";return e.length===1?(l=`${s} ${E.basename(e[0].fileName)}`,e[0].linesChanged&&e[0].linesChanged>0&&(l+=` (${e[0].linesChanged} lines)`)):i.created&&i.created.length>0&&!i.modified&&!i.deleted?l=`Add ${i.created.length} new ${c}`:g[h]?.length===e.length?(l=`${s} ${c} (${e.length} files)`,m&&m!=="."&&(l+=` in ${m}`)):l=`${s} various ${c} and other files`,l}}});var A,J,f,q=F(()=>{"use strict";A=p(require("vscode")),J=p(require("path")),f=class{static DEFAULT_CONFIG={ignoredPaths:[".activity-logs","node_modules",".git",".vscode","dist","build",".DS_Store"],autoSaveInterval:30*60*1e3,maxChangesBeforeAutoSave:100};static async getFileContent(t){try{return(await A.workspace.openTextDocument(t)).getText()}catch{return""}}static async countLines(t){try{return(await A.workspace.openTextDocument(t)).lineCount}catch{return 0}}static getFileExtension(t){let e=J.extname(t).toLowerCase();return e?e.slice(1):"unknown"}static formatDuration(t){let e=Math.floor(t/36e5),i=Math.floor(t%(1e3*60*60)/(1e3*60));return`${e}h ${i}m`}static getPeakActivityHour(t){let e=new Array(24).fill(0);t.forEach(a=>{let o=new Date(a.timestamp).getHours();e[o]++});let i=e.indexOf(Math.max(...e));return`${i}:00-${(i+1)%24}:00`}static async showNotification(t,e="info"){let i=["View Details","Dismiss"];if(await A.window.showInformationMessage(t,...i)==="View Details"){let o=await A.workspace.openTextDocument({content:t,language:"markdown"});await A.window.showTextDocument(o)}}static shouldIgnoreFile(t,e){return e.some(i=>t.includes(i))}}});var V={};x(V,{ActivityTracker:()=>H});var w,y,k,H,_=F(()=>{"use strict";w=p(require("vscode")),y=p(require("fs")),k=p(require("path"));W();U();q();H=class{constructor(t){this.workspaceRoot=t;this.config={ignoredPaths:f.DEFAULT_CONFIG.ignoredPaths,autoSaveInterval:f.DEFAULT_CONFIG.autoSaveInterval,maxChangesBeforeAutoSave:f.DEFAULT_CONFIG.maxChangesBeforeAutoSave,smartCommitEnabled:!0},this.logsDir=k.join(t,".activity-logs"),this.gitService=new L,this.currentLog=this.createEmptyLog(),this.fileWatcher=w.workspace.createFileSystemWatcher("**/*"),this.statusBarItem=w.window.createStatusBarItem(w.StatusBarAlignment.Left),this.projectDetails={name:"",branch:"",commitHash:"",remote:""}}config;logsDir;gitService;currentLog;fileWatcher;statusBarItem;projectDetails;createEmptyLog(){return{date:new Date().toISOString().split("T")[0],changes:[],totalChanges:0,startTime:new Date().toISOString(),endTime:new Date().toISOString(),projectName:"",branchName:""}}async startTracking(){await this.initialize(),this.setupFileWatcher(),this.setupAutoSave()}async initialize(){let t=w.workspace.getConfiguration("activityTracker");this.config.ignoredPaths=t.get("ignoredPaths",this.config.ignoredPaths),this.config.autoSaveInterval=t.get("autoSaveInterval",this.config.autoSaveInterval),this.config.smartCommitEnabled=t.get("smartCommit.enabled",!0),this.ensureLogsDirectory(),this.projectDetails=await this.gitService.getDetails(this.workspaceRoot),this.initializeCurrentLog(),this.setupStatusBar()}ensureLogsDirectory(){y.existsSync(this.logsDir)||(y.mkdirSync(this.logsDir,{recursive:!0}),y.writeFileSync(k.join(this.logsDir,".gitignore"),`log-*.json
!final-log-*.json
.DS_Store`))}initializeCurrentLog(){this.currentLog={...this.createEmptyLog(),projectName:this.projectDetails.name,branchName:this.projectDetails.branch}}setupStatusBar(){this.statusBarItem=w.window.createStatusBarItem(w.StatusBarAlignment.Left,100),this.updateStatusBar(),this.statusBarItem.command="activity-tracker.pushLogs",this.statusBarItem.show()}setupFileWatcher(){this.fileWatcher=w.workspace.createFileSystemWatcher("**/*"),this.fileWatcher.onDidChange(t=>this.handleFileChange(t,"modified")),this.fileWatcher.onDidCreate(t=>this.handleFileChange(t,"created")),this.fileWatcher.onDidDelete(t=>this.handleFileChange(t,"deleted"))}setupAutoSave(){setInterval(()=>this.saveCurrentLog(),this.config.autoSaveInterval)}async handleFileChange(t,e){try{let i=k.relative(this.workspaceRoot,t.fsPath);if(f.shouldIgnoreFile(i,this.config.ignoredPaths))return;let a={fileName:i,timestamp:new Date,changeType:e,linesChanged:e!=="deleted"?await f.countLines(t):0,fileType:f.getFileExtension(t.fsPath)};this.currentLog.changes.push(a),this.currentLog.totalChanges++,this.currentLog.endTime=new Date().toISOString(),this.updateStatusBar(),this.currentLog.changes.length>=this.config.maxChangesBeforeAutoSave&&await this.saveCurrentLog()}catch(i){console.error("Error tracking file change:",i)}}updateStatusBar(){let t=this.currentLog.totalChanges>0?"\u{1F4DD}":"\u{1F468}\u200D\u{1F4BB}";this.statusBarItem.text=`${t} Changes: ${this.currentLog.totalChanges}`,this.statusBarItem.tooltip=`Click to push activity logs
Last change: ${new Date().toLocaleTimeString()}`}async saveCurrentLog(){if(this.currentLog.changes.length>0){let t=`log-${new Date().toISOString().replace(/[:.]/g,"-")}.json`;y.writeFileSync(k.join(this.logsDir,t),JSON.stringify(this.currentLog,null,2)),this.initializeCurrentLog()}}async pushLogs(){try{await this.saveCurrentLog();let t=await this.createDailySummary(),e=`final-log-${t.date}.json`,i=k.join(this.logsDir,e);y.writeFileSync(i,JSON.stringify(t,null,2));let a=this.createCommitMessage(t);if(this.config.smartCommitEnabled)try{let o=this.getAllFileChanges(),g=I.generateCommitMessage(o.length>0?o:t.summary);g&&(a=g)}catch(o){console.error("Error generating smart commit message:",o)}await this.gitService.commitAndPush(this.workspaceRoot,a,[i]),await f.showNotification(`Successfully pushed activity logs! \u{1F389}
${this.createSuccessMessage(t)}`)}catch(t){let e=t instanceof Error?t.message:"Unknown error occurred";throw await f.showNotification(`Failed to push logs: ${e}`,"error"),t}}async createDailySummary(){let t=this.getAllLogs(),e=new Map,i=new Map,a=0,o=0;t.forEach(C=>{C.changes.forEach(m=>{e.set(m.fileName,(e.get(m.fileName)||0)+1),i.set(m.fileType,(i.get(m.fileType)||0)+1),a++,o+=m.linesChanged||0})});let g=Array.from(e.entries()).sort((C,m)=>m[1]-C[1])[0]||["None",0],h=new Date(t[0]?.startTime||new Date),s=new Date(t[t.length-1]?.endTime||new Date),c=f.formatDuration(s.getTime()-h.getTime()),u=t.flatMap(C=>C.changes);return{date:new Date().toISOString().split("T")[0],summary:this.createDetailedSummary(e),statistics:{totalFiles:e.size,totalChanges:a,mostEditedFile:g[0],workDuration:c,fileTypes:Object.fromEntries(i),peakActivityHour:f.getPeakActivityHour(u),totalLinesChanged:o},projectDetails:this.projectDetails}}getAllFileChanges(){return this.getAllLogs().flatMap(e=>e.changes||[])}getAllLogs(){try{return y.readdirSync(this.logsDir).filter(t=>t.startsWith("log-")).map(t=>{try{return JSON.parse(y.readFileSync(k.join(this.logsDir,t),"utf-8"))}catch(e){return console.error(`Error reading log file ${t}:`,e),null}}).filter(Boolean)}catch(t){return console.error("Error reading logs directory:",t),[]}}createDetailedSummary(t){return Array.from(t.entries()).sort((e,i)=>i[1]-e[1]).map(([e,i])=>`- ${e}: ${i} changes`).join(`
`)}createCommitMessage(t){return`\u{1F4CA} Daily Activity Log: ${t.date}
    
    \u{1F50D} Summary:
    - Files changed: ${t.statistics.totalFiles}
    - Total changes: ${t.statistics.totalChanges}
    - Lines changed: ${t.statistics.totalLinesChanged}
    - Duration: ${t.statistics.workDuration}
    - Peak activity: ${t.statistics.peakActivityHour}
    
    Most edited: ${t.statistics.mostEditedFile}
    Branch: ${t.projectDetails.branch}
    Hash: ${t.projectDetails.commitHash}`}createSuccessMessage(t){return`
    \u{1F4C8} Today's Statistics:
    \u2022 Total Files: ${t.statistics.totalFiles}
    \u2022 Changes: ${t.statistics.totalChanges}
    \u2022 Lines: ${t.statistics.totalLinesChanged}
    \u2022 Duration: ${t.statistics.workDuration}
    \u2022 Peak Time: ${t.statistics.peakActivityHour}
    
    \u{1F527} File Types:
    ${Object.entries(t.statistics.fileTypes).map(([e,i])=>`\u2022 ${e}: ${i}`).join(`
`)}
    
    Keep up the great work! \u{1F680}`}dispose(){this.fileWatcher.dispose(),this.statusBarItem.dispose()}}});var z={};x(z,{StreakAgent:()=>B});var D,b,j,B,Y=F(()=>{"use strict";D=p(require("vscode")),b=p(require("fs")),j=p(require("path")),B=class{timer;workspaceRoot;activityTracker;targetFile;isRunning=!1;constructor(t,e){this.workspaceRoot=t,this.activityTracker=e}async start(){if(this.isRunning)return;let t=D.workspace.getConfiguration("activityTracker"),e=t.get("streakAgent.intervalHours",12);if(!t.get("streakAgent.enabled",!1))return;if(await this.findTargetFile(),!this.targetFile){D.window.showWarningMessage("Streak agent could not find a suitable file to modify.");return}let a=e*60*60*1e3;this.timer=setInterval(()=>this.performFakeChange(),a),t.get("streakAgent.runOnStart",!1)&&this.performFakeChange(),this.isRunning=!0,D.window.showInformationMessage(`Streak agent started. Will run every ${e} hours.`)}stop(){this.timer&&(clearInterval(this.timer),this.timer=void 0),this.isRunning=!1,D.window.showInformationMessage("Streak agent stopped.")}async findTargetFile(){let t=j.join(this.workspaceRoot,".streakagent");if(b.existsSync(t)){this.targetFile=t;return}let e=["README.md","CHANGELOG.md",".streakagent.md"];for(let i of e){let a=j.join(this.workspaceRoot,i);if(b.existsSync(a)){this.targetFile=a;return}}try{b.writeFileSync(t,`# Streak Agent
# This file is used by the VS Code Push Activity Logs extension to maintain your GitHub contribution streak.
# You can safely ignore this file.

Last updated: `+new Date().toISOString()+`
`),this.targetFile=t}catch(i){console.error("Failed to create streak agent file:",i)}}async performFakeChange(){if((!this.targetFile||!b.existsSync(this.targetFile))&&(await this.findTargetFile(),!this.targetFile)){D.window.showErrorMessage("Streak agent failed: No target file available");return}try{let t=b.readFileSync(this.targetFile,"utf8"),e=t+`
<!-- Streak update: ${new Date().toISOString()} -->
`;b.writeFileSync(this.targetFile,e),await new Promise(i=>setTimeout(i,1e3)),b.writeFileSync(this.targetFile,t),await new Promise(i=>setTimeout(i,1e3)),await this.activityTracker.pushLogs(),console.log(`Streak agent ran successfully at ${new Date().toISOString()}`)}catch(t){console.error("Streak agent encountered an error:",t),D.window.showErrorMessage(`Streak agent failed: ${t instanceof Error?t.message:"Unknown error"}`)}}}});var X={};x(X,{ActivityDashboard:()=>N});var T,M,Q,N,Z=F(()=>{"use strict";T=p(require("vscode")),M=p(require("fs")),Q=p(require("path")),N=class r{static viewType="activityTracker.dashboard";static currentPanel;panel;extensionUri;logsDir;disposables=[];static createOrShow(t,e,i){let a=T.window.activeTextEditor?T.window.activeTextEditor.viewColumn:void 0;if(r.currentPanel){r.currentPanel.panel.reveal(a),r.currentPanel.updateContent(i);return}let o=T.window.createWebviewPanel(r.viewType,"Activity Dashboard",a||T.ViewColumn.One,{enableScripts:!0,localResourceRoots:[T.Uri.joinPath(t,"media")]});r.currentPanel=new r(o,t,e),i&&r.currentPanel.updateContent(i)}constructor(t,e,i){this.panel=t,this.extensionUri=e,this.logsDir=i,this.updateContent(),this.panel.onDidChangeViewState(a=>{this.panel.visible&&this.updateContent()},null,this.disposables),this.panel.onDidDispose(()=>this.dispose(),null,this.disposables),this.panel.webview.onDidReceiveMessage(a=>{switch(a.command){case"refresh":this.updateContent();return}},null,this.disposables)}async updateContent(t){let e=this.getAllLogs(),i=this.generateStatistics(e);this.panel.webview.html=this.getWebviewContent(i,t)}getAllLogs(){try{return M.readdirSync(this.logsDir).filter(t=>t.startsWith("log-")||t.startsWith("final-log-")).map(t=>{try{return JSON.parse(M.readFileSync(Q.join(this.logsDir,t),"utf-8"))}catch(e){return console.error(`Error parsing log file ${t}:`,e),null}}).filter(Boolean)}catch(t){return console.error("Error reading log directory:",t),[]}}generateStatistics(t){let e=t.flatMap(s=>s.changes||[]),i=e.reduce((s,c)=>{let u=new Date(c.timestamp).toISOString().split("T")[0];return s[u]||(s[u]=[]),s[u].push(c),s},{}),a=e.reduce((s,c)=>{let u=c.fileType||"unknown";return s[u]||(s[u]=0),s[u]++,s},{}),o=e.reduce((s,c)=>{let u=new Date(c.timestamp).getHours();return s[u]||(s[u]=0),s[u]++,s},{}),g=e.reduce((s,c)=>{let u=c.fileName;return s[u]||(s[u]=0),s[u]++,s},{}),h=Object.entries(g).sort((s,c)=>c[1]-s[1]).slice(0,5).map(([s,c])=>({file:s,count:c}));return{totalChanges:e.length,changesByDate:i,changesByFileType:a,changesByHour:o,totalFiles:Object.keys(g).length,topFiles:h}}getWebviewContent(t,e){return`<!DOCTYPE html>
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
                        <p>Total Changes: ${t.totalChanges}</p>
                        <p>Total Files: ${t.totalFiles}</p>
                        <p>Active Days: ${Object.keys(t.changesByDate).length}</p>
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
                                ${t.topFiles.map(i=>`
                                    <tr>
                                        <td>${i.file}</td>
                                        <td>${i.count}</td>
                                    </tr>
                                `).join("")}
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
            
            ${e?`
            <div class="card">
                <h2>GitHub Contributions</h2>
                <p>Total Contributions: ${e.viewer.contributionsCollection.contributionCalendar.totalContributions}</p>
                <div class="chart-container">
                    <canvas id="githubChart"></canvas>
                </div>
            </div>
            `:""}
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Activity by file type
                    const fileTypeData = ${JSON.stringify(t.changesByFileType)};
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
                    for (let hour in ${JSON.stringify(t.changesByHour)}) {
                        hourlyData[hour] = ${JSON.stringify(t.changesByHour)}[hour];
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
                        const count = ${JSON.stringify(t.changesByDate)}[dateStr] ? 
                            ${JSON.stringify(t.changesByDate)}[dateStr].length : 0;
                        
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
                    
                    ${e?`
                    // GitHub data
                    const githubCtx = document.getElementById('githubChart').getContext('2d');
                    const contributionDays = [];
                    const contributionCounts = [];
                    
                    // Process the GitHub data
                    const weeks = ${JSON.stringify(e.viewer.contributionsCollection.contributionCalendar.weeks)};
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
                    `:""}
                    
                    // Refresh button handler
                    document.getElementById('refresh').addEventListener('click', () => {
                        vscode.postMessage({ command: 'refresh' });
                    });
                })();
            </script>
        </body>
        </html>`}dispose(){for(r.currentPanel=void 0,this.panel.dispose();this.disposables.length;){let t=this.disposables.pop();t&&t.dispose()}}}});var et={};x(et,{GitHubIntegration:()=>R});var K,tt,R,it=F(()=>{"use strict";K=p(require("vscode")),tt=p(require("https")),R=class{token;constructor(){this.token=K.workspace.getConfiguration("activityTracker").get("github.personalAccessToken")}isConfigured(){return!!this.token}async getContributionData(){if(!this.isConfigured())throw new Error("GitHub integration not configured. Please add a personal access token in settings.");return this.makeGraphQLRequest(`
            query {
                viewer {
                    contributionsCollection {
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    date
                                    contributionCount
                                }
                            }
                        }
                    }
                }
            }
        `)}makeGraphQLRequest(t){return new Promise((e,i)=>{let a=JSON.stringify({query:t}),o={hostname:"api.github.com",path:"/graphql",method:"POST",headers:{"Content-Type":"application/json","Content-Length":a.length,Authorization:`bearer ${this.token}`,"User-Agent":"VS-Code-Activity-Tracker"}},g=tt.request(o,h=>{let s="";h.on("data",c=>{s+=c}),h.on("end",()=>{try{let c=JSON.parse(s);c.errors?i(new Error(c.errors[0].message)):e(c.data)}catch(c){i(c)}})});g.on("error",h=>{i(h)}),g.write(a),g.end()})}}});var ht={};x(ht,{activate:()=>dt,deactivate:()=>gt});module.exports=lt(ht);var n=p(require("vscode")),at=p(require("path"));async function dt(r){let t=n.workspace.workspaceFolders?.[0].uri.fsPath;if(!t){n.window.showErrorMessage("No workspace folder found!");return}try{let{ActivityTracker:e}=await Promise.resolve().then(()=>(_(),V)),{StreakAgent:i}=await Promise.resolve().then(()=>(Y(),z)),{ActivityDashboard:a}=await Promise.resolve().then(()=>(Z(),X)),{GitHubIntegration:o}=await Promise.resolve().then(()=>(it(),et)),g=new e(t);await g.startTracking().catch(l=>{n.window.showErrorMessage(`Failed to start activity tracking: ${l.message}`)});let h=new i(t,g);await h.start().catch(l=>{n.window.showErrorMessage(`Failed to start streak agent: ${l.message}`)});let s=new o,c=n.commands.registerCommand("activity-tracker.pushLogs",async()=>{try{await g.pushLogs()}catch(l){n.window.showErrorMessage(`Failed to push logs: ${l.message}`)}}),u=n.commands.registerCommand("activity-tracker.toggleStreakAgent",async()=>{try{let l=n.workspace.getConfiguration("activityTracker"),d=l.get("streakAgent.enabled",!1);await l.update("streakAgent.enabled",!d,n.ConfigurationTarget.Global),d?(h.stop(),n.window.showInformationMessage("Streak agent disabled.")):(await h.start(),n.window.showInformationMessage("Streak agent enabled. Your GitHub streak will be maintained automatically."))}catch(l){n.window.showErrorMessage(`Failed to toggle streak agent: ${l.message}`)}}),C=n.commands.registerCommand("activity-tracker.openDashboard",async()=>{try{let l;if(s.isConfigured())try{l=await s.getContributionData()}catch(d){console.error("Failed to fetch GitHub data:",d),n.window.showWarningMessage(`GitHub integration error: ${d.message||"Unknown error"}`)}a.createOrShow(r.extensionUri,at.join(t,".activity-logs"),l)}catch(l){n.window.showErrorMessage(`Failed to open dashboard: ${l.message||"Unknown error"}`)}}),m=n.commands.registerCommand("activity-tracker.configureGitHub",async()=>{s.isConfigured()?n.window.showInformationMessage("GitHub integration is already configured."):await n.window.showInformationMessage("GitHub integration requires a personal access token. Would you like to configure it now?","Configure","Cancel")==="Configure"&&n.commands.executeCommand("workbench.action.openSettings","activityTracker.github")});r.subscriptions.push(c),r.subscriptions.push(u),r.subscriptions.push(C),r.subscriptions.push(m),r.subscriptions.push(g),r.subscriptions.push({dispose:()=>{h.stop()}}),n.workspace.getConfiguration("activityTracker").get("showWelcomeMessage",!0)&&n.window.showInformationMessage("Push Activity Logs extension is now active! Use the command palette to access features like activity dashboard and automatic streak maintenance.","Open Dashboard","Configure","Don't Show Again").then(l=>{l==="Open Dashboard"?n.commands.executeCommand("activity-tracker.openDashboard"):l==="Configure"?n.commands.executeCommand("workbench.action.openSettings","activityTracker"):l==="Don't Show Again"&&n.workspace.getConfiguration("activityTracker").update("showWelcomeMessage",!1,n.ConfigurationTarget.Global)})}catch(e){n.window.showErrorMessage(`Failed to activate extension: ${e.message||"Unknown error"}`),console.error("Extension activation error:",e)}}function gt(){}0&&(module.exports={activate,deactivate});
