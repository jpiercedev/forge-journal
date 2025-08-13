# Cookie Consent Implementation

This document describes the cookie consent implementation for The Forge Journal.

## Overview

The cookie consent system provides GDPR/CCPA compliant cookie management with granular control over different types of cookies:

- **Necessary Cookies**: Essential for website functionality (always enabled)
- **Analytics Cookies**: Google Analytics tracking (user can opt-in/out)
- **Marketing Cookies**: Meta Pixel/Facebook tracking (user can opt-in/out)

## Components

### CookieConsent Component (`components/CookieConsent.tsx`)

The main cookie consent banner that appears on first visit. Features:
- Modal overlay with consent options
- "Accept All", "Reject All", and "Customize" buttons
- Detailed preferences panel with toggle switches
- Automatic application of consent to tracking scripts

### useCookieConsent Hook (`hooks/useCookieConsent.ts`)

React hook for managing cookie consent state:
- `hasConsent`: Boolean indicating if user has made a choice
- `preferences`: Current cookie preferences object
- `hasConsentFor(type)`: Check consent for specific cookie type
- `updatePreferences()`: Update consent preferences
- `revokeConsent()`: Clear all consent

### Cookie Preferences Page (`pages/cookie-preferences.tsx`)

Dedicated page for managing cookie preferences after initial consent:
- Full preference management interface
- Save/revoke functionality
- Help and contact information

## Integration

### Layouts

The CookieConsent component is integrated into:
- `ForgeLayout` (main site layout)
- `AdminLayout` (admin interface)
- `BlogLayout` (blog pages)

### Tracking Scripts

Tracking scripts in `app/layout.tsx` are configured with default consent states:
- Google Analytics: `analytics_storage: 'denied'` by default
- Meta Pixel: `fbq('consent', 'revoke')` by default

Consent is dynamically updated when users make choices.

## Storage

Cookie preferences are stored in localStorage:
- `forge-journal-cookie-consent`: Boolean indicating consent given
- `forge-journal-cookie-preferences`: JSON object with preferences
- `forge-journal-consent-date`: Timestamp of consent

## Privacy Policy Integration

The privacy policy (`pages/privacy-policy.tsx`) includes:
- Updated cookie section with detailed explanations
- Link to cookie preferences page
- Information about cookie types and purposes

## Footer Integration

The site footer includes a "Cookie Preferences" link for easy access to preference management.

## Technical Details

### Consent Application

When users update preferences, the system:
1. Saves preferences to localStorage
2. Updates Google Analytics consent via `gtag('consent', 'update', ...)`
3. Updates Meta Pixel consent via `fbq('consent', 'grant'/'revoke')`

### Default Behavior

- First-time visitors see the consent banner after 1 second delay
- All tracking is disabled by default until consent is given
- Necessary cookies are always enabled and cannot be disabled
- Banner includes backdrop overlay to ensure visibility

### Accessibility

- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader friendly
- High contrast design elements

## Testing

To test the implementation:
1. Clear localStorage and refresh the page
2. Verify the consent banner appears
3. Test different consent combinations
4. Check that tracking scripts respect consent choices
5. Verify preferences persist across page loads

## Compliance

This implementation provides:
- GDPR compliance with explicit consent
- CCPA compliance with opt-out mechanisms
- Clear information about cookie purposes
- Easy preference management
- Granular control over cookie types
