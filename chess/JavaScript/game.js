import Board from "./board.js";
import IA, { getLegalMoves, isInCheck } from "./ia.js";

/*
    parties importante : 
[Event "Partie locale"]
[Site "Jeu d'échecs"]
[Date "2026.10.12"]
[Round "1"]
[White "IA"]
[Black "Noirs"]
[Result "0-1"]

1. Nf3 d5 2. Nc3 c5 3. a4 Nc6 4. e3 e5 5. d3 Nf6 6. h4 e4 7. dxe4 dxe4 8. Ng5 Qxd1+ 9. Kxd1 Bf5 10. Ke1 Bd6 11. Nb5 Be5 12. Bc4 h6 13. Nxf7 Rf8 14. Nfd6+ Bxd6 15. Nxd6+ Ke7 16. Nxf5+ Ke8 17. Nxg7+ Ke7 18. Ne6 Ke8 19. Nc7+ Ke7 20. Be2 Rad8 21. f3 exf3 22. Bxf3 Nb4 23. Bd1 Rxd1+ 24. Kxd1 Ng4 25. Re1 Nf2+ 26. Kd2 Ne4+ 27. Kd1 Rd8+ 28. Nd5+ Rxd5+ 29. Bd2 Rxd2+ 30. Kc1 Rxc2+ 31. Kb1 Nd2# 0-1


[Event "Partie locale"]
[Site "Jeu d'échecs"]
[Date "2026.10.12"]
[Round "1"]
[White "IA"]
[Black "Noirs"]
[Result "0-1"]

1. Nf3 d5 2. a4 c5 3. Nc3 Nc6 4. e3 e5 5. d3 Nf6 6. h4 e4 7. dxe4 dxe4 8. Ng5 Bf5 9. Qxd8+ Rxd8 10. Bb5 a6 11. Bxc6+ bxc6 12. f3 exf3 13. gxf3 Bd6 14. e4 Be6 15. Kf2 O-O 16. b3 c4 17. Nxe6 fxe6 18. Ba3 cxb3 19. Bxd6 Rxd6 20. e5 Rd2+ 21. Kg3 Nh5+ 22. Kg4 Rg2+ 23. Kxh5 Rf5# 0-1

*/

/**
 * Etrange !!!
 * 
 * null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
game.js:113 null
-> game.js:113 Échec et mat : les Blancs gagnent.
-------> game.js:113 null !!!!!!!!!
 */

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
            window.setTimeout(() => this.playIaTurn(), 2000);
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
            window.setTimeout(() => this.playIaTurn(), 1000);
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
        if (!this.status) {console.log("not this.status"); return;}
        const lastSearch = this.ia.lastResult;
        console.log(result ? result : "null");
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
