namespace SheepsAndKittens.Core.Models
{
    public class GameMove
    {
        public MoveType Type { get; }
        public Position? From { get; }
        public Position To { get; }
        public Position? Captured { get; }

        public GameMove(MoveType type, Position to, Position? from = null, Position? captured = null)
        {
            Type = type;
            To = to;
            From = from;
            Captured = captured;
        }
    }
}
