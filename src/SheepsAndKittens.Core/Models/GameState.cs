using System.Collections.Generic;
using System.Linq;

namespace SheepsAndKittens.Core.Models
{
    public class GameState
    {
        public Piece[,] Board { get; }
        public Turn Turn { get; set; }
        public Phase Phase { get; set; }
        public int SheepPlaced { get; set; }
        public int SheepCaptured { get; set; }
        public Position? SelectedPiece { get; set; }
        public Turn? Winner { get; set; }
        public Turn? ForfeitedBy { get; set; }
        public List<Position> ValidMoves { get; set; } = new List<Position>();
        public GameMove? LastMove { get; set; }

        public GameState()
        {
            Board = new Piece[GameEngine.BoardSize, GameEngine.BoardSize];
        }

        public GameState(Piece[,] board)
        {
            Board = board;
        }

        public GameState Clone()
        {
            var newBoard = new Piece[GameEngine.BoardSize, GameEngine.BoardSize];
            for (int r = 0; r < GameEngine.BoardSize; r++)
                for (int c = 0; c < GameEngine.BoardSize; c++)
                    newBoard[r, c] = Board[r, c];

            return new GameState(newBoard)
            {
                Turn = Turn,
                Phase = Phase,
                SheepPlaced = SheepPlaced,
                SheepCaptured = SheepCaptured,
                SelectedPiece = SelectedPiece,
                Winner = Winner,
                ForfeitedBy = ForfeitedBy,
                ValidMoves = new List<Position>(ValidMoves),
                LastMove = LastMove
            };
        }
    }
}
