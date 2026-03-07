using System;

namespace SheepsAndKittens.Core.Models
{
    public readonly struct Position : IEquatable<Position>
    {
        public int Row { get; }
        public int Col { get; }

        public Position(int row, int col)
        {
            Row = row;
            Col = col;
        }

        public bool Equals(Position other) => Row == other.Row && Col == other.Col;
        public override bool Equals(object? obj) => obj is Position p && Equals(p);
        public override int GetHashCode() => HashCode.Combine(Row, Col);
        public static bool operator ==(Position a, Position b) => a.Equals(b);
        public static bool operator !=(Position a, Position b) => !a.Equals(b);
        public override string ToString() => $"({Row}, {Col})";
    }
}
