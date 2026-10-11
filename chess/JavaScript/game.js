import Board from "./board.js";
import IA, { getLegalMoves, isInCheck } from "./ia.js";

class Game {
    constructor(boardDir, iaLevel) {
        this.boardDir = boardDir;
        this.ia = new IA(iaLevel);
        this.board = new Board(boardDir);
        this.board.onMove = (move, mover, captured) =>
            this.handleMove(move, mover, captured);
        this.aiColor = this.board.aiColor;
        const whiteName = document.getElementById("whiteName");
        const blackName = document.getElementById("blackName");
        if (this.aiColor === "b") {
            whiteName.value = "IA";
            if (blackName.value === "IA") blackName.value = "Noirs";
        } else {
            blackName.value = "IA";
        }
        this.status = document.getElementById("iaInfo");
        this.updateStatus();
        if (this.board.turn === this.aiColor) {
            this.board.isIaPlaying = true;
            window.setTimeout(() => this.playIaTurn(), 100);
        }
    }

    handleMove() {
        const result = this.getResult();
        if (result) {
            this.board.gameOver = true;
            this.board.pgnResult = result.startsWith("Échec et mat")
                ? (this.board.turn === "b" ? "0-1" : "1-0")
                : "1/2-1/2";
            this.updateStatus(result);
            return;
        }
        this.updateStatus();
        if (this.board.turn === this.aiColor) {
            this.board.isIaPlaying = true;
            window.setTimeout(() => this.playIaTurn(), 200);
        }
    }

    getResult() {
        const legalMoves = getLegalMoves(
            this.board.grid,
            this.board.turn,
            this.board.boardDir,
            this.board.lastMove,
            this.board.rook
        );
        if (legalMoves.length > 0) return null;
        if (isInCheck(this.board.grid, this.board.turn, this.board.boardDir)) {
            return this.board.turn === "b"
                ? "Échec et mat : les Noirs gagnent."
                : "Échec et mat : les Blancs gagnent.";
        }
        return "Partie nulle par pat.";
    }

    playIaTurn() {
        if (this.board.gameOver || this.board.turn !== this.aiColor) return;
        this.board.isIaPlaying = true;
        try {
            const result = this.ia.getBestMove(
                this.board.grid,
                this.aiColor,
                this.board.boardDir,
                this.board.lastMove,
                this.board.rook
            );
            if (!result.move) {
                this.board.isIaPlaying = false;
                this.handleMove();
                return;
            }
            this.board.executeMove(result.move, "d");
            this.updateStatus();
        } finally {
            this.board.isIaPlaying = false;
        }
    }

    updateStatus(result = null) {
        if (!this.status) return;
        const lastSearch = this.ia.lastResult;
        if (result) {
            this.status.textContent = result;
            return;
        }
        const turnName = this.board.turn === "b" ? "Blancs" : "Noirs";
        const check = isInCheck(
            this.board.grid,
            this.board.turn,
            this.board.boardDir
        ) ? "Échec ! " : "";
        const points = lastSearch
            ? (lastSearch.score / 100).toFixed(1)
            : "0.0";
        const breadth = this.ia.depth > 1
            ? `, jusqu'à ${this.ia.maxMovesTested} réponses anticipées par position`
            : "";
        const research = lastSearch
            ? `Score IA : ${points} (+ IA / - adversaire) | profondeur : ${lastSearch.depth} demi-coups${breadth} | coups testés : ${lastSearch.nodesTested}`
            : `À ${turnName} de jouer. Niveau IA ${this.ia.level} — profondeur ${this.ia.depth} demi-coups${breadth}.`;
        this.status.textContent = lastSearch
            ? `${check}À ${turnName} de jouer. ${research}`
            : `${check}${research}`;
    }
}

export default Game;
