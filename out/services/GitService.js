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
class GitService {
    async getDetails(workspaceRoot) {
        try {
            const branch = (0, child_process_1.execSync)('git rev-parse --abbrev-ref HEAD', { cwd: workspaceRoot })
                .toString().trim();
            const commitHash = (0, child_process_1.execSync)('git rev-parse --short HEAD', { cwd: workspaceRoot })
                .toString().trim();
            const remote = (0, child_process_1.execSync)('git config --get remote.origin.url', { cwd: workspaceRoot })
                .toString().trim();
            return {
                branch,
                commitHash,
                remote,
                name: workspaceRoot.split('/').pop() || ''
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
    async commitAndPush(workspaceRoot, message, files) {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Pushing activity logs",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: "Adding files...", increment: 33 });
                for (const file of files) {
                    (0, child_process_1.execSync)(`git add "${file}"`, { cwd: workspaceRoot });
                }
                progress.report({ message: "Committing changes...", increment: 33 });
                (0, child_process_1.execSync)(`git commit -m "${message}"`, { cwd: workspaceRoot });
                progress.report({ message: "Pushing to remote...", increment: 34 });
                (0, child_process_1.execSync)('git push', { cwd: workspaceRoot });
            }
            catch (error) {
                throw new Error(`Git operation failed: ${error}`);
            }
        });
    }
}
exports.GitService = GitService;
//# sourceMappingURL=GitService.js.map