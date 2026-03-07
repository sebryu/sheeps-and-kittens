namespace SheepsAndKittens.Core.Models
{
    public enum Piece
    {
        Empty,
        Kitty,
        Sheep
    }

    public enum Turn
    {
        Sheep,
        Kitty
    }

    public enum Phase
    {
        Placement,
        Movement
    }

    public enum GameMode
    {
        Local,
        AiSheep,
        AiKitty
    }

    public enum Difficulty
    {
        Easy,
        Medium,
        Hard
    }

    public enum MoveType
    {
        Place,
        Move,
        Capture
    }
}
