# Code Quality Check Hook

## Purpose
Automatically check code quality and layout issues before committing changes.

## Trigger
- On file save
- Before git commit

## Actions
1. **CSS Validation**
   - Check for proper flexbox/grid usage
   - Verify responsive breakpoints
   - Ensure consistent spacing units

2. **HTML Structure**
   - Validate semantic markup
   - Check for proper nesting
   - Verify accessibility attributes

3. **Layout Checks**
   - Image sizing and proportions
   - Text alignment and spacing
   - Mobile responsiveness

## Configuration
```json
{
  "trigger": "on_save",
  "files": ["*.css", "*.html"],
  "actions": [
    "validate_css_layout",
    "check_responsive_design",
    "verify_image_proportions"
  ]
}
```

## Quality Standards
- Images should be properly sized (min 400px width for hero)
- Text should have proper line-height (1.4-1.6)
- Responsive breakpoints at 640px, 968px
- Consistent spacing using rem units
- Proper semantic HTML structure