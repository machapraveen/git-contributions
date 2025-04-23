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
exports.GitHubIntegration = void 0;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
class GitHubIntegration {
    token;
    constructor() {
        this.token = vscode.workspace.getConfiguration('activityTracker').get('github.personalAccessToken');
    }
    /**
     * Checks if the GitHub integration is configured
     */
    isConfigured() {
        return !!this.token;
    }
    /**
     * Fetches the contribution data for the authenticated user
     */
    async getContributionData() {
        if (!this.isConfigured()) {
            throw new Error('GitHub integration not configured. Please add a personal access token in settings.');
        }
        const query = `
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
        `;
        return this.makeGraphQLRequest(query);
    }
    /**
     * Makes a GraphQL request to the GitHub API
     */
    makeGraphQLRequest(query) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({ query });
            const options = {
                hostname: 'api.github.com',
                path: '/graphql',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'Authorization': `bearer ${this.token}`,
                    'User-Agent': 'VS-Code-Activity-Tracker'
                }
            };
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (parsed.errors) {
                            reject(new Error(parsed.errors[0].message));
                        }
                        else {
                            resolve(parsed.data);
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.write(data);
            req.end();
        });
    }
}
exports.GitHubIntegration = GitHubIntegration;
//# sourceMappingURL=githubIntegration.js.map