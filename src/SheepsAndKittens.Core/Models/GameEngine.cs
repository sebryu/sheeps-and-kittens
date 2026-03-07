using System.Collections.Generic;

namespace SheepsAndKittens.Core.Models
{
    public static class GameEngine
    {
        public const int BoardSize = 5;
        public const int TotalSheep = 20;
        public const int SheepToWin = 5;

        private static bool IsInBounds(int r, int c) =>
            r >= 0 && r < BoardSize && c >= 0 && c < BoardSize;

        public static bool HasDiagonals(int r, int c) =>
            (r + c) % 2 == 0;

        public static List<Position> GetNeighbors(int r, int c)
        {
            var neighbors = new List<Position>();

            // Orthogonal
            int[][] orthoDirs = { new[] { -1, 0 }, new[] { 1, 0 }, new[] { 0, -1 }, new[] { 0, 1 } };
            foreach (var dir in orthoDirs)
            {
                int nr = r + dir[0], nc = c + dir[1];
                if (IsInBounds(nr, nc))
                    neighbors.Add(new Position(nr, nc));
            }

            // Diagonals (only if (r+c) is even)
            if (HasDiagonals(r, c))
            {
                int[][] diagDirs = { new[] { -1, -1 }, new[] { -1, 1 }, new[] { 1, -1 }, new[] { 1, 1 } };
                foreach (var dir in diagDirs)
                {
                    int nr = r + dir[0], nc = c + dir[1];
                    if (IsInBounds(nr, nc))
                        neighbors.Add(new Position(nr, nc));
                }
            }

            return neighbors;
        }

        public static List<CaptureTarget> GetCaptureTargets(Piece[,] board, int r, int c)
        {
            var targets = new List<CaptureTarget>();
            if (board[r, c] != Piece.Kitty) return targets;

            var allDirs = new List<int[]>
            {
                new[] { -1, 0 }, new[] { 1, 0 }, new[] { 0, -1 }, new[] { 0, 1 }
            };

            if (HasDiagonals(r, c))
            {
                allDirs.Add(new[] { -1, -1 });
                allDirs.Add(new[] { -1, 1 });
                allDirs.Add(new[] { 1, -1 });
                allDirs.Add(new[] { 1, 1 });
            }

            foreach (var dir in allDirs)
            {
                int dr = dir[0], dc = dir[1];
                int midR = r + dr, midC = c + dc;
                int destR = r + 2 * dr, destC = c + 2 * dc;

                if (IsInBounds(midR, midC) && IsInBounds(destR, destC) &&
                    board[midR, midC] == Piece.Sheep && board[destR, destC] == Piece.Empty)
                {
                    bool isDiagJump = dr != 0 && dc != 0;
                    if (!isDiagJump || HasDiagonals(midR, midC))
                    {
                        targets.Add(new CaptureTarget(
                            new Position(destR, destC),
                            new Position(midR, midC)));
                    }
                }
            }

            return targets;
        }

        public static GameState CreateInitialState()
        {
            var state = new GameState
            {
                Turn = Turn.Sheep,
                Phase = Phase.Placement,
                SheepPlaced = 0,
                SheepCaptured = 0,
                SelectedPiece = null,
                Winner = null,
                ForfeitedBy = null,
                LastMove = null
            };

            // Place 4 kittens at corners
            state.Board[0, 0] = Piece.Kitty;
            state.Board[0, 4] = Piece.Kitty;
            state.Board[4, 0] = Piece.Kitty;
            state.Board[4, 4] = Piece.Kitty;

            return state;
        }

        public static List<Position> GetValidMovesForPiece(Piece[,] board, int r, int c, Piece piece)
        {
            var moves = new List<Position>();
            var neighbors = GetNeighbors(r, c);
            foreach (var n in neighbors)
            {
                if (board[n.Row, n.Col] == Piece.Empty)
                    moves.Add(n);
            }

            if (piece == Piece.Kitty)
            {
                var captures = GetCaptureTargets(board, r, c);
                foreach (var cap in captures)
                    moves.Add(cap.To);
            }

            return moves;
        }

        private static bool CheckKittensBlocked(Piece[,] board)
        {
            for (int r = 0; r < BoardSize; r++)
                for (int c = 0; c < BoardSize; c++)
                    if (board[r, c] == Piece.Kitty)
                    {
                        var moves = GetValidMovesForPiece(board, r, c, Piece.Kitty);
                        if (moves.Count > 0) return false;
                    }
            return true;
        }

        private static bool CheckSheepHaveMoves(Piece[,] board)
        {
            for (int r = 0; r < BoardSize; r++)
                for (int c = 0; c < BoardSize; c++)
                    if (board[r, c] == Piece.Sheep)
                    {
                        var neighbors = GetNeighbors(r, c);
                        foreach (var n in neighbors)
                            if (board[n.Row, n.Col] == Piece.Empty) return true;
                    }
            return false;
        }

