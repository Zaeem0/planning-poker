# Visual Regression Testing

This directory contains visual regression tests to catch unintended UI changes.

## Overview

Visual regression tests take screenshots of UI components and compare them against baseline images. If the screenshots don't match, the test fails, alerting you to visual changes.

## Running Visual Tests

### First Time Setup (Generate Baselines)

When running visual tests for the first time, you need to generate baseline screenshots:

```bash
# Run visual tests and generate baselines
yarn test:e2e visual-regression.spec.ts --update-snapshots
```

This creates baseline images in `e2e/visual-regression.spec.ts-snapshots/`.

### Running Visual Tests

After baselines are created, run tests normally:

```bash
# Run all visual regression tests
yarn test:e2e visual-regression.spec.ts

# Run specific visual test
yarn test:e2e visual-regression.spec.ts -g "unanimous vote"
```

### Updating Baselines

When you intentionally change the UI, update the baselines:

```bash
# Update all snapshots
yarn test:e2e visual-regression.spec.ts --update-snapshots

# Update specific snapshot
yarn test:e2e visual-regression.spec.ts -g "unanimous vote" --update-snapshots
```

## What's Tested

### Voting Cards
- **Initial state**: Cards before any voting
- **Selected state**: Card appearance when selected
- **Revealed with most common**: Cards after reveal showing most voted card
- **Unanimous vote**: Special styling when all users vote the same (large emoji, no title text)
- **Mixed votes**: Cards with different vote percentages and opacity

### Player Cards
- **Mixed states**: Some players voted, some haven't
- **Revealed states**: Player cards showing votes after reveal

### Card Set Selector
- **Default view**: Card set selector with presets
- **Custom editor**: Visual WYSIWYG card editor

## When Tests Fail

If a visual test fails:

1. **Review the diff**: Playwright generates a diff image showing what changed
2. **Check if intentional**: Did you mean to change the UI?
   - **Yes**: Update the baseline with `--update-snapshots`
   - **No**: Fix the code to match the original design

### Viewing Diffs

Failed tests generate comparison images in:
```
e2e/test-results/
  visual-regression-<test-name>/
    <snapshot-name>-actual.png    # What the test captured
    <snapshot-name>-expected.png  # The baseline
    <snapshot-name>-diff.png      # Visual diff highlighting changes
```

## Configuration

Visual snapshot settings in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,      // Allow up to 100 pixels difference
    threshold: 0.2,          // 20% threshold for pixel color difference
    animations: 'disabled',  // Disable animations for consistent snapshots
  },
}
```

## Best Practices

1. **Disable animations**: Use `animations: 'disabled'` for animated elements
2. **Wait for stability**: Use `waitForTimeout()` after state changes
3. **Isolate components**: Snapshot specific elements, not full pages
4. **Consistent state**: Ensure tests create the same state every time
5. **Update intentionally**: Only update baselines when you mean to change the UI

## Common Issues

### Flaky Tests
If snapshots are inconsistent:
- Increase wait times after state changes
- Disable animations on the element
- Use `waitForLoadState('networkidle')` before snapshots

### Font Rendering Differences
Different OS/browsers may render fonts differently:
- Run tests in CI with consistent environment
- Use web fonts instead of system fonts
- Increase `threshold` if minor font differences are acceptable

## CI/CD Integration

In CI, visual tests will:
1. Run against existing baselines
2. Fail if any visual changes detected
3. Upload diff images as artifacts

To update baselines in CI, manually run with `--update-snapshots` and commit the changes.

