import Pieces from "./pieces.js";
import { getLegalMoves, isInCheck } from "./ia.js";

class Board {
    constructor(boardDir) {
        this.BOARD_SIZE = 8;
        this.boardDir = !boardDir;
        this.piecesref = {
            b: { p: "&#9817;", c: "&#9816;", f: "&#9815;", t: "&#9814;", d: "&#9813;", r: "&#9812;" },
            n: { p: "&#9823;", c: "&#9822;", f: "&#9821;", t: "&#9820;", d: "&#9819;", r: "&#9818;" }
        };
        this.grid = [];
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.isIaPlaying = false;
        this.aiColor = boardDir ? "b" : "n";
        this.turn = "b";
        this.gameOver = false;
        this.onMove = null;
        this.pendingPromotion = null;
        this.moveCount = 1;
        this.pgnMoves = [];
        this.pgnResult = "*";
        this.lastMove = null;
        this.rook = {
            b: { leftRook: false, rightRook: false, king: false },
            n: { leftRook: false, rightRook: false, king: false }
        };
        this.init();
        this.initPromotion();
        document.getElementById("copierPng")?.addEventListener(
            "click",
            () => this.copyBoardPng().catch((error) => {
                console.error("Échec de la copie du plateau :", error);
                alert(
                    error instanceof Error
                        ? error.message
                        : "La copie du plateau a échoué."
                );
            })
        );
        document.getElementById("copierPgn")?.addEventListener(
            "click",
            () => this.copyPgn().catch((error) => {
                console.error("Échec de la copie du PGN :", error);
                alert(
                    error instanceof Error
                        ? error.message
                        : "La copie du PGN a échoué."
                );
            })
        );
    }

