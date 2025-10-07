# Icons Directory

This directory contains all SVG icons and icon assets used throughout the Esports Organizer application.

## Structure:

- `ui/`: User interface icons (buttons, navigation, etc.)
- `games/`: Game-specific icons and logos
- `social/`: Social media and community icons
- `tournament/`: Tournament-related icons (trophy, calendar, etc.)
- `common/`: Common icons used across the application

## Usage:

To use an icon in your React components, import it and use it as a component:

```jsx
import { TrophyIcon } from '../assets/icons/tournament/TrophyIcon';
import { CalendarIcon } from '../assets/icons/common/CalendarIcon';

// Usage
<TrophyIcon className="icon-trophy" />
<CalendarIcon className="icon-calendar" />
```

## Icon Guidelines:

- All icons should be SVG format for scalability
- Use consistent stroke width (typically 2px)
- Follow the application's color scheme
- Icons should be accessible with proper ARIA labels
- Use descriptive names for icon files

## Color Variables:

- Primary: `var(--light-link)` (#7d5ba6)
- Secondary: `var(--light-gradient)`
- Text: `var(--light-text)` or `white` for dark backgrounds
- Accent: `var(--light-accent)`
