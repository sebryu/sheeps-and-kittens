using System.Linq;
using NUnit.Framework;
using SheepsAndKittens.Core.Models;

namespace SheepsAndKittens.Tests
{
    [TestFixture]
    public class GameEngineTests
    {
        #region GetNeighbors

        [Test]
        public void GetNeighbors_Corner00_Returns3Neighbors()
        {
            // (0+0) is even so has diagonals: right, down, down-right
            var neighbors = GameEngine.GetNeighbors(0, 0);
            Assert.That(neighbors.Count, Is.EqualTo(3));
            Assert.That(neighbors, Does.Contain(new Position(0, 1)));
            Assert.That(neighbors, Does.Contain(new Position(1, 0)));
            Assert.That(neighbors, Does.Contain(new Position(1, 1)));
        }

        [Test]
        public void GetNeighbors_Corner04_Returns3Neighbors()
        {
            var neighbors = GameEngine.GetNeighbors(0, 4);
            Assert.That(neighbors.Count, Is.EqualTo(3));
            Assert.That(neighbors, Does.Contain(new Position(0, 3)));
            Assert.That(neighbors, Does.Contain(new Position(1, 4)));
            Assert.That(neighbors, Does.Contain(new Position(1, 3)));
        }

        [Test]
        public void GetNeighbors_Center22_Returns8Neighbors()
        {
            // (2+2) is even, center has all 8 neighbors
            var neighbors = GameEngine.GetNeighbors(2, 2);
            Assert.That(neighbors.Count, Is.EqualTo(8));
        }

        [Test]
        public void GetNeighbors_Position01_NoDiagonals()
        {
            // (0+1) is odd so only orthogonal
            var neighbors = GameEngine.GetNeighbors(0, 1);
            Assert.That(neighbors.Count, Is.EqualTo(3)); // left, right, down
            Assert.That(neighbors, Does.Not.Contain(new Position(1, 0)));
            Assert.That(neighbors, Does.Not.Contain(new Position(1, 2)));
        }

        [Test]
        public void GetNeighbors_Edge20_Returns5Neighbors()
        {
            // (2+0) is even, left edge
            var neighbors = GameEngine.GetNeighbors(2, 0);
            Assert.That(neighbors.Count, Is.EqualTo(5));
        }

        #endregion

        #region GetCaptureTargets

        [Test]
        public void GetCaptureTargets_OrthogonalCapture()
        {
            var state = GameEngine.CreateInitialState();
            // Place sheep at (0,1) - kitty at (0,0) can capture
            state.Board[0, 1] = Piece.Sheep;
            // (0,2) must be empty for capture

            var targets = GameEngine.GetCaptureTargets(state.Board, 0, 0);
            Assert.That(targets.Any(t => t.To == new Position(0, 2) && t.Captured == new Position(0, 1)));
        }

        [Test]
        public void GetCaptureTargets_DiagonalCapture()
        {
            var state = GameEngine.CreateInitialState();
            // (0,0) is even, can diagonal capture
            state.Board[1, 1] = Piece.Sheep;
            // (2,2) must be empty

            var targets = GameEngine.GetCaptureTargets(state.Board, 0, 0);
            Assert.That(targets.Any(t => t.To == new Position(2, 2) && t.Captured == new Position(1, 1)));
        }

        [Test]
        public void GetCaptureTargets_BlockedDestination_NoCapture()
        {
            var state = GameEngine.CreateInitialState();
            state.Board[0, 1] = Piece.Sheep;
            state.Board[0, 2] = Piece.Sheep; // blocking destination

            var targets = GameEngine.GetCaptureTargets(state.Board, 0, 0);
            Assert.That(targets.All(t => t.To != new Position(0, 2)));
        }

        [Test]
        public void GetCaptureTargets_NonKitty_ReturnsEmpty()
        {
            var state = GameEngine.CreateInitialState();
            state.Board[2, 2] = Piece.Sheep;

            var targets = GameEngine.GetCaptureTargets(state.Board, 2, 2);
            Assert.That(targets, Is.Empty);
        }

        #endregion

        #region CreateInitialState

