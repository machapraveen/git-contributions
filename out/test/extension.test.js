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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const smartCommit_1 = require("../smartCommit");
const utilityService_1 = require("../utilityService");
// Helper function to create a test environment with a temporary workspace
async function createTestWorkspace() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-test-'));
    // Create a sample file
    fs.writeFileSync(path.join(tmpDir, 'sample.ts'), 'console.log("Hello World");');
    // Create a git repo
    try {
        require('child_process').execSync('git init', { cwd: tmpDir });
        require('child_process').execSync('git config user.name "Test User"', { cwd: tmpDir });
        require('child_process').execSync('git config user.email "test@example.com"', { cwd: tmpDir });
    }
    catch (error) {
        console.error('Failed to initialize git repository:', error);
    }
    return tmpDir;
}
// Clean up the test workspace
function cleanupTestWorkspace(workspacePath) {
    try {
        fs.rmdirSync(workspacePath, { recursive: true });
    }
    catch (error) {
        console.error('Failed to clean up test workspace:', error);
    }
}
suite('Extension Test Suite', () => {
    let workspacePath;
    setup(async () => {
        workspacePath = await createTestWorkspace();
    });
    teardown(() => {
        cleanupTestWorkspace(workspacePath);
    });
    test('Extension should be active when workspace has git', async function () {
        this.timeout(10000); // 10 seconds
        // Open the workspace
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(workspacePath));
        // Wait for the extension to activate
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (vscode.extensions.getExtension('MachaPraveen.git-contributions')?.isActive) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
        // Verify the extension is active
        assert.strictEqual(vscode.extensions.getExtension('MachaPraveen.git-contributions')?.isActive, true, 'Extension should be active');
    });
    test('Smart commit generator should generate meaningful messages', () => {
        // Test with a single file change
        const singleChange = [{
                fileName: 'index.ts',
                timestamp: new Date(),
                changeType: 'modified',
                linesChanged: 10,
                fileType: 'ts'
            }];
        const singleMessage = smartCommit_1.SmartCommitGenerator.generateCommitMessage(singleChange);
        assert.strictEqual(singleMessage, 'Update index.ts (10 lines)');
        // Test with multiple changes of the same type
        const multipleChanges = [
            {
                fileName: 'src/component1.ts',
                timestamp: new Date(),
                changeType: 'modified',
                linesChanged: 5,
                fileType: 'ts'
            },
            {
                fileName: 'src/component2.ts',
                timestamp: new Date(),
                changeType: 'modified',
                linesChanged: 3,
                fileType: 'ts'
            }
        ];
        const multipleMessage = smartCommit_1.SmartCommitGenerator.generateCommitMessage(multipleChanges);
        assert.strictEqual(multipleMessage, 'Update TypeScript files (2 files) in src');
    });
    test('Utility service formatDuration should format correctly', () => {
        // Test formatting 1 hour 30 minutes
        const duration1 = 1 * 60 * 60 * 1000 + 30 * 60 * 1000; // 1h 30m in ms
        const formatted1 = utilityService_1.UtilityService.formatDuration(duration1);
        assert.strictEqual(formatted1, '1h 30m');
        // Test formatting 0 hours 45 minutes
        const duration2 = 45 * 60 * 1000; // 45m in ms
        const formatted2 = utilityService_1.UtilityService.formatDuration(duration2);
        assert.strictEqual(formatted2, '0h 45m');
        // Test formatting 2 hours 0 minutes
        const duration3 = 2 * 60 * 60 * 1000; // 2h in ms
        const formatted3 = utilityService_1.UtilityService.formatDuration(duration3);
        assert.strictEqual(formatted3, '2h 0m');
    });
    test('Utility service shouldIgnoreFile should work correctly', () => {
        const ignoredPaths = ['node_modules', '.git', 'dist'];
        // Test ignored paths
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('node_modules/package.json', ignoredPaths), true);
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('src/dist/bundle.js', ignoredPaths), true);
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('.git/index', ignoredPaths), true);
        // Test non-ignored paths
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('src/component.ts', ignoredPaths), false);
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('package.json', ignoredPaths), false);
        assert.strictEqual(utilityService_1.UtilityService.shouldIgnoreFile('README.md', ignoredPaths), false);
    });
});
//# sourceMappingURL=extension.test.js.map