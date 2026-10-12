import Pieces from "./pieces.js";

const PIECE_VALUES = {
    p: 100,
    c: 320,
    f: 330,
    t: 500,
    d: 900,
    r: 10000
};
const MATE_SCORE = 100000;

function copyRooks(rooks) {
    return {
        b: { ...rooks.b },
        n: { ...rooks.n }
    };
}

function copyPosition(position) {
    return position.map((row) => row.map((piece) => {
        if (!piece) return null;
        const copy = new Pieces(piece.color + piece.piece);
        copy.hasMoved = Boolean(piece.hasMoved);
        return copy;
    }));
}

function isSquareAttacked(position, row, col, byColor, boardDir) {
    const pawnDirection = (
        (byColor === "b" && boardDir) ||
        (byColor === "n" && !boardDir)
    ) ? -1 : 1;

    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = position[fromRow][fromCol];
            if (!piece || piece.color !== byColor) continue;

            const rowDiff = row - fromRow;
            const colDiff = col - fromCol;
            if (piece.piece === "p") {
                if (rowDiff === pawnDirection && Math.abs(colDiff) === 1) {
                    return true;
                }
                continue;
            }
            if (piece.piece === "c") {
                if (
                    (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                    (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
                ) return true;
                continue;
            }
            if (piece.piece === "r") {
                if (Math.max(Math.abs(rowDiff), Math.abs(colDiff)) === 1) {
                    return true;
                }
                continue;
            }

            const diagonal = Math.abs(rowDiff) === Math.abs(colDiff);
            const straight = rowDiff === 0 || colDiff === 0;
            if (
                (piece.piece === "f" && !diagonal) ||
                (piece.piece === "t" && !straight) ||
                (piece.piece === "d" && !diagonal && !straight) ||
                (rowDiff === 0 && colDiff === 0)
            ) continue;

            const rowStep = Math.sign(rowDiff);
            const colStep = Math.sign(colDiff);
            let checkRow = fromRow + rowStep;
            let checkCol = fromCol + colStep;
            let blocked = false;
            while (checkRow !== row || checkCol !== col) {
                if (position[checkRow][checkCol]) {
                    blocked = true;
                    break;
                }
                checkRow += rowStep;
                checkCol += colStep;
            }
            if (!blocked) return true;
        }
    }
    return false;
}

export function isInCheck(position, color, boardDir) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];
            if (
                piece?.color === color &&
                piece.piece === "r"
            ) {
                return isSquareAttacked(
                    position,
                    row,
                    col,
                    color === "b" ? "n" : "b",
                    boardDir
                );
            }
        }
    }
    return true;
}

function applyMove(state, move) {
    const position = copyPosition(state.position);
    const rooks = copyRooks(state.rooks);
    const piece = position[move.fromRow][move.fromCol];
    const captured = position[move.row][move.col];

    position[move.fromRow][move.fromCol] = null;
    if (move.type === "priseEnPassant") {
        position[move.fromRow][move.col] = null;
    }
    if (move.type === "roque") {
        const rookFrom = move.col > move.fromCol ? 7 : 0;
        const rookTo = move.col > move.fromCol ? move.col - 1 : move.col + 1;
        position[move.row][rookTo] = position[move.row][rookFrom];
        position[move.row][rookFrom] = null;
        rooks[piece.color].king = true;
        if (rookFrom === 0) rooks[piece.color].leftRook = true;
        else rooks[piece.color].rightRook = true;
    }

    piece.hasMoved = true;
    const movedPiece = (
        piece.piece === "p" &&
        (move.row === 0 || move.row === 7)
    ) ? new Pieces(piece.color + "d") : piece;
    movedPiece.hasMoved = true;
    position[move.row][move.col] = movedPiece;

    if (piece.piece === "r") rooks[piece.color].king = true;
    if (piece.piece === "t" && move.fromCol === 0) {
        rooks[piece.color].leftRook = true;
    }
    if (piece.piece === "t" && move.fromCol === 7) {
        rooks[piece.color].rightRook = true;
    }

    const lastMove = [
        move.fromRow,
        move.fromCol,
        move.row,
        move.col,
        movedPiece
    ];
    return {
        position,
        rooks,
        lastMove,
        captured
    };
}

export function getLegalMoves(position, color, boardDir, lastMove, rooks) {
    const legalMoves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];
            if (!piece || piece.color !== color) continue;

            const moves = piece.getAllMoves(
                position,
                boardDir,
                row,
                col,
                lastMove,
                rooks
            ) || [];
            for (const [toRow, toCol, type] of moves) {
                if (position[toRow][toCol]?.piece === "r") continue;
                const move = {
                    fromRow: row,
                    fromCol: col,
                    row: toRow,
                    col: toCol,
                    type
                };

                if (type === "roque") {
                    const step = toCol > col ? 1 : -1;
                    if (
                        isSquareAttacked(
                            position,
                            row,
                            col,
                            color === "b" ? "n" : "b",
                            boardDir
                        ) ||
                        isSquareAttacked(
                            position,
                            row,
                            col + step,
                            color === "b" ? "n" : "b",
                            boardDir
                        )
                    ) continue;
                }

                const nextState = applyMove(
                    { position, rooks, lastMove },
                    move
                );
                if (!isInCheck(nextState.position, color, boardDir)) {
                    legalMoves.push(move);
                }
            }
        }
    }
    return legalMoves;
}