        [Test]
        public void CreateInitialState_HasCorrectSetup()
        {
            var state = GameEngine.CreateInitialState();

            Assert.That(state.Board[0, 0], Is.EqualTo(Piece.Kitty));
            Assert.That(state.Board[0, 4], Is.EqualTo(Piece.Kitty));
            Assert.That(state.Board[4, 0], Is.EqualTo(Piece.Kitty));
            Assert.That(state.Board[4, 4], Is.EqualTo(Piece.Kitty));
            Assert.That(state.Turn, Is.EqualTo(Turn.Sheep));
            Assert.That(state.Phase, Is.EqualTo(Phase.Placement));
            Assert.That(state.SheepPlaced, Is.EqualTo(0));
            Assert.That(state.SheepCaptured, Is.EqualTo(0));
            Assert.That(state.Winner, Is.Null);
        }

        [Test]
        public void CreateInitialState_BoardIs5x5()
        {
            var state = GameEngine.CreateInitialState();
            Assert.That(state.Board.GetLength(0), Is.EqualTo(5));
            Assert.That(state.Board.GetLength(1), Is.EqualTo(5));
        }

        #endregion

        #region GetValidMovesForPiece

        [Test]
        public void GetValidMovesForPiece_Sheep_AdjacentOnly()
        {
            var state = GameEngine.CreateInitialState();
            state.Board[2, 2] = Piece.Sheep;

            var moves = GameEngine.GetValidMovesForPiece(state.Board, 2, 2, Piece.Sheep);
            // Center has 8 neighbors, corners are kittens but (2,2) is far from corners
            // All 8 neighbors should be empty
            Assert.That(moves.Count, Is.EqualTo(8));
        }

        [Test]
        public void GetValidMovesForPiece_Kitty_IncludesCaptures()
        {
            var state = GameEngine.CreateInitialState();
            state.Board[1, 1] = Piece.Sheep;

            var moves = GameEngine.GetValidMovesForPiece(state.Board, 0, 0, Piece.Kitty);
            // (0,0) kitty: neighbors (0,1), (1,0) are empty, (1,1) has sheep
            // Can capture to (2,2) via (1,1)
            Assert.That(moves, Does.Contain(new Position(2, 2)));
        }

        #endregion

        #region HandleTap - Placement

        [Test]
        public void HandleTap_PlaceSheepOnEmpty_PlacesSheep()
        {
            var state = GameEngine.CreateInitialState();
            var newState = GameEngine.HandleTap(state, 2, 2);

            Assert.That(newState.Board[2, 2], Is.EqualTo(Piece.Sheep));
            Assert.That(newState.SheepPlaced, Is.EqualTo(1));
            Assert.That(newState.Turn, Is.EqualTo(Turn.Kitty));
        }

        [Test]
        public void HandleTap_PlaceSheepOnOccupied_NoChange()
        {
            var state = GameEngine.CreateInitialState();
            // Try to place on kitty
            var newState = GameEngine.HandleTap(state, 0, 0);
            Assert.That(newState, Is.SameAs(state));
        }

        [Test]
        public void HandleTap_WithWinner_NoChange()
        {
            var state = GameEngine.CreateInitialState();
            state.Winner = Turn.Sheep;
            var newState = GameEngine.HandleTap(state, 2, 2);
            Assert.That(newState, Is.SameAs(state));
        }

        #endregion

        #region HandleTap - Kitty Movement

        [Test]
        public void HandleTap_SelectKitty_SetsSelected()
        {
            var state = GameEngine.CreateInitialState();
            // Place sheep first to move to kitty turn
            state.Turn = Turn.Kitty;

            var newState = GameEngine.HandleTap(state, 0, 0);
            Assert.That(newState.SelectedPiece, Is.EqualTo(new Position(0, 0)));
            Assert.That(newState.ValidMoves.Count, Is.GreaterThan(0));
        }

        [Test]
        public void HandleTap_DeselectKitty_ClearsSelection()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;

