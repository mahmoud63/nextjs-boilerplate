# Browser Alerts Rule
- Never use the native browser `window.alert()` or `window.confirm()` dialogs anywhere in the application.
- Always use the custom UI components, such as `<AlertModal />` in `src/components/ui/AlertModal.tsx`, to display messages, errors, or confirmations to the user.
