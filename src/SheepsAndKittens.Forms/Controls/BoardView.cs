using System;
using System.Collections.Generic;
using System.Windows.Input;
using SheepsAndKittens.Core.Models;
using Xamarin.Forms;

namespace SheepsAndKittens.Forms.Controls
{
    public class BoardView : ContentView
    {
        private const int BoardSize = 5;
        private const double BoardPadding = 20;

        private readonly AbsoluteLayout _layout;
        private readonly BoxView[,] _cellDots = new BoxView[BoardSize, BoardSize];
        private readonly Frame[,] _pieces = new Frame[BoardSize, BoardSize];
        private readonly BoxView[,] _validMoveIndicators = new BoxView[BoardSize, BoardSize];
        private double _cellSize;

        public static readonly BindableProperty BoardStateProperty =
            BindableProperty.Create(nameof(BoardState), typeof(Piece[,]), typeof(BoardView),
                null, propertyChanged: OnBoardStateChanged);

        public static readonly BindableProperty ValidMovesProperty =
            BindableProperty.Create(nameof(ValidMoves), typeof(List<Position>), typeof(BoardView),
                null, propertyChanged: OnValidMovesChanged);

        public static readonly BindableProperty SelectedPieceProperty =
            BindableProperty.Create(nameof(SelectedPiece), typeof(Position?), typeof(BoardView),
                null, propertyChanged: OnSelectedPieceChanged);

        public static readonly BindableProperty TapCommandProperty =
            BindableProperty.Create(nameof(TapCommand), typeof(ICommand), typeof(BoardView));

        public Piece[,]? BoardState
        {
            get => (Piece[,]?)GetValue(BoardStateProperty);
            set => SetValue(BoardStateProperty, value);
        }

        public List<Position>? ValidMoves
        {
            get => (List<Position>?)GetValue(ValidMovesProperty);
            set => SetValue(ValidMovesProperty, value);
        }

        public Position? SelectedPiece
        {
            get => (Position?)GetValue(SelectedPieceProperty);
            set => SetValue(SelectedPieceProperty, value);
        }

        public ICommand? TapCommand
        {
            get => (ICommand?)GetValue(TapCommandProperty);
            set => SetValue(TapCommandProperty, value);
        }

        public BoardView()
        {
            _layout = new AbsoluteLayout();

            // Board background
            var background = new Frame
            {
                BackgroundColor = Color.FromHex("#D2B48C"),
                BorderColor = Color.FromHex("#8B4513"),
                CornerRadius = 8,
                HasShadow = true,
                Padding = 0
            };

            Content = background;
            background.Content = _layout;

            SizeChanged += OnSizeChanged;
        }

        private void OnSizeChanged(object sender, EventArgs e)
        {
            if (Width <= 0 || Height <= 0) return;

            double boardWidth = Math.Min(Width, Height) - 2 * BoardPadding;
            _cellSize = boardWidth / (BoardSize - 1);

            _layout.Children.Clear();
            DrawGrid();
            DrawIntersections();
            UpdatePieces();
            UpdateValidMoveIndicators();
        }

