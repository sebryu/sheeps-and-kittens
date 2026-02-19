# Sheeps & Kittens - Improvement Suggestions

## Gameplay Enhancements

### AI Opponent
- Add a single-player mode with an AI opponent using minimax with alpha-beta pruning
- Multiple difficulty levels (Easy: random moves, Medium: shallow search, Hard: deep search with heuristics)
- The BaghChal game tree is well-studied and tractable for AI - good evaluation heuristics exist for both sides

### Move History & Undo
- Implement a move history stack to allow undo/redo
- Show a move log panel (e.g., "Sheep placed at C3", "Kitty D1 captured Sheep at C2")
- Allow replaying a finished game move by move

### Repetition Detection
- Track board positions to detect draw-by-repetition (prevents infinite loops between experienced players)
- Optional "no repeat" rule toggle in settings

### Tutorial Mode
- Interactive step-by-step tutorial teaching the rules
- Highlight suggested moves for beginners
- Explain *why* a move is good (e.g., "This blocks a kitty's escape route")

## Visual & UX Polish

### Animations
- Animate piece movement (slide from old position to new)
- Capture animation (sheep fades/shrinks when captured, kitty slides through)
- Board shake or flash on capture
- Victory celebration animation (confetti, bouncing winner emoji)

### Sound Effects
- Tap sound when placing/selecting pieces
- Slide sound when moving
- Dramatic capture sound
- Win/lose jingles

### Board Themes
- Multiple board skins (wooden, stone, meadow, night mode)
- Custom piece themes (different animal pairs, abstract shapes)
- Dark mode support

### Haptic Feedback
- Light haptic on piece selection
- Medium haptic on move execution
- Strong haptic on capture

## Technical Improvements

### SVG Board Rendering
- Replace the current View-based line drawing with `react-native-svg`
- Cleaner diagonal lines, better scaling across screen sizes
- Smoother rendering on low-end devices

### State Management
- Consider `useReducer` instead of `useState` for game state (more explicit action types)
- Or use Zustand for cleaner state management if the app grows

### Testing
- Unit tests for the game engine (jest)
  - Test all 56 adjacency edges
  - Test capture from every position
  - Test win condition edge cases
  - Test phase transition at exactly 20 sheep
- Integration tests for the UI (React Native Testing Library)
- Snapshot tests for screen components

### Performance
- Memoize `BoardLines` component (it never changes)
- Memoize individual intersection components based on their state
- Use `React.memo` on Board to prevent re-renders when only modal state changes

### Accessibility
- Add `accessibilityLabel` to all interactive elements ("Sheep at row 2 column 3, selected")
- `accessibilityRole="button"` on intersections
- Screen reader announcements for game events ("Kitty captured a sheep!")
- High-contrast mode for colorblind players

## Feature Ideas

### Multiplayer
- Online multiplayer via WebSockets or Firebase
- Room codes for private matches
- Matchmaking queue

### Statistics & Progression
- Track win/loss record for each side
- Average game length
- "Achievements" system (e.g., "Win as Sheeps without losing any", "Capture 5 sheeps in under 10 moves")
- Leaderboard for online play

### Game Variants
- Configurable board size (7x7 for a longer game)
- Adjustable sheep/kitty counts
- Speed mode with move timer
- Handicap options (e.g., kittens start with only 3)

### Social Features
- Share game replays
- Challenge friends via deep links
- In-game chat for online matches

## Platform & Distribution

### App Store Readiness
- Design a proper app icon (not the default Expo one)
- Create splash screen with the game logo
- Add app store screenshots and description
- Set up EAS Build for iOS/Android builds

### Web Version
- Optimize for web with responsive layout
- Keyboard controls (arrow keys to navigate, Enter to select)
- Mouse hover effects showing valid moves

### Internationalization
- Support multiple languages (Nepali would be fitting given BaghChal's origins)
- RTL layout support
