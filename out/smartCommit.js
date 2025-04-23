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
exports.SmartCommitGenerator = void 0;
const path = __importStar(require("path"));
class SmartCommitGenerator {
    static CHANGE_TYPE_VERBS = {
        'created': 'Add',
        'modified': 'Update',
        'deleted': 'Remove'
    };
    static FILE_TYPE_CONTEXT = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'css': 'CSS',
        'html': 'HTML',
        'json': 'JSON config',
        'md': 'documentation',
        'py': 'Python',
        'java': 'Java',
        'c': 'C',
        'cpp': 'C++',
        'cs': 'C#',
        'go': 'Go',
        'rb': 'Ruby',
        'php': 'PHP',
        'jsx': 'React',
        'tsx': 'React TypeScript'
    };
    /**
     * Generates a smart commit message based on the provided changes
     * @param changes - Array of file changes or empty array if no changes
     * @returns A smartly generated commit message
     */
    static generateCommitMessage(changes) {
        // Handle case where we might receive a string summary instead of changes array
        if (typeof changes === 'string') {
            return `Update files with ${changes.split('\n').length} changes`;
        }
        // Convert to array if needed
        const changesArray = Array.isArray(changes) ? changes : [];
        if (!changesArray || changesArray.length === 0) {
            return 'Update project files';
        }
        // Group changes by type (created, modified, deleted)
        const changesByType = changesArray.reduce((acc, change) => {
            if (!acc[change.changeType]) {
                acc[change.changeType] = [];
            }
            acc[change.changeType].push(change);
            return acc;
        }, {});
        // Get the most common change type
        let mostCommonType = 'modified';
        let maxChanges = 0;
        for (const type in changesByType) {
            if (changesByType[type].length > maxChanges) {
                maxChanges = changesByType[type].length;
                mostCommonType = type;
            }
        }
        // Group by file extension
        const changesByExtension = changesArray.reduce((acc, change) => {
            const ext = path.extname(change.fileName).slice(1).toLowerCase();
            if (!acc[ext]) {
                acc[ext] = [];
            }
            acc[ext].push(change);
            return acc;
        }, {});
        // Find the most modified extension
        let primaryExtension = '';
        maxChanges = 0;
        for (const ext in changesByExtension) {
            if (changesByExtension[ext].length > maxChanges) {
                maxChanges = changesByExtension[ext].length;
                primaryExtension = ext;
            }
        }
        // Build the commit message
        const verb = this.CHANGE_TYPE_VERBS[mostCommonType] || 'Update';
        const fileTypeContext = this.FILE_TYPE_CONTEXT[primaryExtension] || (primaryExtension ? `${primaryExtension} files` : 'project files');
        // Get the most modified file
        const sortedFiles = [...changesArray].sort((a, b) => {
            return (b.linesChanged || 0) - (a.linesChanged || 0);
        });
        const mostModifiedFile = sortedFiles[0]?.fileName || '';
        const mostModifiedDir = path.dirname(mostModifiedFile).split('/')[0] || '';
        let message = '';
        if (changesArray.length === 1) {
            // Single file change
            message = `${verb} ${path.basename(changesArray[0].fileName)}`;
            if (changesArray[0].linesChanged && changesArray[0].linesChanged > 0) {
                message += ` (${changesArray[0].linesChanged} lines)`;
            }
        }
        else if (changesByType['created'] && changesByType['created'].length > 0 && !changesByType['modified'] && !changesByType['deleted']) {
            // Only new files
            message = `Add ${changesByType['created'].length} new ${fileTypeContext}`;
        }
        else if (changesByExtension[primaryExtension]?.length === changesArray.length) {
            // All changes in same file type
            message = `${verb} ${fileTypeContext} (${changesArray.length} files)`;
            if (mostModifiedDir && mostModifiedDir !== '.') {
                message += ` in ${mostModifiedDir}`;
            }
        }
        else {
            // Mixed changes
            message = `${verb} various ${fileTypeContext} and other files`;
        }
        return message;
    }
}
exports.SmartCommitGenerator = SmartCommitGenerator;
//# sourceMappingURL=smartCommit.js.map