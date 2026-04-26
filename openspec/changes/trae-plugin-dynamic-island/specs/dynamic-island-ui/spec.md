## ADDED Requirements

### Requirement: Dynamic Island visual appearance
The system SHALL render a Dynamic Island UI element at the top center of each monitor, visually inspired by Apple's Dynamic Island design.

#### Scenario: Default compact state
- **WHEN** no active task or notification requires attention
- **THEN** the Dynamic Island SHALL display in a compact pill shape (approximately 200x36 pixels) centered at the top of the primary monitor, showing the Trae logo or status icon

#### Scenario: Expanded state on hover or active task
- **WHEN** the user hovers over the Dynamic Island or an active task is running
- **THEN** the Dynamic Island SHALL expand with a smooth animation (300ms ease-out) to display task details, token speed, or notification content

#### Scenario: Full expanded state for detailed interaction
- **WHEN** the user clicks on the Dynamic Island
- **THEN** it SHALL expand to its full size (approximately 400x200 pixels) showing all available information and interaction controls

### Requirement: Window properties for Dynamic Island
The system SHALL configure the Dynamic Island window with specific properties to achieve the desired visual effect.

#### Scenario: Always-on-top behavior
- **WHEN** the Dynamic Island is visible
- **THEN** it SHALL remain on top of all other windows, including fullscreen applications when possible

#### Scenario: Transparent and frameless window
- **WHEN** the Dynamic Island is rendered
- **THEN** the window SHALL be frameless (no title bar or borders) with a transparent background, showing only the Dynamic Island content with rounded corners (20px radius)

#### Scenario: Click-through for non-interactive areas
- **WHEN** the user clicks on the transparent area outside the Dynamic Island content
- **THEN** the click SHALL pass through to the window beneath

### Requirement: Multi-monitor support
The system SHALL support displaying the Dynamic Island on multiple monitors simultaneously.

#### Scenario: Dynamic Island on each monitor
- **WHEN** multiple monitors are connected
- **THEN** the system SHALL render a Dynamic Island at the top center of each monitor

#### Scenario: Primary monitor as default
- **WHEN** only one Dynamic Island is needed (user preference)
- **THEN** the system SHALL display it on the primary monitor by default

#### Scenario: Per-monitor DPI awareness
- **WHEN** monitors have different DPI scaling settings
- **THEN** the Dynamic Island SHALL render at the correct physical size on each monitor, maintaining visual consistency

### Requirement: Animation and transition effects
The system SHALL provide smooth animations for all Dynamic Island state transitions.

#### Scenario: State transition animation
- **WHEN** the Dynamic Island transitions between compact, expanded, and full states
- **THEN** the transition SHALL use a spring animation with 300ms duration and natural deceleration

#### Scenario: Content update animation
- **WHEN** the displayed content changes (e.g., task status update)
- **THEN** the content SHALL fade transition with a 200ms duration

#### Scenario: Notification animation
- **WHEN** a new notification arrives
- **THEN** the Dynamic Island SHALL pulse briefly (scale to 1.05x and back) to draw attention

### Requirement: Theme and color scheme
The system SHALL use a dark theme by default with accent colors for status indicators.

#### Scenario: Dark theme default
- **WHEN** the Dynamic Island is displayed
- **THEN** it SHALL use a dark semi-transparent background (rgba(0,0,0,0.85)) with white text

#### Scenario: Status color coding
- **WHEN** a task status is displayed
- **THEN** the system SHALL use the following color scheme: waiting=amber, processing=blue, completed=green, failed=red, approval-pending=purple
