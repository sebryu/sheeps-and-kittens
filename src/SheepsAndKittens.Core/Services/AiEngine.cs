using System;
using System.Collections.Generic;
using SheepsAndKittens.Core.Models;

namespace SheepsAndKittens.Core.Services
{
    public static class AiEngine
    {
        private const int BoardSize = GameEngine.BoardSize;

        private static readonly Dictionary<Difficulty, int> DepthMap = new Dictionary<Difficulty, int>
        {
            { Difficulty.Easy, 2 },
            { Difficulty.Medium, 4 },
            { Difficulty.Hard, 6 }
        };

        private static readonly Dictionary<Difficulty, double> RandomMoveChance = new Dictionary<Difficulty, double>
        {
            { Difficulty.Easy, 0.3 },
            { Difficulty.Medium, 0 },
            { Difficulty.Hard, 0 }
        };

        public static List<GameMove> GetAllMoves(GameState state)
        {
            var moves = new List<GameMove>();

            if (state.Turn == Turn.Sheep && state.Phase == Phase.Placement)
            {
                for (int r = 0; r < BoardSize; r++)
                    for (int c = 0; c < BoardSize; c++)
                        if (state.Board[r, c] == Piece.Empty)
                            moves.Add(new GameMove(MoveType.Place, new Position(r, c)));
                return moves;
            }

            Piece piece = state.Turn == Turn.Sheep ? Piece.Sheep : Piece.Kitty;

            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    if (state.Board[r, c] != piece) continue;

                    var neighbors = GameEngine.GetNeighbors(r, c);
                    foreach (var n in neighbors)
                    {
                        if (state.Board[n.Row, n.Col] == Piece.Empty)
                            moves.Add(new GameMove(MoveType.Move, new Position(n.Row, n.Col),
                                new Position(r, c)));
                    }

                    if (piece == Piece.Kitty)
                    {
                        var captures = GameEngine.GetCaptureTargets(state.Board, r, c);
                        foreach (var cap in captures)
                            moves.Add(new GameMove(MoveType.Capture, cap.To,
                                new Position(r, c), cap.Captured));
                    }
                }
            }

            return moves;
        }

        private static void OrderMoves(List<GameMove> moves)
        {
            moves.Sort((a, b) =>
            {
                if (a.Type == MoveType.Capture && b.Type != MoveType.Capture) return -1;
                if (a.Type != MoveType.Capture && b.Type == MoveType.Capture) return 1;
                int CenterDist(Position pos) => Math.Abs(pos.Row - 2) + Math.Abs(pos.Col - 2);
                return CenterDist(a.To) - CenterDist(b.To);
            });
        }

        private static double Evaluate(GameState state)
        {
            if (state.Winner == Turn.Kitty) return 10000;
            if (state.Winner == Turn.Sheep) return -10000;

            double score = 0;

            score += state.SheepCaptured * 100;

            int kittyMobility = 0;
            int captureThreats = 0;
            int trappedKittens = 0;

            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    if (state.Board[r, c] == Piece.Kitty)
                    {
                        var moves = GameEngine.GetValidMovesForPiece(state.Board, r, c, Piece.Kitty);
                        var captures = GameEngine.GetCaptureTargets(state.Board, r, c);
                        kittyMobility += moves.Count;
                        captureThreats += captures.Count;

                        if (moves.Count <= 1)
                            trappedKittens++;

                        int centerDist = Math.Abs(r - 2) + Math.Abs(c - 2);
                        score += (4 - centerDist) * 3;
                    }
                }
            }

            score += kittyMobility * 10;
            score += captureThreats * 30;
            score -= trappedKittens * 25;

            if (state.Phase == Phase.Placement)
                score -= state.SheepPlaced * 2;

            if (state.Phase == Phase.Movement)
            {
                for (int r = 0; r < BoardSize; r++)
                {
                    for (int c = 0; c < BoardSize; c++)
                    {
                        if (state.Board[r, c] == Piece.Kitty)
                        {
                            var neighbors = GameEngine.GetNeighbors(r, c);
                            int sheepAround = 0;
                            foreach (var n in neighbors)
                                if (state.Board[n.Row, n.Col] == Piece.Sheep)
                                    sheepAround++;
                            score -= sheepAround * 5;
                        }
                    }
                }
            }

            return score;
        }

        private static double Minimax(GameState state, int depth, double alpha, double beta, bool isMaximizing)
        {
            if (depth == 0 || state.Winner.HasValue)
                return Evaluate(state);

            var moves = GetAllMoves(state);
            OrderMoves(moves);

            if (moves.Count == 0)
                return Evaluate(state);

            if (isMaximizing)
            {
                double maxEval = double.NegativeInfinity;
                foreach (var move in moves)
                {
                    var newState = GameEngine.ApplyMove(state, move);
                    bool nextIsMax = newState.Turn == Turn.Kitty;
                    double val = Minimax(newState, depth - 1, alpha, beta, nextIsMax);
                    maxEval = Math.Max(maxEval, val);
                    alpha = Math.Max(alpha, val);
                    if (beta <= alpha) break;
                }
                return maxEval;
            }
            else
            {
                double minEval = double.PositiveInfinity;
                foreach (var move in moves)
                {
                    var newState = GameEngine.ApplyMove(state, move);
                    bool nextIsMax = newState.Turn == Turn.Kitty;
                    double val = Minimax(newState, depth - 1, alpha, beta, nextIsMax);
                    minEval = Math.Min(minEval, val);
                    beta = Math.Min(beta, val);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        }

        public static GameMove? FindBestMove(GameState state, Difficulty difficulty)
        {
            var moves = GetAllMoves(state);
            if (moves.Count == 0) return null;

            double randomChance = RandomMoveChance[difficulty];
            var random = new Random();
            if (randomChance > 0 && random.NextDouble() < randomChance)
                return moves[random.Next(moves.Count)];

            int depth = DepthMap[difficulty];
            bool isMaximizing = state.Turn == Turn.Kitty;

            GameMove bestMove = moves[0];
            double bestVal = isMaximizing ? double.NegativeInfinity : double.PositiveInfinity;

            OrderMoves(moves);

            foreach (var move in moves)
            {
                var newState = GameEngine.ApplyMove(state, move);
                bool nextIsMax = newState.Turn == Turn.Kitty;
                double val = Minimax(newState, depth - 1, double.NegativeInfinity, double.PositiveInfinity, nextIsMax);

                if (isMaximizing)
                {
                    if (val > bestVal)
                    {
                        bestVal = val;
                        bestMove = move;
                    }
                }
                else
                {
                    if (val < bestVal)
                    {
                        bestVal = val;
                        bestMove = move;
                    }
                }
            }

            return bestMove;
        }
    }
}
