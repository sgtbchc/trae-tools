## ADDED Requirements

### Requirement: API Key configuration and local storage
The system SHALL allow users to configure API keys for external coding plan platforms and store them in the local config file.

#### Scenario: Configure API key for Volcengine Coding Plan
- **WHEN** a user provides an API key for the Volcengine Coding Plan platform
- **THEN** the system SHALL validate the key by making a test API call and store it in `~/.trae-tool/config.json` upon successful validation

#### Scenario: Invalid API key rejection
- **WHEN** a user provides an invalid API key
- **THEN** the system SHALL reject the key with a clear error message and SHALL NOT store it

#### Scenario: API key retrieval
- **WHEN** the system needs to make an API call
- **THEN** the system SHALL read the API key from `~/.trae-tool/config.json`

### Requirement: Volcengine Coding Plan quota query
The system SHALL query and display quota usage information from the Volcengine Coding Plan platform.

#### Scenario: Query quota for 5-hour window
- **WHEN** a user requests quota information for the 5-hour window
- **THEN** the system SHALL display the used quota, remaining quota, and total quota for the current 5-hour rolling window

#### Scenario: Query quota for weekly window
- **WHEN** a user requests quota information for the weekly window
- **THEN** the system SHALL display the used quota, remaining quota, and total quota for the current week (Monday to Sunday)

#### Scenario: Query quota for monthly window
- **WHEN** a user requests quota information for the monthly window
- **THEN** the system SHALL display the used quota, remaining quota, and total quota for the current calendar month

#### Scenario: Quota query failure handling
- **WHEN** a quota query fails due to network error or API error
- **THEN** the system SHALL display the last known quota data with a "stale" indicator and the timestamp of the last successful query

### Requirement: Multi-platform extension interface
The system SHALL provide a provider interface that allows adding support for additional LLM platforms without modifying the core quota manager.

#### Scenario: Register a new platform provider
- **WHEN** a developer implements the `IQuotaProvider` interface for a new platform and registers it
- **THEN** the system SHALL make that platform's quota information available through the same UI and API as existing platforms

#### Scenario: IQuotaProvider interface contract
- **WHEN** a developer implements the `IQuotaProvider` interface
- **THEN** the implementation MUST provide methods: `validateKey(key)`, `queryQuota(key, timeWindow)`, `getPlatformName()`, and `getSupportedTimeWindows()`

### Requirement: Quota data caching
The system SHALL cache quota query results to minimize API calls and improve responsiveness.

#### Scenario: Cache duration
- **WHEN** a quota query is made
- **THEN** the system SHALL cache the result for 5 minutes and return cached data for subsequent queries within that period

#### Scenario: Force refresh
- **WHEN** a user explicitly requests a quota refresh
- **THEN** the system SHALL bypass the cache and make a fresh API call

### Requirement: Quota change event emission
The system SHALL emit events when quota information is updated.

#### Scenario: Event on quota update
- **WHEN** quota data is refreshed (either from cache or API)
- **THEN** the system SHALL emit a `quota:updated` event with the current quota information for all configured platforms

#### Scenario: Event on low quota warning
- **WHEN** the remaining quota for any time window drops below 20% of the total
- **THEN** the system SHALL emit a `quota:low` event with the platform name and affected time window
