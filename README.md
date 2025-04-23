# Push Activity Logs - Advanced GitHub Contribution Tracker

Track your coding activity and maintain your GitHub contribution streak automatically! This powerful extension monitors your file changes, provides detailed analytics, and can even maintain your contribution streak without any manual intervention.

## Features

- 📊 **Tracks all file changes** in your workspace with intelligent filtering.
- ⏱️ **Automatically saves activity logs** periodically.
- 🔄 **Maintains daily summaries** of your coding activity.
- 📈 **Generates detailed statistics** about your work with a beautiful dashboard.
- 🚀 **One-click push** to maintain your GitHub streak.
- 🤖 **Automatic streak agent** that can maintain your GitHub contribution streak without manual intervention.
- 💡 **Smart commit messages** that accurately describe your work.
- 🔗 **GitHub API integration** to track your contribution streak in real-time.
- 📱 **Activity dashboard** with charts and visualizations of your coding habits.

## Installation

### 1. Install the Extension

1. **Open Visual Studio Code (VS Code)**.
2. **Go to the Extensions Marketplace**:
   - In the left sidebar, click on the **Extensions** icon (it looks like a square with four smaller squares inside).
3. **Search for the Extension**:
   - In the search bar, type **"Push Activity Logs"** or **"git-contributions"**.
4. **Install the Extension**:
   - Click on **Install** to add the extension to your VS Code.

### 2. Configure the Settings

After installation, you need to configure the extension according to your preferences:

1. **Open Settings** in VS Code:
   - Go to **File > Preferences > Settings** (or use the shortcut `Ctrl + ,` on Windows/Linux or `Cmd + ,` on macOS).

2. **Search for Activity Tracker Settings**:
   - In the search bar, type **`activityTracker`**.

3. **Configure Auto-Save Interval**:
   - Set how often the extension should auto-save activity. The default value is 30 minutes (1800000 ms).
   - You can adjust it to save more frequently (e.g., every 5 minutes):
     ```json
     "activityTracker.autoSaveInterval": 300000
     ```
     This will save activity every 5 minutes.

4. **Configure Ignored Paths**:
   - You can exclude certain folders (e.g., `node_modules`, `.git`, etc.) from tracking:
     ```json
     "activityTracker.ignoredPaths": [
       "node_modules",
       ".git",
       "dist"
     ]
     ```
     Add any other paths you don't want to track.

5. **Configure the Streak Agent** (NEW!):
   - Enable the automatic streak agent to maintain your GitHub contribution streak:
     ```json
     "activityTracker.streakAgent.enabled": true,
     "activityTracker.streakAgent.intervalHours": 12
     ```
     This will automatically make a small contribution every 12 hours if needed.

6. **GitHub Integration** (NEW!):
   - Add your GitHub personal access token to enable the integration:
     ```json
     "activityTracker.github.personalAccessToken": "your-token-here",
     "activityTracker.github.username": "your-username"
     ```
     This allows the extension to fetch your GitHub contribution data for the dashboard.

7. **Save the Settings**.

### 3. Enable Git Tracking

The extension works with any Git repository. Just open a Git-based project in VS Code, and the extension will automatically track your changes.

---

## Usage

### 1. Track Activity Automatically

Once you open a Git repository in VS Code, the extension will begin tracking file changes. There's no need for manual intervention.

### 2. View Activity in the Status Bar

The extension will display your current activity status in the **VS Code status bar**. You can quickly check if your activity is being tracked.

### 3. Push Activity Logs

