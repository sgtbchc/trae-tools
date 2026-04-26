## ADDED Requirements

### Requirement: Trae ID authentication integration
The system SHALL integrate with the Trae ID authentication system to identify users and authorize plugin and dynamic island operations.

#### Scenario: User authentication flow
- **WHEN** a plugin or the dynamic island needs to perform an authenticated operation
- **THEN** the system SHALL use the Trae ID session token from the current Trae IDE session to authenticate the request

#### Scenario: Unauthenticated user handling
- **WHEN** no valid Trae ID session exists
- **THEN** the system SHALL prompt the user to log in via Trae IDE and SHALL NOT proceed with authenticated operations until login is complete

### Requirement: Unified data channel between Trae IDE and dynamic island
The system SHALL provide a bidirectional communication channel between Trae IDE and the dynamic island application.

#### Scenario: WebSocket server startup
- **WHEN** Trae IDE starts with the plugin system enabled
- **THEN** the system SHALL start a WebSocket server on a configurable local port (default: 18731) for the dynamic island to connect

#### Scenario: Dynamic island connection
- **WHEN** the dynamic island application starts
- **THEN** it SHALL connect to the Trae IDE WebSocket server and authenticate using the Trae ID session token

#### Scenario: Connection loss and reconnection
- **WHEN** the WebSocket connection is lost
- **THEN** the dynamic island SHALL attempt to reconnect every 3 seconds with exponential backoff (max 30 seconds), and display a "disconnected" status indicator

#### Scenario: Message protocol
- **WHEN** a message is sent over the WebSocket channel
- **THEN** it SHALL use a JSON envelope format with fields: `type` (string), `payload` (object), `timestamp` (ISO 8601), and `requestId` (optional, for request-response correlation)

### Requirement: HTTP API for simple operations
The system SHALL expose a local HTTP API for simple query and action operations that do not require real-time communication.

#### Scenario: Task status query via HTTP
- **WHEN** the dynamic island sends an HTTP GET request to `/api/tasks`
- **THEN** the system SHALL return a JSON array of current task statuses

#### Scenario: Task action via HTTP
- **WHEN** the dynamic island sends an HTTP POST request to `/api/tasks/:id/action` with a valid action payload (cancel, approve)
- **THEN** the system SHALL execute the action on the specified task and return the result

#### Scenario: API authentication
- **WHEN** an HTTP request is received
- **THEN** the system SHALL validate the Trae ID token in the `Authorization` header before processing the request

### Requirement: Plugin lifecycle management
The system SHALL manage the lifecycle of all plugins, including registration, initialization, activation, deactivation, and disposal.

#### Scenario: Plugin registration
- **WHEN** a plugin is installed
- **THEN** the system SHALL register it in the plugin registry with its metadata (name, version, capabilities, dependencies)

#### Scenario: Plugin initialization order
- **WHEN** the plugin system starts
- **THEN** the system SHALL initialize plugins in dependency order, ensuring that a plugin's dependencies are initialized before the plugin itself

#### Scenario: Plugin error isolation
- **WHEN** a plugin throws an unhandled error
- **THEN** the system SHALL catch the error, log it, and deactivate the failing plugin without affecting other plugins or the Trae IDE

### Requirement: Event bus for inter-plugin communication
The system SHALL provide a typed event bus that enables plugins and the dynamic island to communicate through published events.

#### Scenario: Event subscription
- **WHEN** a plugin subscribes to an event type
- **THEN** the system SHALL deliver all future events of that type to the subscriber's handler function

#### Scenario: Event publication
- **WHEN** a plugin publishes an event
- **THEN** the system SHALL deliver the event to all subscribers synchronously and in subscription order

#### Scenario: Event forwarding to dynamic island
- **WHEN** an event is published on the event bus that is marked for external consumption
- **THEN** the system SHALL forward the event to the dynamic island via the WebSocket channel
