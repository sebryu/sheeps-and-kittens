using System.Threading.Tasks;
using MvvmCross.Commands;
using MvvmCross.Navigation;
using MvvmCross.ViewModels;
using SheepsAndKittens.Core.Models;

namespace SheepsAndKittens.Core.ViewModels
{
    public class WelcomeViewModel : MvxViewModel
    {
        private readonly IMvxNavigationService _navigationService;

        private GameMode _selectedMode = GameMode.Local;
        public GameMode SelectedMode
        {
            get => _selectedMode;
            set
            {
                SetProperty(ref _selectedMode, value);
                RaisePropertyChanged(nameof(IsAiMode));
                RaisePropertyChanged(nameof(ModeDescription));
            }
        }

        private Difficulty _selectedDifficulty = Difficulty.Medium;
        public Difficulty SelectedDifficulty
        {
            get => _selectedDifficulty;
            set => SetProperty(ref _selectedDifficulty, value);
        }

        public bool IsAiMode => SelectedMode != GameMode.Local;

        public string ModeDescription
        {
            get
            {
                switch (SelectedMode)
                {
                    case GameMode.Local: return "Play with a friend on the same device";
                    case GameMode.AiSheep: return "You play as Kittens vs AI Sheeps";
                    case GameMode.AiKitty: return "You play as Sheeps vs AI Kittens";
                    default: return "";
                }
            }
        }

        public IMvxCommand SelectLocalCommand { get; }
        public IMvxCommand SelectAiSheepCommand { get; }
        public IMvxCommand SelectAiKittyCommand { get; }
        public IMvxCommand SelectEasyCommand { get; }
        public IMvxCommand SelectMediumCommand { get; }
        public IMvxCommand SelectHardCommand { get; }
        public IMvxAsyncCommand PlayCommand { get; }
        public IMvxAsyncCommand TutorialCommand { get; }

        public WelcomeViewModel(IMvxNavigationService navigationService)
        {
            _navigationService = navigationService;

            SelectLocalCommand = new MvxCommand(() => SelectedMode = GameMode.Local);
            SelectAiSheepCommand = new MvxCommand(() => SelectedMode = GameMode.AiSheep);
            SelectAiKittyCommand = new MvxCommand(() => SelectedMode = GameMode.AiKitty);
            SelectEasyCommand = new MvxCommand(() => SelectedDifficulty = Difficulty.Easy);
            SelectMediumCommand = new MvxCommand(() => SelectedDifficulty = Difficulty.Medium);
            SelectHardCommand = new MvxCommand(() => SelectedDifficulty = Difficulty.Hard);

            PlayCommand = new MvxAsyncCommand(OnPlayAsync);
            TutorialCommand = new MvxAsyncCommand(OnTutorialAsync);
        }

        private async Task OnPlayAsync()
        {
            var config = new GameConfig
            {
                Mode = SelectedMode,
                Difficulty = SelectedDifficulty
            };
            await _navigationService.Navigate<GameViewModel, GameConfig>(config);
        }

        private async Task OnTutorialAsync()
        {
            await _navigationService.Navigate<TutorialViewModel>();
        }
    }
}
