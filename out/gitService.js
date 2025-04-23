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
exports.GitService = void 0;
const child_process_1 = require("child_process");
const vscode = __importStar(require("vscode"));
/**
 * Service for interacting with Git repositories
 */
class GitService {
    /**
     * Gets details about the Git repository
     */
    async getDetails(repoPath) {
        try {
            // Get the current branch name
            const branch = (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD', {
                cwd: repoPath
            }).toString().trim();
            // Get the current commit hash
            const commitHash = (0, child_process_1.execSync)('git rev-parse --short HEAD', {
                cwd: repoPath
            }).toString().trim();
            // Get the remote URL
            const remote = (0, child_process_1.execSync)('git config --get remote.origin.url', {
                cwd: repoPath
            }).toString().trim();
            // Extract the repository name from the path
            const name = repoPath.split('/').pop() || '';
            return {
                branch,
                commitHash,
                remote,
                name
            };
        }
        catch (error) {
            console.error('Error getting git details:', error);
            return {
                branch: 'unknown',
                commitHash: 'unknown',
                remote: 'unknown',
                name: 'unknown'
            };
        }
    }
    /**
     * Commits and pushes files to the Git repository
     */
    async commitAndPush(repoPath, commitMessage, filePaths) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Pushing activity logs',
            cancellable: false
        }, async (progress) => {
            try {
                // Stage 1: Add files
                progress.report({ message: 'Adding files...', increment: 33 });
                for (const filePath of filePaths) {
                    (0, child_process_1.execSync)(`git add "${filePath}"`, { cwd: repoPath });
                }
                // Stage 2: Commit changes
                progress.report({ message: 'Committing changes...', increment: 33 });
                (0, child_process_1.execSync)(`git commit -m "${commitMessage}"`, { cwd: repoPath });
                // Stage 3: Push to remote
                progress.report({ message: 'Pushing to remote...', increment: 34 });
                (0, child_process_1.execSync)('git push', { cwd: repoPath });
            }
            catch (error) {
                throw new Error(`Git operation failed: ${error}`);
            }
        });
    }
    /**
     * Checks if today has any commits
     */
    async hasTodayCommit(repoPath) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = (0, child_process_1.execSync)(`git log --since="${today}T00:00:00" --until="${today}T23:59:59" --format="%h"`, { cwd: repoPath }).toString().trim();
            return result.length > 0;
        }
        catch (error) {
            console.error('Error checking today commits:', error);
            return false;
        }
    }
    /**
     * Gets the total number of commits for statistics
     */
    getTotalCommitCount(repoPath) {
        try {
            return parseInt((0, child_process_1.execSync)('git rev-list --count HEAD', { cwd: repoPath })
                .toString()
                .trim());
        }
        catch (error) {
            console.error('Error getting commit count:', error);
            return 0;
        }
    }
    /**
     * Gets commit history for the repository
     */
    getCommitHistory(repoPath, days = 30) {
        try {
            const result = (0, child_process_1.execSync)(`git log --date=short --pretty=format:"%h|%ad|%an|%s" --since="${days} days ago"`, { cwd: repoPath }).toString().trim();
            if (!result) {
                return [];
            }
            return result.split('\n').map(line => {
                const [hash, date, author, message] = line.split('|');
                return { hash, date, author, message };
            });
        }
        catch (error) {
            console.error('Error getting commit history:', error);
            return [];
        }
    }
}
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map