        public static GameState HandleTap(GameState state, int row, int col)
        {
            if (state.Winner.HasValue) return state;

            var newState = state.Clone();

            // SHEEP's turn
            if (state.Turn == Turn.Sheep)
            {
                if (state.Phase == Phase.Placement)
                {
                    if (newState.Board[row, col] != Piece.Empty) return state;
                    newState.Board[row, col] = Piece.Sheep;
                    newState.SheepPlaced = state.SheepPlaced + 1;
                    newState.Phase = newState.SheepPlaced >= TotalSheep ? Phase.Movement : Phase.Placement;
                    newState.Turn = Turn.Kitty;
                    newState.SelectedPiece = null;
                    newState.ValidMoves = new List<Position>();
                    newState.ForfeitedBy = null;
                    newState.LastMove = new GameMove(MoveType.Place, new Position(row, col));

                    if (CheckKittensBlocked(newState.Board))
                        newState.Winner = Turn.Sheep;

                    return newState;
                }
                else
                {
                    // MOVEMENT phase - select then move
                    if (!state.SelectedPiece.HasValue)
                    {
                        if (newState.Board[row, col] != Piece.Sheep) return state;
                        var moves = GetValidMovesForPiece(newState.Board, row, col, Piece.Sheep);
                        if (moves.Count == 0) return state;
                        var sel = state.Clone();
                        sel.SelectedPiece = new Position(row, col);
                        sel.ValidMoves = moves;
                        return sel;
                    }
                    else
                    {
                        var sp = state.SelectedPiece.Value;
                        // Tap same piece to deselect
                        if (row == sp.Row && col == sp.Col)
                        {
                            var desel = state.Clone();
                            desel.SelectedPiece = null;
                            desel.ValidMoves = new List<Position>();
                            return desel;
                        }
                        // Tap another sheep to re-select
                        if (newState.Board[row, col] == Piece.Sheep)
                        {
                            var moves = GetValidMovesForPiece(newState.Board, row, col, Piece.Sheep);
                            if (moves.Count == 0) return state;
                            var resel = state.Clone();
                            resel.SelectedPiece = new Position(row, col);
                            resel.ValidMoves = moves;
                            return resel;
                        }
                        // Check if valid move
                        bool isValid = false;
                        foreach (var m in state.ValidMoves)
                            if (m.Row == row && m.Col == col) { isValid = true; break; }
                        if (!isValid) return state;

                        newState.Board[row, col] = Piece.Sheep;
                        newState.Board[sp.Row, sp.Col] = Piece.Empty;
                        newState.Turn = Turn.Kitty;
                        newState.SelectedPiece = null;
                        newState.ValidMoves = new List<Position>();
                        newState.ForfeitedBy = null;
                        newState.LastMove = new GameMove(MoveType.Move, new Position(row, col), new Position(sp.Row, sp.Col));

                        if (CheckKittensBlocked(newState.Board))
                            newState.Winner = Turn.Sheep;

                        return newState;
                    }
                }
            }

            // KITTY's turn
            if (state.Turn == Turn.Kitty)
            {
                if (!state.SelectedPiece.HasValue)
                {
                    if (newState.Board[row, col] != Piece.Kitty) return state;
                    var moves = GetValidMovesForPiece(newState.Board, row, col, Piece.Kitty);
                    if (moves.Count == 0) return state;
                    var sel = state.Clone();
                    sel.SelectedPiece = new Position(row, col);
                    sel.ValidMoves = moves;
                    return sel;
                }
                else
                {
                    var sp = state.SelectedPiece.Value;
                    // Tap same kitty to deselect
                    if (row == sp.Row && col == sp.Col)
                    {
                        var desel = state.Clone();
                        desel.SelectedPiece = null;
                        desel.ValidMoves = new List<Position>();
                        return desel;
                    }
                    // Tap another kitty to re-select
                    if (newState.Board[row, col] == Piece.Kitty)
                    {
                        var moves = GetValidMovesForPiece(newState.Board, row, col, Piece.Kitty);
                        if (moves.Count == 0) return state;
                        var resel = state.Clone();
                        resel.SelectedPiece = new Position(row, col);
                        resel.ValidMoves = moves;
                        return resel;
                    }
                    // Check if valid move
                    bool isValid = false;
                    foreach (var m in state.ValidMoves)
                        if (m.Row == row && m.Col == col) { isValid = true; break; }
                    if (!isValid) return state;

                    // Is it a capture?
                    var captures = GetCaptureTargets(state.Board, sp.Row, sp.Col);
                    CaptureTarget? capture = null;
                    foreach (var cap in captures)
                        if (cap.To.Row == row && cap.To.Col == col) { capture = cap; break; }

                    newState.Board[row, col] = Piece.Kitty;
                    newState.Board[sp.Row, sp.Col] = Piece.Empty;

                    int newCaptured = state.SheepCaptured;
                    GameMove move;

                    if (capture != null)
                    {
                        newState.Board[capture.Captured.Row, capture.Captured.Col] = Piece.Empty;
                        newCaptured++;
                        move = new GameMove(MoveType.Capture, new Position(row, col),
                            new Position(sp.Row, sp.Col), capture.Captured);
                    }
                    else
                    {
                        move = new GameMove(MoveType.Move, new Position(row, col),
                            new Position(sp.Row, sp.Col));
                    }

                    newState.SheepCaptured = newCaptured;
                    newState.Turn = Turn.Sheep;
                    newState.Phase = state.SheepPlaced >= TotalSheep ? Phase.Movement : Phase.Placement;
                    newState.SelectedPiece = null;
                    newState.ValidMoves = new List<Position>();
                    newState.ForfeitedBy = null;
                    newState.LastMove = move;

                    if (newCaptured >= SheepToWin)
                        newState.Winner = Turn.Kitty;
                    else if (CheckKittensBlocked(newState.Board))
                        newState.Winner = Turn.Sheep;
                    else if (newState.Phase == Phase.Movement && !CheckSheepHaveMoves(newState.Board))
                        newState.Winner = Turn.Kitty;

                    return newState;
                }
            }

            return state;
        }

