# Sheeps & Kittens

BaghChal (Nepali board game) re-themed: goats → sheeps (🐑), tigers → kittens (🐱).

## Tech Stack
- MvvmCross 9.3.1 with Xamarin.Forms 5.0
- C# / .NET Standard 2.0 (Core library)
- MVVM architecture with MvvmCross navigation, commands, and IoC
- Platform targets: iOS (Xamarin.iOS), Android (Xamarin.Android)
- NUnit 4.0 for unit tests

## Project Structure
```
SheepsAndKittens.sln                                  - Solution file
src/SheepsAndKittens.Core/                            - Shared core library (netstandard2.0)
  Models/GameEnums.cs                                 - Piece, Turn, Phase, GameMode, Difficulty enums
  Models/Position.cs                                  - Position struct (row, col)
  Models/GameMove.cs                                  - Move representation (type, from, to, captured)
  Models/GameConfig.cs                                - Game configuration (mode, difficulty)
  Models/GameState.cs                                 - Full game state with Clone()
  Models/GameEngine.cs                                - Game logic (adjacency, moves, captures, win conditions)
  Services/AiEngine.cs                                - AI with minimax + alpha-beta pruning
  Services/Interfaces/IHapticService.cs               - Haptic feedback interface
  Services/Interfaces/ISoundService.cs                - Sound playback interface
  ViewModels/WelcomeViewModel.cs                      - Welcome screen VM (mode/difficulty selection)
  ViewModels/GameViewModel.cs                         - Game screen VM (state, AI, sounds, haptics)
  ViewModels/TutorialViewModel.cs                     - Tutorial VM (7 steps with mini board)
  App.cs                                              - MvvmCross app entry point

src/SheepsAndKittens.Forms/                           - Xamarin.Forms UI (netstandard2.0)
  Views/WelcomePage.xaml(.cs)                          - Welcome screen XAML view
  Views/GamePage.xaml(.cs)                             - Game screen XAML view
  Views/TutorialPage.xaml(.cs)                         - Tutorial XAML view
  Controls/BoardView.cs                               - Custom 5x5 board control with tap handling
  Converters/BoolToColorConverter.cs                  - Value converters for XAML bindings
  App.xaml(.cs)                                       - Xamarin.Forms Application with shared styles
  FormsApp.cs                                         - MvxFormsApplication

src/SheepsAndKittens.iOS/                             - iOS platform host
  AppDelegate.cs                                      - MvxFormsApplicationDelegate
  Setup.cs                                            - MvvmCross iOS setup with service registration
  Services/IosHapticService.cs                        - UIImpactFeedbackGenerator implementation
  Services/IosSoundService.cs                         - AVAudioPlayer implementation

src/SheepsAndKittens.Android/                         - Android platform host
  MainActivity.cs                                     - MvxFormsAppCompatActivity
  Setup.cs                                            - MvvmCross Android setup with service registration
  Services/AndroidHapticService.cs                    - Vibrator/VibrationEffect implementation
  Services/AndroidSoundService.cs                     - SoundPool implementation

src/SheepsAndKittens.Tests/                           - Unit tests (net8.0, NUnit)
  GameEngineTests.cs                                  - Game engine test suite
  AiEngineTests.cs                                    - AI engine test suite
```

## Game Rules (quick ref)
- 5x5 board, diagonals exist only where (row + col) is even
- 4 kittens start at corners, 20 sheeps placed one per turn
- Kittens capture by jumping over adjacent sheep to empty space
- Kittens win: capture 5 sheeps. Sheeps win: block all kittens.
- Two phases: Placement (place sheeps) → Movement (move pieces)

## Architecture
- **MVVM pattern** via MvvmCross: ViewModels in Core, Views in Forms
- **Navigation**: MvvmCross `IMvxNavigationService` with typed parameters (`GameConfig`)
- **IoC**: Platform services (haptics, sound) registered in platform-specific `Setup.cs`
- **Game state**: Immutable via `Clone()` — `HandleTap` and `ApplyMove` return new state objects

## Agent Team
When building features or making significant changes, follow the blueprint in `AGENT_TEAM.md`:
- **Research agent** (general-purpose, opus) — spawn before implementing unfamiliar logic
- **Code auditor** (general-purpose, sonnet) — spawn after writing game logic, before building UI on top
- Main thread handles all file writing, builds, and integration
