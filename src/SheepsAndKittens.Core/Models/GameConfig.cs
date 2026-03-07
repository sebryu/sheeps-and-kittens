namespace SheepsAndKittens.Core.Models
{
    public class GameConfig
    {
        public GameMode Mode { get; set; } = GameMode.Local;
        public Difficulty Difficulty { get; set; } = Difficulty.Medium;
    }
}
