## ADDED Requirements

### Requirement: Real-time token consumption tracking
The system SHALL track token consumption in real-time during each conversation session, recording input tokens, output tokens, and total tokens for every exchange.

#### Scenario: Token tracking during active conversation
- **WHEN** a user sends a message and receives an AI response in Trae IDE
- **THEN** the system SHALL record the input token count, output token count, and total token count for that exchange within 1 second of response completion

#### Scenario: Token tracking for streaming responses
- **WHEN** an AI response is being streamed token by token
- **THEN** the system SHALL update the output token count incrementally as tokens are received, providing a real-time counter

### Requirement: Cumulative token calculation
The system SHALL maintain cumulative token consumption totals across all conversations within a session and across sessions.

#### Scenario: Session cumulative total
- **WHEN** a user has completed multiple exchanges in a single session
- **THEN** the system SHALL display the cumulative input tokens, output tokens, and total tokens for the current session

#### Scenario: Cross-session cumulative total
- **WHEN** a user starts a new session after previous sessions
- **THEN** the system SHALL display the all-time cumulative token totals, persisted from previous sessions

### Requirement: Token consumption history with time-range filtering
The system SHALL store token consumption history and support querying by time range.

#### Scenario: Query history by custom time range
- **WHEN** a user requests token history for a specific time range (e.g., last 24 hours, last 7 days, last 30 days)
- **THEN** the system SHALL return all token consumption records within that range, grouped by conversation session

#### Scenario: History record detail
- **WHEN** a user views a specific history record
- **THEN** the system SHALL display the timestamp, conversation ID, input tokens, output tokens, total tokens, and model name for that exchange

### Requirement: Token data persistence
The system SHALL persist all token consumption data to a local JSON file.

#### Scenario: Data persistence across restarts
- **WHEN** Trae IDE is restarted
- **THEN** all previously recorded token data SHALL be available for querying without data loss

#### Scenario: Data file location
- **WHEN** the token tracker is initialized
- **THEN** the token data SHALL be stored in `~/.trae-tool/token-records.json`

#### Scenario: Atomic file writes
- **WHEN** token data is written to the file
- **THEN** the system SHALL use atomic writes (write to temp file then rename) to prevent data corruption

### Requirement: Token statistics event emission
The system SHALL emit events via the event bus whenever token consumption is recorded, enabling other plugins and the dynamic island to react.

#### Scenario: Event emission on token update
- **WHEN** a new token consumption record is created
- **THEN** the system SHALL emit a `token:updated` event with the current exchange data and cumulative totals

#### Scenario: Event emission on session end
- **WHEN** a conversation session ends
- **THEN** the system SHALL emit a `token:session-ended` event with the session summary