function evaluate(position, perspective, boardDir) {
    let score = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];
            if (!piece) continue;
            const sign = piece.color === perspective ? 1 : -1;
            let value = PIECE_VALUES[piece.piece];
            if (piece.piece === "p") {
                const advancement = piece.color === "b"
                    ? (boardDir ? 6 - row : row - 1)
                    : (boardDir ? row - 1 : 6 - row);
                value += advancement * 4;
            }
            if (["c", "f", "d"].includes(piece.piece)) {
                value += Math.round(
                    (7 - Math.abs(3.5 - row) - Math.abs(3.5 - col)) * 3
                );
            }
            score += sign * value;
        }
    }
    return score;
}

function moveOrderScore(position, move) {
    const captured = position[move.row][move.col];
    if (move.type === "priseEnPassant") return 1000 + PIECE_VALUES.p;
    const captureScore = captured
        ? 1000 + PIECE_VALUES[captured.piece] - PIECE_VALUES[
            position[move.fromRow][move.fromCol].piece
        ] / 10
        : 0;
    const promotionScore = (
        position[move.fromRow][move.fromCol].piece === "p" &&
        (move.row === 0 || move.row === 7)
    ) ? PIECE_VALUES.d : 0;
    return captureScore + promotionScore + (move.type === "roque" ? 30 : 0);
}

class IA {
    constructor(level = 3) {
        this.level = Math.max(1, Math.min(100, Number(level) || 1));
        this.depth = this.level <= 2 ? 1 : this.level <= 5 ? 2 : this.level <= 8 ? 3 : 4;
        this.maxMovesTested = 5 + this.level;
        this.lastResult = null;
    }

    getBestMove(position, color, boardDir, lastMove, rooks) {
        const state = { position, rooks, lastMove };
        const moves = getLegalMoves(position, color, boardDir, lastMove, rooks);
        if (moves.length === 0) {
            this.lastResult = {
                move: null,
                score: evaluate(position, color, boardDir),
                nodesTested: 0,
                positionsEvaluated: 1,
                depth: this.depth,
                maxMovesTested: this.maxMovesTested
            };
            return this.lastResult;
        }

        moves.sort(
            (a, b) =>
                moveOrderScore(position, b) - moveOrderScore(position, a)
        );
        const stats = { nodesTested: 0, positionsEvaluated: 0 };
        let bestScore = -Infinity;
        const bestMoves = [];

        for (const move of moves) {
            stats.nodesTested++;
            const nextState = applyMove(state, move);
            const score = this.search(
                nextState,
                color === "b" ? "n" : "b",
                color,
                this.depth - 1,
                -Infinity,
                Infinity,
                boardDir,
                stats,
                1
            );
            if (score > bestScore) {
                bestScore = score;
                bestMoves.length = 0;
                bestMoves.push(move);
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        this.lastResult = {
            move: bestMoves[Math.floor(Math.random() * bestMoves.length)],
            score: bestScore,
            nodesTested: stats.nodesTested,
            positionsEvaluated: stats.positionsEvaluated,
            depth: this.depth,
            maxMovesTested: this.maxMovesTested
        };
        return this.lastResult;
    }

    search(state, color, perspective, depth, alpha, beta, boardDir, stats, ply) {
        if (depth === 0) {
            stats.positionsEvaluated++;
            return evaluate(state.position, perspective, boardDir);
        }

        const moves = getLegalMoves(
            state.position,
            color,
            boardDir,
            state.lastMove,
            state.rooks
        );
        if (moves.length === 0) {
            stats.positionsEvaluated++;
            if (!isInCheck(state.position, color, boardDir)) return 0;
            return color === perspective
                ? -MATE_SCORE + ply
                : MATE_SCORE - ply;
        }

        moves.sort(
            (a, b) =>
                moveOrderScore(state.position, b) -
                moveOrderScore(state.position, a)
        );
        const candidates = moves.slice(0, this.maxMovesTested);
        const maximizing = color === perspective;
        let bestScore = maximizing ? -Infinity : Infinity;

        for (const move of candidates) {
            stats.nodesTested++;
            const nextState = applyMove(state, move);
            const score = this.search(
                nextState,
                color === "b" ? "n" : "b",
                perspective,
                depth - 1,
                alpha,
                beta,
                boardDir,
                stats,
                ply + 1
            );
            if (maximizing) {
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);
            } else {
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, bestScore);
            }
            if (beta <= alpha) break;
        }
        return bestScore;
    }
}

export default IA;