            // Select kitty
            var selected = GameEngine.HandleTap(state, 0, 0);
            // Tap same kitty to deselect
            var deselected = GameEngine.HandleTap(selected, 0, 0);
            Assert.That(deselected.SelectedPiece, Is.Null);
            Assert.That(deselected.ValidMoves, Is.Empty);
        }

        [Test]
        public void HandleTap_KittyCapture_RemovesSheep()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            state.Board[1, 1] = Piece.Sheep;
            // (0,0) kitty can capture sheep at (1,1) to land at (2,2)

            var selected = GameEngine.HandleTap(state, 0, 0);
            var captured = GameEngine.HandleTap(selected, 2, 2);

            Assert.That(captured.Board[2, 2], Is.EqualTo(Piece.Kitty));
            Assert.That(captured.Board[1, 1], Is.EqualTo(Piece.Empty));
            Assert.That(captured.Board[0, 0], Is.EqualTo(Piece.Empty));
            Assert.That(captured.SheepCaptured, Is.EqualTo(1));
        }

        #endregion

        #region HandleTap - Sheep Movement

        [Test]
        public void HandleTap_SheepMovement_SelectAndMove()
        {
            var state = GameEngine.CreateInitialState();
            state.Phase = Phase.Movement;
            state.SheepPlaced = 20;
            state.Board[2, 2] = Piece.Sheep;

            // Select sheep
            var selected = GameEngine.HandleTap(state, 2, 2);
            Assert.That(selected.SelectedPiece, Is.EqualTo(new Position(2, 2)));

            // Move sheep
            var moved = GameEngine.HandleTap(selected, 2, 3);
            Assert.That(moved.Board[2, 3], Is.EqualTo(Piece.Sheep));
            Assert.That(moved.Board[2, 2], Is.EqualTo(Piece.Empty));
            Assert.That(moved.Turn, Is.EqualTo(Turn.Kitty));
        }

        #endregion

        #region ApplyMove

        [Test]
        public void ApplyMove_PlaceSheep_Works()
        {
            var state = GameEngine.CreateInitialState();
            var move = new GameMove(MoveType.Place, new Position(2, 2));
            var newState = GameEngine.ApplyMove(state, move);

            Assert.That(newState.Board[2, 2], Is.EqualTo(Piece.Sheep));
            Assert.That(newState.SheepPlaced, Is.EqualTo(1));
            Assert.That(newState.Turn, Is.EqualTo(Turn.Kitty));
        }

        [Test]
        public void ApplyMove_MoveKitty_Works()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;

            var move = new GameMove(MoveType.Move, new Position(0, 1), new Position(0, 0));
            var newState = GameEngine.ApplyMove(state, move);

            Assert.That(newState.Board[0, 1], Is.EqualTo(Piece.Kitty));
            Assert.That(newState.Board[0, 0], Is.EqualTo(Piece.Empty));
            Assert.That(newState.Turn, Is.EqualTo(Turn.Sheep));
        }

        [Test]
        public void ApplyMove_CaptureMove_RemovesSheep()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            state.Board[1, 1] = Piece.Sheep;

            var move = new GameMove(MoveType.Capture, new Position(2, 2),
                new Position(0, 0), new Position(1, 1));
            var newState = GameEngine.ApplyMove(state, move);

            Assert.That(newState.Board[2, 2], Is.EqualTo(Piece.Kitty));
            Assert.That(newState.Board[0, 0], Is.EqualTo(Piece.Empty));
            Assert.That(newState.Board[1, 1], Is.EqualTo(Piece.Empty));
            Assert.That(newState.SheepCaptured, Is.EqualTo(1));
        }

        [Test]
        public void ApplyMove_FiveCapturesWins()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            state.SheepCaptured = 4;
            state.Board[1, 0] = Piece.Sheep;

            var move = new GameMove(MoveType.Capture, new Position(2, 0),
                new Position(0, 0), new Position(1, 0));
            var newState = GameEngine.ApplyMove(state, move);

            Assert.That(newState.Winner, Is.EqualTo(Turn.Kitty));
        }

        #endregion

        #region ForfeitGame

        [Test]
        public void ForfeitGame_SheepForfeits_KittensWin()
        {
            var state = GameEngine.CreateInitialState();
            var forfeited = GameEngine.ForfeitGame(state);

            Assert.That(forfeited.Winner, Is.EqualTo(Turn.Kitty));
            Assert.That(forfeited.ForfeitedBy, Is.EqualTo(Turn.Sheep));
        }

        [Test]
        public void ForfeitGame_KittyForfeits_SheepsWin()
        {
            var state = GameEngine.CreateInitialState();
            state.Turn = Turn.Kitty;
            var forfeited = GameEngine.ForfeitGame(state);

            Assert.That(forfeited.Winner, Is.EqualTo(Turn.Sheep));
            Assert.That(forfeited.ForfeitedBy, Is.EqualTo(Turn.Kitty));
        }

        [Test]
        public void ForfeitGame_AlreadyWon_NoChange()
        {
            var state = GameEngine.CreateInitialState();
            state.Winner = Turn.Sheep;
            var result = GameEngine.ForfeitGame(state);
            Assert.That(result, Is.SameAs(state));
        }

        #endregion

        #region GetGameStatusText

        [Test]
        public void GetGameStatusText_PlacementPhase()
        {
            var state = GameEngine.CreateInitialState();
            var text = GameEngine.GetGameStatusText(state);
            Assert.That(text, Does.Contain("Place a sheep"));
            Assert.That(text, Does.Contain("0/20"));
        }

        [Test]
        public void GetGameStatusText_SheepWins()
        {
            var state = GameEngine.CreateInitialState();
            state.Winner = Turn.Sheep;
            var text = GameEngine.GetGameStatusText(state);
            Assert.That(text, Does.Contain("Sheeps win"));
        }

        [Test]
        public void GetGameStatusText_KittyWins()
        {
            var state = GameEngine.CreateInitialState();
            state.Winner = Turn.Kitty;
            var text = GameEngine.GetGameStatusText(state);
            Assert.That(text, Does.Contain("Kittens win"));
        }

        [Test]
        public void GetGameStatusText_SheepForfeit()
        {
            var state = GameEngine.CreateInitialState();
            state.ForfeitedBy = Turn.Sheep;
            state.Winner = Turn.Kitty;
            var text = GameEngine.GetGameStatusText(state);
            Assert.That(text, Does.Contain("forfeited"));
        }

        #endregion

        #region Win Condition: Kittens Blocked

        [Test]
        public void HandleTap_AllKittensBlocked_SheepWins()
        {
            var state = GameEngine.CreateInitialState();
            // Surround kitty at (0,0) completely
            state.Board[0, 1] = Piece.Sheep;
            state.Board[1, 0] = Piece.Sheep;
            state.Board[1, 1] = Piece.Sheep;
            // Surround kitty at (0,4)
            state.Board[0, 3] = Piece.Sheep;
            state.Board[1, 4] = Piece.Sheep;
            state.Board[1, 3] = Piece.Sheep;
            // Surround kitty at (4,0)
            state.Board[3, 0] = Piece.Sheep;
            state.Board[4, 1] = Piece.Sheep;
            state.Board[3, 1] = Piece.Sheep;
            // Almost surround kitty at (4,4) - leave (4,3) to place
            state.Board[3, 4] = Piece.Sheep;
            state.Board[3, 3] = Piece.Sheep;

            state.SheepPlaced = 11;

            // Place final blocking sheep at (4,3)
            var newState = GameEngine.HandleTap(state, 4, 3);
            Assert.That(newState.Winner, Is.EqualTo(Turn.Sheep));
        }

        #endregion

        #region State Immutability

        [Test]
        public void HandleTap_DoesNotMutateOriginalState()
        {
            var state = GameEngine.CreateInitialState();
            var originalBoard00 = state.Board[0, 0];

            GameEngine.HandleTap(state, 2, 2);

            Assert.That(state.Board[0, 0], Is.EqualTo(originalBoard00));
            Assert.That(state.Board[2, 2], Is.EqualTo(Piece.Empty));
            Assert.That(state.SheepPlaced, Is.EqualTo(0));
        }

        #endregion
    }
}