At the end of the day (or whenever you're ready), use the **"Push Activity Logs"** command to push your activity logs and update your GitHub contribution streak.

#### To push the logs:
1. **Open the Command Palette**:
   - Press `Ctrl + Shift + P` (Windows/Linux) or `Cmd + Shift + P` (macOS).
2. **Search for "Push Activity Logs"**:
   - Type **"Push Activity Logs"** and select the command.
3. **Push the logs** to GitHub, updating your contribution streak.

### 4. Use the Automatic Streak Agent (NEW!)

The extension now includes an automatic streak agent that can maintain your GitHub streak without any manual intervention:

1. **Enable the Streak Agent**:
   - Open the Command Palette and search for **"Toggle Streak Agent"**.
   - Select the command to enable the streak agent.

2. **How it Works**:
   - The streak agent will check if you've made a contribution today.
   - If not, it will make a small change to a designated file, create a log, and push it to maintain your streak.
   - This happens automatically at the configured interval (default: 12 hours).

3. **Configure the Agent**:
   - You can adjust the interval in the settings (see Configuration section).
   - The agent will create a `.streakagent` file in your repository to track its activity, or use an existing file like README.md.

### 5. View Your Activity Dashboard (NEW!)

1. **Open the Dashboard**:
   - Open the Command Palette and search for **"Open Activity Dashboard"**.
   - Select the command to open the interactive dashboard.

2. **Dashboard Features**:
   - Activity by file type (pie chart)
   - Activity by hour of day (bar chart)
   - Activity heatmap (similar to GitHub's contribution graph)
   - Most modified files
   - Overall statistics and summaries
   - GitHub integration (if configured)

### 6. Smart Commit Messages (NEW!)

The extension now generates intelligent commit messages based on your activity:

- Messages describe what files were changed and how
- Automatically identifies patterns in your work
- Provides context about your changes (e.g., "Update TypeScript configuration files")

You can disable this feature in settings if you prefer the traditional emoji-based messages.

---

## Example Settings Configuration

Here's an example of how your `settings.json` file should look with all advanced features enabled:

```json
{
  "activityTracker.autoSaveInterval": 300000,  // Save every 5 minutes
  "activityTracker.ignoredPaths": [
    "node_modules",
    ".git",
    "dist",
    ".activity-logs"
  ],
  "activityTracker.streakAgent.enabled": true,
  "activityTracker.streakAgent.intervalHours": 12,
  "activityTracker.streakAgent.runOnStart": false,
  "activityTracker.github.personalAccessToken": "your-token-here",
  "activityTracker.github.username": "your-username",
  "activityTracker.smartCommit.enabled": true
}
```

---

## Advanced Features Guide

### GitHub API Integration

To fully enable GitHub integration features:

1. **Create a GitHub Personal Access Token**:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Give it a name like "VS Code Activity Tracker"
   - Select the "repo" scope
   - Click "Generate token"
   - Copy the token and add it to your VS Code settings:
     ```json
     "activityTracker.github.personalAccessToken": "your-token-here"
     ```

2. **Benefits of GitHub Integration**:
   - See your GitHub contributions alongside your local activity
   - Verify your contribution streak is being maintained
   - Get insights into your GitHub activity patterns

### Streak Agent Configuration

The streak agent has several configuration options:

1. **Enable/Disable**: Turn the streak agent on or off.
   ```json
   "activityTracker.streakAgent.enabled": true
   ```

2. **Interval**: Set how often (in hours) the agent should check and maintain your streak.
   ```json
   "activityTracker.streakAgent.intervalHours": 12
   ```

3. **Run on Start**: Have the agent run immediately when VS Code starts.
   ```json
   "activityTracker.streakAgent.runOnStart": false
   ```

4. **Custom File**: The agent will look for these files in order:
   - `.streakagent` (creates if doesn't exist)
   - `README.md`
   - `CHANGELOG.md`
   - `.streakagent.md` (creates if doesn't exist)

### Activity Dashboard Features

The dashboard provides rich insights into your coding habits:

1. **Activity Overview**:
   - Total changes
   - Total files modified
   - Active days

2. **Top Files Analysis**:
   - Most frequently modified files
   - Lines changed per file

3. **Language/File Type Breakdown**:
   - Visual breakdown of which file types you work with most
   - Percentage of time spent on each language

4. **Time Analysis**:
   - Activity by hour of day
   - Peak productivity times
   - Work duration tracking

5. **Activity Heatmap**:
   - Visual representation of your activity over time
   - Similar to GitHub's contribution graph
   - Last 90 days of activity

6. **GitHub Integration**:
   - Shows your GitHub contribution data alongside local activity
   - Tracks contribution streak
   - Shows contribution counts and patterns

---

## Recovering from Missing `.activity-logs` Folder

If you accidentally delete the `.activity-logs` folder, the extension will fail to track and save activity logs, and you may encounter an error similar to:

```
Failed to push logs: ENOENT: no such file or directory, open 'C:\path\to\your\project\.activity-logs\log-YYYY-MM-DDTHH-MM-SS.json'
```

### Steps to Recover and Fix the Issue:

1. **Manually Create the `.activity-logs` Folder**:
   - Navigate to your project directory (where the `git-contributions` extension is located).
   - Create a new folder named `.activity-logs`. This folder is where the extension will store the log files.
   - **Path Example**: `C:\Users\YourUsername\Projects\git-contributions\.activity-logs\`

2. **Restart VS Code**:
   - After creating the `.activity-logs` folder, **restart** VS Code to ensure the extension picks up the changes.

3. **Make Changes to Your Project**:
   - Make a small change to any file in your project to check if the extension starts tracking your activity again.
   - The extension should now start saving logs inside the `.activity-logs` folder.

4. **Check the Output Panel**:
   - If the issue persists, open **VS Code's Output Panel** and check the **Extension logs** for any additional details or error messages related to the extension.

---

## Contributing

We welcome contributions! If you'd like to improve this project or fix any issues, please follow these steps:

1. Fork this repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them.
4. Open a pull request to the `main` branch.

Please make sure to write tests for any new functionality you add.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## Contact

For any questions or suggestions, please open an issue on the GitHub repository or reach out to me directly.  
**GitHub Repository**: [https://github.com/machapraveen/git-contributions](https://github.com/machapraveen/git-contributions)

Thank you for using **Push Activity Logs**! 🎉

---