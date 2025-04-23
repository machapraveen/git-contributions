# Change Log

All notable changes to the "git-contributions" extension will be documented in this file.

## [0.1.0] - 2025-04-23

### Added

- **Automatic Streak Agent**: Added an agent that can automatically maintain GitHub contribution streaks without manual intervention
  - Configurable interval (default: 12 hours)
  - Smart detection of streak maintenance needs
  - Non-intrusive changes that clean up after themselves

- **Activity Dashboard**: Added a beautiful visualization dashboard for activity tracking
  - Activity overview statistics
  - File type distribution pie chart
  - Activity by hour bar chart
  - 90-day activity heatmap (similar to GitHub's)
  - Top files analysis

- **Smart Commit Messages**: Added intelligent commit message generation
  - Context-aware commit messages based on file types and changes
  - Automatically identifies patterns in changes
  - Can be disabled if preferred

- **GitHub API Integration**:
  - View GitHub contribution data alongside local activity
  - Personal Access Token configuration for secure API access
  - Real-time streak tracking 

- **Enhanced Statistics**:
  - More detailed file change tracking
  - Better performance with large projects
  - Improved handling of ignored paths

- **Testing Framework**:
  - Added unit tests for all new functionality
  - Test coverage for core features

### Changed

- Improved status bar indicator with more informative hover details
- Better error handling and recovery mechanisms
- Enhanced configuration options for more flexibility
- Optimized log file storage and management

### Fixed

- Fixed issue with tracking large files
- Improved error messaging for missing .activity-logs folder
- Better handling of various Git configurations

## [0.0.1] - Initial release

- Initial release with basic activity tracking functionality
- File change monitoring
- Activity logging
- Manual streak maintenance through push command