    init() {
        const board = document.getElementById("plateau");
        if (!board) throw new Error("Le plateau d'échecs est introuvable.");
        board.innerHTML = "";
        this.grid = Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(null)
        );
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                this.createCell(row, col, board);
            }
        }
    }

    createCell(row, col, board) {
        const cell = document.createElement("div");
        cell.className = `case ${(row + col) % 2 === 0 ? "clair" : "fonce"}`;
        cell.dataset.row = row;
        cell.dataset.col = col;

        const blackBackRow = this.boardDir ? 0 : 7;
        const blackPawnRow = this.boardDir ? 1 : 6;
        const whiteBackRow = this.boardDir ? 7 : 0;
        const whitePawnRow = this.boardDir ? 6 : 1;
        const backRank = ["t", "c", "f", "d", "r", "f", "c", "t"];
        if (row === blackBackRow) {
            this.grid[row][col] = new Pieces("n" + backRank[col]);
        } else if (row === whiteBackRow) {
            this.grid[row][col] = new Pieces("b" + backRank[col]);
        } else if (row === blackPawnRow) {
            this.grid[row][col] = new Pieces("np");
        } else if (row === whitePawnRow) {
            this.grid[row][col] = new Pieces("bp");
        }

        this.drawBoard(cell, row, col);
        board.appendChild(cell);
    }

    drawBoard(cell, row, col) {
        const piece = this.grid[row][col];
        cell.innerHTML = piece
            ? this.piecesref[piece.color][piece.piece]
            : "";

        if (row === 0 && col === 0) cell.style.borderTopLeftRadius = "5px";
        if (row === 0 && col === 7) cell.style.borderTopRightRadius = "5px";
        if (row === 7 && col === 7) cell.style.borderBottomRightRadius = "5px";
        if (row === 7 && col === 0) cell.style.borderBottomLeftRadius = "5px";

        cell.addEventListener("click", () => {
            if (
                this.isIaPlaying ||
                this.gameOver ||
                this.pendingPromotion
            ) return;

            const selected = document.querySelector("#plateau .selected");
            const selectedRow = selected ? Number(selected.dataset.row) : -1;
            const selectedCol = selected ? Number(selected.dataset.col) : -1;
            const move = this.possibleMoves.find((candidate) =>
                candidate.fromRow === selectedRow &&
                candidate.fromCol === selectedCol &&
                candidate.row === row &&
                candidate.col === col
            );
            if (move) {
                this.executeMove(move);
                return;
            }

            if (this.grid[row][col]?.color === this.turn) {
                this.clearSelection();
                this.selectedPiece = this.grid[row][col];
                this.selectedPiece.isSelected = true;
                this.possibleMoves = getLegalMoves(
                    this.grid,
                    this.turn,
                    this.boardDir,
                    this.lastMove,
                    this.rook
                ).filter(
                    (candidate) =>
                        candidate.fromRow === row && candidate.fromCol === col
                );
                this.selectedPiece.showAllPossibleMoves(
                    this.possibleMoves.map((candidate) => [
                        candidate.row,
                        candidate.col,
                        candidate.type
                    ])
                );
                cell.classList.add("selected");
                return;
            }
            this.clearSelection();
        });
    }

    clearSelection() {
        if (this.selectedPiece) this.selectedPiece.isSelected = false;
        this.selectedPiece = null;
        document.querySelectorAll("#plateau .selected").forEach((cell) => {
            cell.classList.remove("selected");
        });
        document.querySelectorAll(
            "#plateau .greyPoint, #plateau .redPoint, #plateau .bluePoint, #plateau .yellowPoint"
        ).forEach((point) => point.remove());
        this.possibleMoves = [];
    }

    executeMove(move, promotionType = null) {
        const piece = this.grid[move.fromRow][move.fromCol];
        if (!piece || piece.color !== this.turn || this.gameOver) return;

        const mover = piece.color;
        const captured = this.grid[move.row][move.col];
        let pgnBase = this.getPgnMoveBase(move, piece, captured);
        this.grid[move.fromRow][move.fromCol] = null;
        if (move.type === "priseEnPassant") {
            this.grid[move.fromRow][move.col] = null;
        }
        if (move.type === "roque") {
            const rookFrom = move.col > move.fromCol ? 7 : 0;
            const rookTo = move.col > move.fromCol ? move.col - 1 : move.col + 1;
            this.grid[move.row][rookTo] = this.grid[move.row][rookFrom];
            this.grid[move.row][rookFrom] = null;
            this.rook[mover].king = true;
            if (rookFrom === 0) this.rook[mover].leftRook = true;
            else this.rook[mover].rightRook = true;
        }

        piece.hasMoved = true;
        if (piece.piece === "r") this.rook[mover].king = true;
        if (piece.piece === "t" && move.fromCol === 0) {
            this.rook[mover].leftRook = true;
        }
        if (piece.piece === "t" && move.fromCol === 7) {
            this.rook[mover].rightRook = true;
        }
        this.grid[move.row][move.col] = piece;
        this.lastMove = [
            move.fromRow,
            move.fromCol,
            move.row,
            move.col,
            piece
        ];
        this.clearSelection();

        if (piece.piece === "p" && (move.row === 0 || move.row === 7)) {
            move.promotion = true;
            if (mover !== this.aiColor && !promotionType) {
                this.pendingPromotion = { move, mover, captured, pgnBase };
                this.showPromotion(mover);
                this.refreshBoard();
                return;
            }
            const promotedType = promotionType || "d";
            this.promotePawn(move.row, move.col, mover, promotedType);
            pgnBase += `=${this.getPgnPieceLetter(promotedType)}`;
        }
        this.finishMove(move, mover, captured, pgnBase);
    }

    promotePawn(row, col, color, pieceType) {
        const promoted = new Pieces(color + pieceType);
        promoted.hasMoved = true;
        this.grid[row][col] = promoted;
        if (this.lastMove) this.lastMove[4] = promoted;
    }

    initPromotion() {
        const promotion = document.getElementById("promotion");
        promotion?.addEventListener("click", (event) => {
            const choice = event.target.closest(".prPiece > div");
            if (!choice || !this.pendingPromotion) return;
            const { move, mover, captured, pgnBase } = this.pendingPromotion;
            const colorClass = mover === "b" ? "blanc" : "noir";
            if (!choice.classList.contains(colorClass)) return;
            const pieceTypes = {
                cavalier: "c",
                fou: "f",
                tour: "t",
                dame: "d"
            };
            const type = Object.keys(pieceTypes).find((name) =>
                choice.classList.contains(name)
            );
            if (!type) return;
            this.promotePawn(move.row, move.col, mover, pieceTypes[type]);
            this.pendingPromotion = null;
            promotion.style.visibility = "hidden";
            promotion.style.display = "none";
            this.finishMove(
                move,
                mover,
                captured,
                `${pgnBase}=${this.getPgnPieceLetter(pieceTypes[type])}`
            );
        });
    }

    showPromotion(color) {
        const promotion = document.getElementById("promotion");
        if (!promotion) throw new Error("Le choix de promotion est introuvable.");
        promotion.style.display = "grid";
        promotion.style.visibility = "visible";
        const colorClass = color === "b" ? "blanc" : "noir";
        promotion.querySelectorAll(".prPiece > div").forEach((piece) => {
            piece.style.visibility = piece.classList.contains(colorClass)
                ? "visible"
                : "hidden";
        });
    }

    finishMove(move, mover, captured, pgnBase) {
        this.turn = mover === "b" ? "n" : "b";
        this.refreshBoard();
        this.recordMove(move, mover, captured);
        this.recordPgnMove(pgnBase);
        if (mover === "n") this.moveCount++;
        if (this.onMove) this.onMove(move, mover, captured);
    }

    getPgnMoveBase(move, piece, captured) {
        if (move.type === "roque") {
            return move.col > move.fromCol ? "O-O" : "O-O-O";
        }

        const rank = (row) => this.boardDir ? 8 - row : row + 1;
        const alternatives = getLegalMoves(
            this.grid,
            piece.color,
            this.boardDir,
            this.lastMove,
            this.rook
        ).filter(
            (candidate) =>
                candidate.row === move.row &&
                candidate.col === move.col &&
                (
                    candidate.fromRow !== move.fromRow ||
                    candidate.fromCol !== move.fromCol
                ) &&
                this.grid[candidate.fromRow][candidate.fromCol]?.piece === piece.piece
        );

        let disambiguation = "";
        if (alternatives.length > 0) {
            const sameFile = alternatives.some(
                (candidate) => candidate.fromCol === move.fromCol
            );
            const sameRank = alternatives.some(
                (candidate) => candidate.fromRow === move.fromRow
            );
            if (!sameFile) {
                disambiguation = "abcdefgh"[move.fromCol];
            } else if (!sameRank) {
                disambiguation = String(rank(move.fromRow));
            } else {
                disambiguation =
                    "abcdefgh"[move.fromCol] + String(rank(move.fromRow));
            }
        }

        const isCapture = Boolean(captured) || move.type === "priseEnPassant";
        const pawnFile = piece.piece === "p" && isCapture
            ? "abcdefgh"[move.fromCol]
            : "";
        const to = `${"abcdefgh"[move.col]}${rank(move.row)}`;
        let notation =
            `${this.getPgnPieceLetter(piece.piece)}${pawnFile}${disambiguation}` +
            `${isCapture ? "x" : ""}${to}`;
        return notation;
    }

    getPgnPieceLetter(pieceType) {
        return { p: "", c: "N", f: "B", t: "R", d: "Q", r: "K" }[pieceType];
    }

    recordPgnMove(base) {
        const legalMoves = getLegalMoves(
            this.grid,
            this.turn,
            this.boardDir,
            this.lastMove,
            this.rook
        );
        const check = isInCheck(this.grid, this.turn, this.boardDir);
        const suffix = check ? (legalMoves.length === 0 ? "#" : "+") : "";
        this.pgnMoves.push({ color: this.turn === "b" ? "n" : "b", san: base + suffix });
    }

    buildPgn() {
        const escapeTag = (value) =>
            String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const date = new Date();
        const dateTag = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join(".");
        const white = escapeTag(
            document.getElementById("whiteName")?.value.trim() || "Blancs"
        );
        const black = escapeTag(
            document.getElementById("blackName")?.value.trim() || "Noirs"
        );
        const headers = [
            '[Event "Partie locale"]',
            '[Site "Jeu d\'échecs"]',
            `[Date "${dateTag}"]`,
            '[Round "1"]',
            `[White "${white}"]`,
            `[Black "${black}"]`,
            `[Result "${this.pgnResult}"]`
        ];
        const moves = [];
        for (let index = 0; index < this.pgnMoves.length; index++) {
            const move = this.pgnMoves[index];
            const moveNumber = Math.floor(index / 2) + 1;
            if (move.color === "b") {
                moves.push(`${moveNumber}. ${move.san}`);
            } else if (moves.length > 0) {
                moves[moves.length - 1] += ` ${move.san}`;
            } else {
                moves.push(`${moveNumber}... ${move.san}`);
            }
        }
        moves.push(this.pgnResult);
        return `${headers.join("\n")}\n\n${moves.join(" ")}\n`;
    }

    async copyPgn() {
        const pgn = this.buildPgn();
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(pgn);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = pgn;
            textArea.setAttribute("readonly", "");
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            let copied = false;
            try {
                copied = document.execCommand("copy");
            } finally {
                textArea.remove();
            }
            if (!copied) {
                throw new Error(
                    "La copie du PGN n'est pas autorisée par ce navigateur."
                );
            }
        }

        const button = document.getElementById("copierPgn");
        if (button) {
            button.textContent = "PGN copié !";
            window.setTimeout(() => {
                button.textContent = "Copier le PGN";
            }, 1800);
        }
    }

    recordMove(move, mover, captured) {
        const history = document.getElementById("historiqueCoups");
        if (!history) return;
        const piece = this.lastMove[4];
        const rank = (row) => this.boardDir ? 8 - row : row + 1;
        const from = `${"abcdefgh"[move.fromCol]}${rank(move.fromRow)}`;
        const to = `${"abcdefgh"[move.col]}${rank(move.row)}`;
        const names = { p: "", c: "C", f: "F", t: "T", d: "D", r: "R" };
        let notation = move.type === "roque"
            ? (move.col > move.fromCol ? "O-O" : "O-O-O")
            : `${names[piece.piece]}${from}${captured || move.type === "priseEnPassant" ? "x" : "-"}${to}`;
        if (move.promotion) {
            notation += `=${names[piece.piece]}`;
        }
        const entry = document.createElement("div");
        entry.textContent =
            `${this.moveCount}. ${mover === "b" ? "Blancs" : "Noirs"} : ${notation}`;
        history.appendChild(entry);
        history.scrollTop = history.scrollHeight;
    }

    refreshBoard() {
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const cell = document.querySelector(
                    `#plateau [data-row="${row}"][data-col="${col}"]`
                );
                const piece = this.grid[row][col];
                cell.innerHTML = piece
                    ? this.piecesref[piece.color][piece.piece]
                    : "";
            }
        }
    }

    async copyBoardPng() {
        if (!navigator.clipboard?.write || !window.ClipboardItem) {
            alert("La copie d'image n'est pas prise en charge par ce navigateur.");
            return;
        }
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Impossible de créer l'image du plateau.");
        const squareSize = 64;
        canvas.width = squareSize * 8;
        canvas.height = squareSize * 8;
        const glyphs = {
            bp: "♙", bc: "♘", bf: "♗", bt: "♖", bd: "♕", br: "♔",
            np: "♟", nc: "♞", nf: "♝", nt: "♜", nd: "♛", nr: "♚"
        };
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                context.fillStyle = (row + col) % 2 === 0 ? "#a3ff96" : "#0fc209";
                context.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
                const piece = this.grid[row][col];
                if (piece) {
                    context.fillStyle = piece.color === "b" ? "#fff" : "#111";
                    context.font = "52px serif";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText(
                        glyphs[piece.color + piece.piece],
                        col * squareSize + squareSize / 2,
                        row * squareSize + squareSize / 2
                    );
                }
            }
        }
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((image) => {
                if (image) resolve(image);
                else reject(new Error("La création de l'image PNG a échoué."));
            }, "image/png");
        });
        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
        ]);
    }
}

export default Board;
