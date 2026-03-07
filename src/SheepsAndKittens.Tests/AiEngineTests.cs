using System.Linq;
using NUnit.Framework;
using SheepsAndKittens.Core.Models;
using SheepsAndKittens.Core.Services;

namespace SheepsAndKittens.Tests
{
    [TestFixture]
    public class AiEngineTests
    {
        #region GetAllMoves

        [Test]
        public void GetAllMoves_InitialState_ReturnsPlacementMoves()
        {
            var state = GameEngine.CreateInitialState();
            var moves = AiEngine.GetAllMoves(state);

            // 5x5 = 25, minus 4 kittens = 21 empty cells
            Assert.That(moves.Count, Is.EqualTo(21));
            Assert.That(moves.All(m => m.Type == MoveType.Place), Is.True);
        }

        [Test]
        public void GetAllMoves_KittyTurn_ReturnsMoves()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;

            var moves = AiEngine.GetAllMoves(state);
            Assert.That(moves.Count, Is.GreaterThan(0));
            Assert.That(moves.All(m => m.Type == MoveType.Move || m.Type == MoveType.Capture), Is.True);
        }

        [Test]
        public void GetAllMoves_KittyWithCapture_IncludesCaptureMoves()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            state.Board[1, 1] = Piece.Sheep;

            var moves = AiEngine.GetAllMoves(state);
            Assert.That(moves.Any(m => m.Type == MoveType.Capture), Is.True);
        }

        #endregion

        #region FindBestMove

        [Test]
        public void FindBestMove_ReturnsValidMove()
        {
            var state = GameEngine.CreateInitialState();
            var move = AiEngine.FindBestMove(state, Difficulty.Easy);

            Assert.That(move, Is.Not.Null);
            Assert.That(move!.Type, Is.EqualTo(MoveType.Place));
        }

        [Test]
        public void FindBestMove_KittyPrefersCaptureWhenAvailable()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            state.Board[1, 1] = Piece.Sheep;

            var move = AiEngine.FindBestMove(state, Difficulty.Hard);
            // At hard difficulty, should strongly prefer the capture move
            Assert.That(move, Is.Not.Null);
        }

        [Test]
        public void FindBestMove_NoMoves_ReturnsNull()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            // Block all kittens
            state.Board[0, 1] = Piece.Sheep;
            state.Board[1, 0] = Piece.Sheep;
            state.Board[1, 1] = Piece.Sheep;
            state.Board[0, 3] = Piece.Sheep;
            state.Board[1, 4] = Piece.Sheep;
            state.Board[1, 3] = Piece.Sheep;
            state.Board[3, 0] = Piece.Sheep;
            state.Board[4, 1] = Piece.Sheep;
            state.Board[3, 1] = Piece.Sheep;
            state.Board[3, 4] = Piece.Sheep;
            state.Board[4, 3] = Piece.Sheep;
            state.Board[3, 3] = Piece.Sheep;

            var move = AiEngine.FindBestMove(state, Difficulty.Medium);
            Assert.That(move, Is.Null);
        }

        #endregion
    }
}
