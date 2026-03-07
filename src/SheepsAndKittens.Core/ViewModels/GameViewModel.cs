using System.Collections.Generic;
using System.Threading.Tasks;
using MvvmCross.Commands;
using MvvmCross.Navigation;
using MvvmCross.ViewModels;
using SheepsAndKittens.Core.Models;
using SheepsAndKittens.Core.Services;
using SheepsAndKittens.Core.Services.Interfaces;

namespace SheepsAndKittens.Core.ViewModels
{
    public class GameViewModel : MvxViewModel<GameConfig>
    {
        private readonly IMvxNavigationService _navigationService;
        private readonly ISoundService _soundService;
        private readonly IHapticService _hapticService;

        private GameConfig _gameConfig = new GameConfig();
        private GameState _gameState = GameEngine.CreateInitialState();

        public GameState GameState
        {
            get => _gameState;
            private set
            {
                var oldState = _gameState;
                SetProperty(ref _gameState, value);
                RaisePropertyChanged(nameof(StatusText));
                RaisePropertyChanged(nameof(SheepPlaced));
                RaisePropertyChanged(nameof(SheepCaptured));
                RaisePropertyChanged(nameof(CurrentTurn));
                RaisePropertyChanged(nameof(HasWinner));
                RaisePropertyChanged(nameof(WinnerText));
                RaisePropertyChanged(nameof(IsPlacementPhase));
                RaisePropertyChanged(nameof(PhaseText));
                RaisePropertyChanged(nameof(BoardState));
                RaisePropertyChanged(nameof(ValidMoves));
                RaisePropertyChanged(nameof(SelectedPiece));
                HandleStateChange(oldState, value);
            }
        }

        public string StatusText => GameEngine.GetGameStatusText(_gameState);
        public int SheepPlaced => _gameState.SheepPlaced;
        public int SheepCaptured => _gameState.SheepCaptured;
        public Turn CurrentTurn => _gameState.Turn;
        public bool HasWinner => _gameState.Winner.HasValue;
        public bool IsPlacementPhase => _gameState.Phase == Phase.Placement;
        public string PhaseText => _gameState.Phase == Phase.Placement ? "Placement" : "Movement";
        public Piece[,] BoardState => _gameState.Board;
        public List<Position> ValidMoves => _gameState.ValidMoves;
        public Position? SelectedPiece => _gameState.SelectedPiece;

        private bool _isAiThinking;
        public bool IsAiThinking
        {
            get => _isAiThinking;
            private set => SetProperty(ref _isAiThinking, value);
        }

        public string WinnerText
        {
            get
            {
                if (!_gameState.Winner.HasValue) return "";
                if (_gameState.ForfeitedBy.HasValue)
                {
                    return _gameState.ForfeitedBy == Turn.Sheep
                        ? "Sheeps forfeited!\nKittens win!"
                        : "Kittens forfeited!\nSheeps win!";
                }
                return _gameState.Winner == Turn.Sheep
                    ? "Sheeps win!\nAll kittens are blocked!"
                    : "Kittens win!\nCaptured 5 sheeps!";
            }
        }

        public string SheepLabel
        {
            get
            {
                if (_gameConfig.Mode == GameMode.AiSheep) return "Sheeps (AI)";
                if (_gameConfig.Mode == GameMode.AiKitty) return "Sheeps (You)";
                return "Sheeps";
            }
        }

        public string KittyLabel
        {
            get
            {
                if (_gameConfig.Mode == GameMode.AiKitty) return "Kittens (AI)";
                if (_gameConfig.Mode == GameMode.AiSheep) return "Kittens (You)";
                return "Kittens";
            }
        }

        public IMvxAsyncCommand<Position> TapCellCommand { get; }
        public IMvxCommand RestartCommand { get; }
        public IMvxCommand ForfeitCommand { get; }
        public IMvxAsyncCommand BackCommand { get; }

