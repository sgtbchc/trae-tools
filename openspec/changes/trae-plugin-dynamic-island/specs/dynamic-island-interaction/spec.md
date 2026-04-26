## ADDED Requirements

### Requirement: Real-time task status display
The system SHALL display the current Trae task status in real-time on the Dynamic Island.

#### Scenario: Task status update
- **WHEN** a task status changes in Trae IDE (waiting, processing, completed, failed, approval-pending)
- **THEN** the Dynamic Island SHALL reflect the new status within 2 seconds, including the status icon, color, and descriptive text

#### Scenario: Multiple concurrent tasks
- **WHEN** multiple tasks are running simultaneously
- **THEN** the Dynamic Island SHALL display a count badge and cycle through task summaries, with the most recent or highest-priority task shown first

#### Scenario: No active tasks
- **WHEN** no tasks are currently running
- **THEN** the Dynamic Island SHALL display an idle state with the Trae logo

### Requirement: Token generation speed display
The system SHALL display the real-time token generation speed for active tasks.

#### Scenario: Token speed during active generation
- **WHEN** an AI response is being generated
- **THEN** the Dynamic Island SHALL display the current token generation speed in tokens/second, updated every second

#### Scenario: Token speed calculation
- **WHEN** the token speed is calculated
- **THEN** the system SHALL use a rolling 5-second average to smooth out fluctuations

#### Scenario: Token speed in expanded view
- **WHEN** the Dynamic Island is in expanded or full state
- **THEN** it SHALL display a mini sparkline chart showing token speed over the last 60 seconds

### Requirement: Task approval status and actions
The system SHALL display approval-pending tasks and provide quick action buttons.

#### Scenario: Approval-pending notification
- **WHEN** a task requires user approval
- **THEN** the Dynamic Island SHALL display a purple indicator and expand to show the approval request details

#### Scenario: Approve action
- **WHEN** the user clicks the "Approve" button on the Dynamic Island
- **THEN** the system SHALL send the approval to Trae IDE and the task SHALL proceed

#### Scenario: Reject action
- **WHEN** the user clicks the "Reject" button on the Dynamic Island
- **THEN** the system SHALL send the rejection to Trae IDE and the task SHALL be cancelled

### Requirement: Task cancellation
The system SHALL provide a quick cancel button for running tasks.

#### Scenario: Cancel button display
- **WHEN** a task is in the processing state
- **THEN** the Dynamic Island SHALL display a cancel (X) button in the expanded view

#### Scenario: Cancel confirmation
- **WHEN** the user clicks the cancel button
- **THEN** the Dynamic Island SHALL show a confirmation prompt "Cancel this task?" with "Confirm" and "Dismiss" options

#### Scenario: Cancel execution
- **WHEN** the user confirms cancellation
- **THEN** the system SHALL send the cancel command to Trae IDE and the task SHALL be stopped

### Requirement: Jump to Trae task window
The system SHALL support clicking on the Dynamic Island to navigate to the corresponding Trae IDE task window.

#### Scenario: Click to focus Trae window
- **WHEN** the user clicks on a task in the Dynamic Island
- **THEN** the Trae IDE window containing that task SHALL be brought to the foreground and focused

#### Scenario: Click to navigate to specific task
- **WHEN** the user clicks on a specific task in the full expanded view
- **THEN** the Trae IDE SHALL navigate to the conversation panel containing that specific task

#### Scenario: Trae IDE not running
- **WHEN** the user clicks the Dynamic Island but Trae IDE is not running
- **THEN** the system SHALL attempt to launch Trae IDE, or display a message indicating Trae IDE is not available

### Requirement: Popup interaction with Trae IDE
All interactions on the Dynamic Island SHALL produce real effects on the Trae IDE main window.

#### Scenario: Interaction reliability
- **WHEN** a user performs any action on the Dynamic Island (approve, reject, cancel, click)
- **THEN** the action SHALL be reliably transmitted to Trae IDE and executed, with visual feedback on the Dynamic Island confirming the action was received

#### Scenario: Action feedback
- **WHEN** an action is performed on the Dynamic Island
- **THEN** the Dynamic Island SHALL show a brief success or error indicator (checkmark or X icon, 1.5 seconds) before returning to normal display

#### Scenario: Offline action queuing
- **WHEN** the Dynamic Island is disconnected from Trae IDE and the user performs an action
- **THEN** the system SHALL queue the action and execute it when the connection is restored, displaying a "pending" indicator