        private void DrawGrid()
        {
            var lineColor = Color.FromHex("#6B3A0A");
            double lineThickness = 2;

            // Horizontal lines
            for (int r = 0; r < BoardSize; r++)
            {
                var line = new BoxView
                {
                    BackgroundColor = lineColor,
                    HeightRequest = lineThickness
                };
                double y = BoardPadding + r * _cellSize;
                AbsoluteLayout.SetLayoutBounds(line, new Rectangle(BoardPadding, y - lineThickness / 2,
                    (BoardSize - 1) * _cellSize, lineThickness));
                _layout.Children.Add(line);
            }

            // Vertical lines
            for (int c = 0; c < BoardSize; c++)
            {
                var line = new BoxView
                {
                    BackgroundColor = lineColor,
                    WidthRequest = lineThickness
                };
                double x = BoardPadding + c * _cellSize;
                AbsoluteLayout.SetLayoutBounds(line, new Rectangle(x - lineThickness / 2, BoardPadding,
                    lineThickness, (BoardSize - 1) * _cellSize));
                _layout.Children.Add(line);
            }

            // Diagonal lines (only where (r+c) is even)
            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    if ((r + c) % 2 != 0) continue;

                    double x1 = BoardPadding + c * _cellSize;
                    double y1 = BoardPadding + r * _cellSize;

                    // Draw diagonal to bottom-right
                    if (r + 1 < BoardSize && c + 1 < BoardSize)
                    {
                        DrawDiagonalLine(x1, y1, x1 + _cellSize, y1 + _cellSize, lineColor);
                    }
                    // Draw diagonal to bottom-left
                    if (r + 1 < BoardSize && c - 1 >= 0 && (r + c) % 2 == 0)
                    {
                        DrawDiagonalLine(x1, y1, x1 - _cellSize, y1 + _cellSize, lineColor);
                    }
                }
            }
        }

        private void DrawDiagonalLine(double x1, double y1, double x2, double y2, Color color)
        {
            // Use a thin BoxView rotated for diagonals
            double dx = x2 - x1;
            double dy = y2 - y1;
            double length = Math.Sqrt(dx * dx + dy * dy);
            double angle = Math.Atan2(dy, dx) * 180 / Math.PI;

            var line = new BoxView
            {
                BackgroundColor = color,
                HeightRequest = 1.5,
                WidthRequest = length,
                AnchorX = 0,
                AnchorY = 0.5,
                Rotation = angle
            };

            AbsoluteLayout.SetLayoutBounds(line, new Rectangle(x1, y1 - 0.75, length, 1.5));
            _layout.Children.Add(line);
        }

        private void DrawIntersections()
        {
            double dotSize = 8;
            double pieceSize = _cellSize * 0.7;

            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    double x = BoardPadding + c * _cellSize;
                    double y = BoardPadding + r * _cellSize;

                    // Intersection dot
                    var dot = new BoxView
                    {
                        BackgroundColor = Color.FromHex("#6B3A0A"),
                        CornerRadius = dotSize / 2,
                        WidthRequest = dotSize,
                        HeightRequest = dotSize
                    };
                    AbsoluteLayout.SetLayoutBounds(dot, new Rectangle(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize));
                    _layout.Children.Add(dot);
                    _cellDots[r, c] = dot;

                    // Valid move indicator (hidden by default)
                    var validIndicator = new BoxView
                    {
                        BackgroundColor = Color.FromHex("#66BB6A"),
                        CornerRadius = 10,
                        WidthRequest = 20,
                        HeightRequest = 20,
                        Opacity = 0,
                        IsVisible = false
                    };
                    AbsoluteLayout.SetLayoutBounds(validIndicator, new Rectangle(x - 10, y - 10, 20, 20));
                    _layout.Children.Add(validIndicator);
                    _validMoveIndicators[r, c] = validIndicator;

                    // Piece placeholder (hidden by default)
                    var piece = new Frame
                    {
                        CornerRadius = (float)(pieceSize / 2),
                        WidthRequest = pieceSize,
                        HeightRequest = pieceSize,
                        Padding = 0,
                        HasShadow = true,
                        IsVisible = false,
                        BackgroundColor = Color.Transparent
                    };

                    var label = new Label
                    {
                        FontSize = pieceSize * 0.6,
                        HorizontalTextAlignment = TextAlignment.Center,
                        VerticalTextAlignment = TextAlignment.Center
                    };
                    piece.Content = label;

                    AbsoluteLayout.SetLayoutBounds(piece,
                        new Rectangle(x - pieceSize / 2, y - pieceSize / 2, pieceSize, pieceSize));
                    _layout.Children.Add(piece);
                    _pieces[r, c] = piece;

                    // Tap gesture
                    int row = r, col = c;
                    var tapGesture = new TapGestureRecognizer();
                    tapGesture.Tapped += (s, e) =>
                    {
                        TapCommand?.Execute(new Position(row, col));
                    };

                    // Create a transparent tap target over each intersection
                    var tapTarget = new BoxView
                    {
                        BackgroundColor = Color.Transparent,
                        WidthRequest = _cellSize,
                        HeightRequest = _cellSize
                    };
                    tapTarget.GestureRecognizers.Add(tapGesture);
                    AbsoluteLayout.SetLayoutBounds(tapTarget,
                        new Rectangle(x - _cellSize / 2, y - _cellSize / 2, _cellSize, _cellSize));
                    _layout.Children.Add(tapTarget);
                }
            }
        }

        private void UpdatePieces()
        {
            var board = BoardState;
            if (board == null) return;

            var selected = SelectedPiece;

            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    var piece = _pieces[r, c];
                    var label = piece.Content as Label;
                    if (label == null) continue;

                    switch (board[r, c])
                    {
                        case Piece.Kitty:
                            piece.IsVisible = true;
                            piece.BackgroundColor = Color.FromHex("#FF8C00");
                            label.Text = "\U0001F431"; // cat emoji
                            break;
                        case Piece.Sheep:
                            piece.IsVisible = true;
                            piece.BackgroundColor = Color.White;
                            label.Text = "\U0001F411"; // sheep emoji
                            break;
                        default:
                            piece.IsVisible = false;
                            break;
                    }

                    // Selected piece highlight
                    if (selected.HasValue && selected.Value.Row == r && selected.Value.Col == c)
                    {
                        piece.BorderColor = Color.FromHex("#4CAF50");
                        piece.Scale = 1.12;
                    }
                    else
                    {
                        piece.BorderColor = Color.Transparent;
                        piece.Scale = 1.0;
                    }
                }
            }
        }

        private void UpdateValidMoveIndicators()
        {
            // Hide all first
            for (int r = 0; r < BoardSize; r++)
                for (int c = 0; c < BoardSize; c++)
                {
                    _validMoveIndicators[r, c].IsVisible = false;
                    _validMoveIndicators[r, c].Opacity = 0;
                }

            var moves = ValidMoves;
            if (moves == null) return;

            foreach (var move in moves)
            {
                if (move.Row >= 0 && move.Row < BoardSize && move.Col >= 0 && move.Col < BoardSize)
                {
                    _validMoveIndicators[move.Row, move.Col].IsVisible = true;
                    _validMoveIndicators[move.Row, move.Col].Opacity = 0.7;
                }
            }
        }

        private static void OnBoardStateChanged(BindableObject bindable, object oldValue, object newValue)
        {
            ((BoardView)bindable).UpdatePieces();
        }

        private static void OnValidMovesChanged(BindableObject bindable, object oldValue, object newValue)
        {
            ((BoardView)bindable).UpdateValidMoveIndicators();
        }

        private static void OnSelectedPieceChanged(BindableObject bindable, object oldValue, object newValue)
        {
            ((BoardView)bindable).UpdatePieces();
        }
    }
}