        public static GameState ApplyMove(GameState state, GameMove move)
        {
            var newState = state.Clone();
            int newSheepPlaced = state.SheepPlaced;
            int newSheepCaptured = state.SheepCaptured;
            Phase newPhase = state.Phase;
            Turn nextTurn;

            if (move.Type == MoveType.Place)
            {
                newState.Board[move.To.Row, move.To.Col] = Piece.Sheep;
                newSheepPlaced++;
                newPhase = newSheepPlaced >= TotalSheep ? Phase.Movement : Phase.Placement;
                nextTurn = Turn.Kitty;
            }
            else if (move.Type == MoveType.Move)
            {
                var from = move.From!.Value;
                var piece = newState.Board[from.Row, from.Col];
                newState.Board[move.To.Row, move.To.Col] = piece;
                newState.Board[from.Row, from.Col] = Piece.Empty;
                nextTurn = state.Turn == Turn.Sheep ? Turn.Kitty : Turn.Sheep;
            }
            else // Capture
            {
                var from = move.From!.Value;
                newState.Board[move.To.Row, move.To.Col] = Piece.Kitty;
                newState.Board[from.Row, from.Col] = Piece.Empty;
                newState.Board[move.Captured!.Value.Row, move.Captured!.Value.Col] = Piece.Empty;
                newSheepCaptured++;
                nextTurn = Turn.Sheep;
            }

            newState.Turn = nextTurn;
            newState.Phase = newPhase;
            newState.SheepPlaced = newSheepPlaced;
            newState.SheepCaptured = newSheepCaptured;
            newState.SelectedPiece = null;
            newState.ValidMoves = new List<Position>();
            newState.ForfeitedBy = null;
            newState.LastMove = move;
            newState.Winner = null;

            if (newSheepCaptured >= SheepToWin)
                newState.Winner = Turn.Kitty;
            else if (CheckKittensBlocked(newState.Board))
                newState.Winner = Turn.Sheep;
            else if (newPhase == Phase.Movement && nextTurn == Turn.Sheep && !CheckSheepHaveMoves(newState.Board))
                newState.Winner = Turn.Kitty;

            return newState;
        }

        public static GameState ForfeitGame(GameState state)
        {
            if (state.Winner.HasValue) return state;
            var newState = state.Clone();
            var opponent = state.Turn == Turn.Sheep ? Turn.Kitty : Turn.Sheep;
            newState.Winner = opponent;
            newState.ForfeitedBy = state.Turn;
            newState.SelectedPiece = null;
            newState.ValidMoves = new List<Position>();
            return newState;
        }

        public static string GetGameStatusText(GameState state)
        {
            if (state.ForfeitedBy == Turn.Sheep) return "Sheeps forfeited! Kittens win!";
            if (state.ForfeitedBy == Turn.Kitty) return "Kittens forfeited! Sheeps win!";
            if (state.Winner == Turn.Sheep) return "Sheeps win! All kittens are blocked!";
            if (state.Winner == Turn.Kitty) return "Kittens win! Captured 5 sheeps!";

            if (state.Turn == Turn.Sheep)
            {
                if (state.Phase == Phase.Placement)
                    return $"Sheep's turn - Place a sheep ({state.SheepPlaced}/{TotalSheep})";
                if (state.SelectedPiece.HasValue) return "Sheep's turn - Tap where to move";
                return "Sheep's turn - Select a sheep to move";
            }

            if (state.SelectedPiece.HasValue) return "Kitty's turn - Tap where to move";
            return "Kitty's turn - Select a kitty";
        }
    }

    public class CaptureTarget
    {
        public Position To { get; }
        public Position Captured { get; }

        public CaptureTarget(Position to, Position captured)
        {
            To = to;
            Captured = captured;
        }
    }
}