        public GameViewModel(
            IMvxNavigationService navigationService,
            ISoundService soundService,
            IHapticService hapticService)
        {
            _navigationService = navigationService;
            _soundService = soundService;
            _hapticService = hapticService;

            TapCellCommand = new MvxAsyncCommand<Position>(OnTapCellAsync);
            RestartCommand = new MvxCommand(OnRestart);
            ForfeitCommand = new MvxCommand(OnForfeit);
            BackCommand = new MvxAsyncCommand(OnBackAsync);
        }

        public override void Prepare(GameConfig parameter)
        {
            _gameConfig = parameter;
        }

        public override async Task Initialize()
        {
            await base.Initialize();
            await _soundService.LoadAllSoundsAsync();
            _gameState = GameEngine.CreateInitialState();
            RaiseAllPropertiesChanged();
        }

        private async Task OnTapCellAsync(Position position)
        {
            if (IsAiThinking || _gameState.Winner.HasValue) return;

            // Block taps when it's the AI's turn
            if (IsAiTurn()) return;

            var newState = GameEngine.HandleTap(_gameState, position.Row, position.Col);
            if (newState == _gameState)
            {
                await _hapticService.TriggerHapticAsync(HapticEvent.Invalid);
                await _soundService.PlaySoundAsync(SoundName.Invalid);
                return;
            }

            GameState = newState;

            // If it's now the AI's turn, make the AI move
            if (IsAiTurn() && !_gameState.Winner.HasValue)
            {
                await MakeAiMoveAsync();
            }
        }

        private bool IsAiTurn()
        {
            if (_gameConfig.Mode == GameMode.Local) return false;
            if (_gameConfig.Mode == GameMode.AiSheep && _gameState.Turn == Turn.Sheep) return true;
            if (_gameConfig.Mode == GameMode.AiKitty && _gameState.Turn == Turn.Kitty) return true;
            return false;
        }

        private async Task MakeAiMoveAsync()
        {
            IsAiThinking = true;

            // Small delay to feel natural
            await Task.Delay(600);

            var move = AiEngine.FindBestMove(_gameState, _gameConfig.Difficulty);
            if (move != null)
            {
                var newState = GameEngine.ApplyMove(_gameState, move);
                GameState = newState;
            }

            IsAiThinking = false;
        }

        private async void HandleStateChange(GameState oldState, GameState newState)
        {
            if (newState.LastMove != null)
            {
                switch (newState.LastMove.Type)
                {
                    case MoveType.Place:
                        await _hapticService.TriggerHapticAsync(HapticEvent.Place);
                        await _soundService.PlaySoundAsync(SoundName.Place);
                        break;
                    case MoveType.Move:
                        await _hapticService.TriggerHapticAsync(HapticEvent.Move);
                        await _soundService.PlaySoundAsync(SoundName.Move);
                        break;
                    case MoveType.Capture:
                        await _hapticService.TriggerHapticAsync(HapticEvent.Capture);
                        await _soundService.PlaySoundAsync(SoundName.Capture);
                        break;
                }
            }

            if (newState.Winner.HasValue && !oldState.Winner.HasValue)
            {
                await _hapticService.TriggerHapticAsync(HapticEvent.Win);
                await _soundService.PlaySoundAsync(SoundName.Win);
            }

            if (oldState.Phase == Phase.Placement && newState.Phase == Phase.Movement)
            {
                await _hapticService.TriggerHapticAsync(HapticEvent.PhaseChange);
            }

            if (newState.SelectedPiece.HasValue && !oldState.SelectedPiece.HasValue)
            {
                await _hapticService.TriggerHapticAsync(HapticEvent.Select);
                await _soundService.PlaySoundAsync(SoundName.Select);
            }
        }

        private void OnRestart()
        {
            GameState = GameEngine.CreateInitialState();
        }

        private void OnForfeit()
        {
            if (_gameState.Winner.HasValue) return;
            GameState = GameEngine.ForfeitGame(_gameState);
        }

        private async Task OnBackAsync()
        {
            await _soundService.UnloadAllSoundsAsync();
            await _navigationService.Close(this);
        }
    }
}
