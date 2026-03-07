using System.Collections.Generic;
using System.Threading.Tasks;
using MvvmCross.Commands;
using MvvmCross.Navigation;
using MvvmCross.ViewModels;
using SheepsAndKittens.Core.Models;

namespace SheepsAndKittens.Core.ViewModels
{
    public class TutorialStep
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Icon { get; set; } = "";
    }

    public class TutorialViewModel : MvxViewModel
    {
        private readonly IMvxNavigationService _navigationService;

        private int _currentStep;
        public int CurrentStep
        {
            get => _currentStep;
            set
            {
                SetProperty(ref _currentStep, value);
                RaisePropertyChanged(nameof(CurrentTutorialStep));
                RaisePropertyChanged(nameof(IsFirstStep));
                RaisePropertyChanged(nameof(IsLastStep));
                RaisePropertyChanged(nameof(ProgressText));
                UpdateMiniBoard();
            }
        }

        public List<TutorialStep> Steps { get; } = new List<TutorialStep>
        {
            new TutorialStep
            {
                Title = "The Board",
                Description = "The game is played on a 5x5 grid of intersections. Pieces move along the lines. Some intersections also have diagonal connections.",
                Icon = "grid"
            },
            new TutorialStep
            {
                Title = "Meet the Kittens",
                Description = "4 Kittens start at the corners of the board. They are the predators trying to capture Sheeps.",
                Icon = "cat"
            },
            new TutorialStep
            {
                Title = "Placing Sheeps",
                Description = "Players take turns. On Sheep's turn during placement phase, place one sheep on any empty intersection. There are 20 sheeps to place total.",
                Icon = "sheep"
            },
            new TutorialStep
            {
                Title = "Moving Pieces",
                Description = "After all 20 sheeps are placed, both sides move pieces to adjacent empty intersections along the lines.",
                Icon = "move"
            },
            new TutorialStep
            {
                Title = "Kitten Captures",
                Description = "A Kitten captures a Sheep by jumping over it to an empty space beyond. Only Kittens can capture, and only Sheeps can be captured.",
                Icon = "capture"
            },
            new TutorialStep
            {
                Title = "Diagonal Rules",
                Description = "Diagonal connections only exist at intersections where (row + column) is even. This affects both movement and captures.",
                Icon = "diagonal"
            },
            new TutorialStep
            {
                Title = "Winning the Game",
                Description = "Kittens win by capturing 5 sheeps. Sheeps win by blocking all kittens so they can't move.",
                Icon = "trophy"
            }
        };

        public TutorialStep CurrentTutorialStep => Steps[_currentStep];
        public bool IsFirstStep => _currentStep == 0;
        public bool IsLastStep => _currentStep == Steps.Count - 1;
        public int TotalSteps => Steps.Count;
        public string ProgressText => $"{_currentStep + 1} / {Steps.Count}";

        // Mini board state for tutorial visualization
        private Piece[,] _miniBoard = new Piece[5, 5];
        public Piece[,] MiniBoard
        {
            get => _miniBoard;
            private set => SetProperty(ref _miniBoard, value);
        }

        private List<Position> _highlightPositions = new List<Position>();
        public List<Position> HighlightPositions
        {
            get => _highlightPositions;
            private set => SetProperty(ref _highlightPositions, value);
        }

        public IMvxCommand NextStepCommand { get; }
        public IMvxCommand PreviousStepCommand { get; }
        public IMvxAsyncCommand CloseCommand { get; }
        public IMvxAsyncCommand StartPlayingCommand { get; }

        public TutorialViewModel(IMvxNavigationService navigationService)
        {
            _navigationService = navigationService;

            NextStepCommand = new MvxCommand(() =>
            {
                if (CurrentStep < Steps.Count - 1) CurrentStep++;
            });
            PreviousStepCommand = new MvxCommand(() =>
            {
                if (CurrentStep > 0) CurrentStep--;
            });
            CloseCommand = new MvxAsyncCommand(async () => await _navigationService.Close(this));
            StartPlayingCommand = new MvxAsyncCommand(async () => await _navigationService.Close(this));
        }

        public override Task Initialize()
        {
            UpdateMiniBoard();
            return base.Initialize();
        }

        private void UpdateMiniBoard()
        {
            var board = new Piece[5, 5];
            var highlights = new List<Position>();

            switch (_currentStep)
            {
                case 0: // The Board - empty grid
                    break;

                case 1: // Meet the Kittens - corners
                    board[0, 0] = Piece.Kitty;
                    board[0, 4] = Piece.Kitty;
                    board[4, 0] = Piece.Kitty;
                    board[4, 4] = Piece.Kitty;
                    highlights.Add(new Position(0, 0));
                    highlights.Add(new Position(0, 4));
                    highlights.Add(new Position(4, 0));
                    highlights.Add(new Position(4, 4));
                    break;

                case 2: // Placing Sheeps
                    board[0, 0] = Piece.Kitty;
                    board[0, 4] = Piece.Kitty;
                    board[4, 0] = Piece.Kitty;
                    board[4, 4] = Piece.Kitty;
                    board[2, 2] = Piece.Sheep;
                    board[1, 2] = Piece.Sheep;
                    board[2, 1] = Piece.Sheep;
                    highlights.Add(new Position(2, 3)); // next placement hint
                    break;

                case 3: // Moving Pieces
                    board[0, 0] = Piece.Kitty;
                    board[0, 4] = Piece.Kitty;
                    board[4, 0] = Piece.Kitty;
                    board[4, 4] = Piece.Kitty;
                    board[2, 2] = Piece.Sheep;
                    board[1, 2] = Piece.Sheep;
                    board[2, 1] = Piece.Sheep;
                    board[3, 2] = Piece.Sheep;
                    highlights.Add(new Position(2, 2));
                    break;

                case 4: // Kitten Captures
                    board[0, 0] = Piece.Kitty;
                    board[2, 2] = Piece.Sheep;
                    board[1, 1] = Piece.Kitty;
                    highlights.Add(new Position(1, 1));
                    highlights.Add(new Position(2, 2));
                    highlights.Add(new Position(3, 3));
                    break;

                case 5: // Diagonal Rules
                    // Highlight positions with diagonals
                    for (int r = 0; r < 5; r++)
                        for (int c = 0; c < 5; c++)
                            if ((r + c) % 2 == 0)
                                highlights.Add(new Position(r, c));
                    break;

                case 6: // Winning
                    board[0, 0] = Piece.Kitty;
                    board[0, 4] = Piece.Kitty;
                    board[4, 0] = Piece.Kitty;
                    board[4, 4] = Piece.Kitty;
                    // Show some sheeps surrounding kittens
                    board[0, 1] = Piece.Sheep;
                    board[1, 0] = Piece.Sheep;
                    board[1, 1] = Piece.Sheep;
                    board[0, 3] = Piece.Sheep;
                    board[1, 4] = Piece.Sheep;
                    board[1, 3] = Piece.Sheep;
                    break;
            }

            MiniBoard = board;
            HighlightPositions = highlights;
        }
    }
}
