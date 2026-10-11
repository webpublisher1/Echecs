class Pieces {
    constructor(name) {
        this.color = name[0];
        this.piece = name[1];
        this.isSelected = false;
        this.hasMoved = false;
    }

    getAllMoves(grid, boardDir, row, col, lastMove, rooks) {
        let move = [];

        if(this.piece === "p") { // pion
            if(
                (this.color === "b" && boardDir) ||
                (this.color === "n" && !boardDir)
            ) {
                // avancer de 2 cases
                if(
                    row === 6 &&
                    !this.hasMoved &&
                    grid[row - 1][col] === null &&
                    grid[row - 2][col] === null
                ) {
                    move.push([row - 2, col, "normal"]);
                }
                // capture vers la droite
                if(
                    col !== 7 && (
                        grid[row - 1][col + 1] !== null && 
                        grid[row - 1][col + 1].color !== this.color
                    )
                ) {
                    move.push([row - 1, col + 1, "prise"]);
                }
                // capture vers la gauche
                if(
                    col !== 0 && (
                        grid[row - 1][col - 1] !== null &&
                        grid[row - 1][col - 1].color !== this.color
                    )
                ) {
                    move.push([row - 1, col - 1, "prise"]);
                }
                // prise en passant vers la droite
                if(
                    col !== 7 && // pas en dehors du plateau
                    grid[row][col + 1] !== null && // pion adjacent disponible
                    grid[row][col + 1].color !== this.color &&
                    lastMove &&
                    lastMove[4]?.piece === "p" && // coup de pion
                    lastMove[2] === row &&
                    lastMove[3] === col + 1 &&
                    Math.abs(lastMove[0] - lastMove[2]) === 2 // avance de 2 cases
                ) {
                    move.push([row - 1, col + 1, "priseEnPassant"]);
                }
                // prise en passant vers la gauche
                if(
                    col !== 0 && // pas en dehors du plateau
                    grid[row][col - 1] !== null && // pion adjacent disponible
                    grid[row][col - 1].color !== this.color &&
                    lastMove &&
                    lastMove[4]?.piece === "p" && // coup de pion
                    lastMove[2] === row &&
                    lastMove[3] === col - 1 &&
                    Math.abs(lastMove[0] - lastMove[2]) === 2 // avance de 2 cases
                ) {
                    move.push([row - 1, col - 1, "priseEnPassant"]);
                }
                // avancer
                if (grid[row - 1][col] === null) {
                    move.push([row - 1, col, "normal"]);
                }
            } else {
                // avancer de 2 cases
                if(
                    row === 1 &&
                    !this.hasMoved &&
                    grid[row + 1][col] === null &&
                    grid[row + 2][col] === null
                ) {
                    move.push([row + 2, col, "normal"]);
                }
                // capture vers la droite
                if(
                    col !== 7 && (
                        grid[row + 1][col + 1] !== null && 
                        grid[row + 1][col + 1].color !== this.color
                    )
                ) {
                    move.push([row + 1, col + 1, "prise"]);
                }
                // capture vers la gauche
                if(
                    col !== 0 && (
                        grid[row + 1][col - 1] !== null &&
                        grid[row + 1][col - 1].color !== this.color
                    )
                ) {
                    move.push([row + 1, col - 1, "prise"]);
                }
                // prise en passant vers la droite
                if(
                    col !== 7 &&
                    grid[row][col + 1] !== null &&
                    grid[row][col + 1].color !== this.color &&
                    lastMove &&
                    lastMove[4]?.piece === "p" &&
                    lastMove[2] === row &&
                    lastMove[3] === col + 1 &&
                    Math.abs(lastMove[0] - lastMove[2]) === 2
                ) {
                    move.push([row + 1, col + 1, "priseEnPassant"]);
                }
                // prise en passant vers la gauche
                if(
                    col !== 0 &&
                    grid[row][col - 1] !== null &&
                    grid[row][col - 1].color !== this.color &&
                    lastMove &&
                    lastMove[4]?.piece === "p" &&
                    lastMove[2] === row &&
                    lastMove[3] === col - 1 &&
                    Math.abs(lastMove[0] - lastMove[2]) === 2
                ) {
                    move.push([row + 1, col - 1, "priseEnPassant"]);
                }
                // avancer
                if (grid[row + 1][col] === null) {
                    move.push([row + 1, col, "normal"]);
                }
            }
        } else if(this.piece === "t") { // tour
            let xCol, yRow;
            // mouvement vertical vers le haut
            xCol = col;
            yRow = row;
            while(true) {
                yRow--;
                // sortie du plateau
                if(yRow < 0) {
                    break;
                }
                // ajout du coup si la case est vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // arret de la recherche si la case est occupée :
                // - par une piece de la couleur opposée
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // - par une piece de la même couleur
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement vertical vers le bas
            xCol = col;
            yRow = row;
            while(true) {
                yRow++;
                // sortie du plateau
                if(yRow > 7) {
                    break;
                }
                // ajout du coup si la case est vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // arret de la recherche si la case est occupée :
                // - par une piece de la couleur opposée
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // - par une piece de la même couleur
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement horizontal vers la droite
            xCol = col;
            yRow = row;
            while(true) {
                xCol++;
                // sortie du plateau
                if(xCol > 7) {
                    break;
                }
                // ajout du coup si la case est vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // arret de la recherche si la case est occupée :
                // - par une piece de la couleur opposée
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // - par une piece de la même couleur
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement horizontal vers la gauche
            xCol = col;
            yRow = row;
            while(true) {
                xCol--;
                // sortie du plateau
                if(xCol < 0) {
                    break;
                }
                // ajout du coup si la case est vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // arret de la recherche si la case est occupée :
                // - par une piece de la couleur opposée
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // - par une piece de la même couleur
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
        } else if(this.piece === "c") { // cavalier
            // coups normaux
            {
                // haut droite
                if(
                    row-2 >= 0 &&
                    col+1 <= 7 &&
                    (
                        grid[row-2][col+1] === null
                    )
                ) {
                    move.push([row-2, col+1, "normal"]);
                }
                // droite haut
                if(
                    row-1 >= 0 &&
                    col+2 <= 7 &&
                    (
                        grid[row-1][col+2] === null
                    )
                ) {
                    move.push([row-1, col+2, "normal"]);
                }
                // droite bas
                if(
                    row+1 <= 7 &&
                    col+2 <= 7 &&
                    (
                        grid[row+1][col+2] === null
                    )
                ) {
                    move.push([row+1, col+2, "normal"]);
                }
                // bas droite
                if(
                    row+2 <= 7 &&
                    col+1 <= 7 &&
                    (
                        grid[row+2][col+1] === null
                    )
                ) {
                    move.push([row+2, col+1, "normal"]);
                }

                // bas gauche
                if(
                    row+2 <= 7 &&
                    col-1 >= 0 &&
                    (
                        grid[row+2][col-1] === null
                    )
                ) {
                    move.push([row+2, col-1, "normal"]);
                }
                // gauche bas
                if(
                    row+1 <= 7 &&
                    col-2 >= 0 &&
                    (
                        grid[row+1][col-2] === null
                    )
                ) {
                    move.push([row+1, col-2, "normal"]);
                }
                // gauche haut
                if(
                    row-1 >= 0 &&
                    col-2 >= 0 &&
                    (
                        grid[row-1][col-2] === null
                    )
                ) {
                    move.push([row-1, col-2, "normal"]);
                }
                // haut gauche
                if(
                    row-2 >= 0 &&
                    col-1 >= 0 &&
                    (
                        grid[row-2][col-1] === null
                    )
                ) {
                    move.push([row-2, col-1, "normal"]);
                }
            }

            // prises
            {
                // haut droite
                if(
                    row-2 >= 0 &&
                    col+1 <= 7 &&
                    (
                        grid[row-2][col+1] !== null && 
                        grid[row-2][col+1]?.color !== this.color
                    )
                ) {
                    move.push([row-2, col+1, "prise"]);
                }
                // droite haut
                if(
                    row-1 >= 0 &&
                    col+2 <= 7 &&
                    (
                        grid[row-1][col+2] !== null &&
                        grid[row-1][col+2]?.color !== this.color
                    )
                ) {
                    move.push([row-1, col+2, "prise"]);
                }
                // droite bas
                if(
                    row+1 <= 7 &&
                    col+2 <= 7 &&
                    (
                        grid[row+1][col+2] !== null &&
                        grid[row+1][col+2]?.color !== this.color
                    )
                ) {
                    move.push([row+1, col+2, "prise"]);
                }
                // bas droite
                if(
                    row+2 <= 7 &&
                    col+1 <= 7 &&
                    (
                        grid[row+2][col+1] !== null &&
                        grid[row+2][col+1]?.color !== this.color
                    )
                ) {
                    move.push([row+2, col+1, "prise"]);
                }

                // bas gauche
                if(
                    row+2 <= 7 &&
                    col-1 >= 0 &&
                    (
                        grid[row+2][col-1] !== null &&
                        grid[row+2][col-1]?.color !== this.color
                    )
                ) {
                    move.push([row+2, col-1, "prise"]);
                }
                // gauche bas
                if(
                    row+1 <= 7 &&
                    col-2 >= 0 &&
                    (
                        grid[row+1][col-2] !== null &&
                        grid[row+1][col-2]?.color !== this.color
                    )
                ) {
                    move.push([row+1, col-2, "prise"]);
                }
                // gauche haut
                if(
                    row-1 >= 0 &&
                    col-2 >= 0 &&
                    (
                        grid[row-1][col-2] !== null &&
                        grid[row-1][col-2]?.color !== this.color
                    )
                ) {
                    move.push([row-1, col-2, "prise"]);
                }
                // haut gauche
                if(
                    row-2 >= 0 &&
                    col-1 >= 0 &&
                    (
                        grid[row-2][col-1] !== null &&
                        grid[row-2][col-1]?.color !== this.color
                    )
                ) {
                    move.push([row-2, col-1, "prise"]);
                }
            }
        } else if(this.piece === "f") { // fou
            let xCol, yRow;

            // mouvement en haut à droite
            xCol = col;
            yRow = row;
            while(true) {
                xCol++;
                yRow--;
                // sortie du plateau
                if(
                    xCol > 7 ||
                    yRow < 0
                ) {
                    break;
                }
                // case vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // ennemi
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // piece amie
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement en haut à gauche
            xCol = col;
            yRow = row;
            while(true) {
                xCol--;
                yRow--;
                // sortie du plateau
                if(
                    xCol < 0 ||
                    yRow < 0
                ) {
                    break;
                }
                // case vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // ennemi
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // piece amie
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement en bas à gauche
            xCol = col;
            yRow = row;
            while(true) {
                xCol--;
                yRow++;
                // sortie du plateau
                if(
                    xCol < 0 ||
                    yRow > 7
                ) {
                    break;
                }
                // case vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // ennemi
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // piece amie
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
            // mouvement en bas à droite
            xCol = col;
            yRow = row;
            while(true) {
                xCol++;
                yRow++;
                // sortie du plateau
                if(
                    xCol >7 ||
                    yRow > 7
                ) {
                    break;
                }
                // case vide
                if(grid[yRow][xCol] === null) {
                    move.push([yRow, xCol, "normal"]);
                    continue;
                }
                // ennemi
                if(grid[yRow][xCol]?.color !== this.color) {
                    move.push([yRow, xCol, "prise"]);
                    break;
                }
                // piece amie
                if(grid[yRow][xCol]?.color === this.color) {
                    break;
                }
            }
        } else if(this.piece === "d") { // dame
            // comme un fou
            {
                let xCol, yRow;

                // mouvement en haut à droite
                xCol = col;
                yRow = row;
                while(true) {
                    xCol++;
                    yRow--;
                    // sortie du plateau
                    if(
                        xCol > 7 ||
                        yRow < 0
                    ) {
                        break;
                    }
                    // case vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // ennemi
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // piece amie
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement en haut à gauche
                xCol = col;
                yRow = row;
                while(true) {
                    xCol--;
                    yRow--;
                    // sortie du plateau
                    if(
                        xCol < 0 ||
                        yRow < 0
                    ) {
                        break;
                    }
                    // case vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // ennemi
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // piece amie
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement en bas à gauche
                xCol = col;
                yRow = row;
                while(true) {
                    xCol--;
                    yRow++;
                    // sortie du plateau
                    if(
                        xCol < 0 ||
                        yRow > 7
                    ) {
                        break;
                    }
                    // case vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // ennemi
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // piece amie
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement en bas à droite
                xCol = col;
                yRow = row;
                while(true) {
                    xCol++;
                    yRow++;
                    // sortie du plateau
                    if(
                        xCol >7 ||
                        yRow > 7
                    ) {
                        break;
                    }
                    // case vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // ennemi
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // piece amie
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
            }

            // comme une tour
            {
                let xCol, yRow;

                // mouvement vertical vers le haut
                xCol = col;
                yRow = row;
                while(true) {
                    yRow--;
                    // sortie du plateau
                    if(yRow < 0) {
                        break;
                    }
                    // ajout du coup si la case est vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // arret de la recherche si la case est occupée :
                    // - par une piece de la couleur opposée
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // - par une piece de la même couleur
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement vertical vers le bas
                xCol = col;
                yRow = row;
                while(true) {
                    yRow++;
                    // sortie du plateau
                    if(yRow > 7) {
                        break;
                    }
                    // ajout du coup si la case est vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // arret de la recherche si la case est occupée :
                    // - par une piece de la couleur opposée
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // - par une piece de la même couleur
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement horizontal vers la droite
                xCol = col;
                yRow = row;
                while(true) {
                    xCol++;
                    // sortie du plateau
                    if(xCol > 7) {
                        break;
                    }
                    // ajout du coup si la case est vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // arret de la recherche si la case est occupée :
                    // - par une piece de la couleur opposée
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // - par une piece de la même couleur
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
                // mouvement horizontal vers la gauche
                xCol = col;
                yRow = row;
                while(true) {
                    xCol--;
                    // sortie du plateau
                    if(xCol < 0) {
                        break;
                    }
                    // ajout du coup si la case est vide
                    if(grid[yRow][xCol] === null) {
                        move.push([yRow, xCol, "normal"]);
                        continue;
                    }
                    // arret de la recherche si la case est occupée :
                    // - par une piece de la couleur opposée
                    if(grid[yRow][xCol]?.color !== this.color) {
                        move.push([yRow, xCol, "prise"]);
                        break;
                    }
                    // - par une piece de la même couleur
                    if(grid[yRow][xCol]?.color === this.color) {
                        break;
                    }
                }
            }
        } else if(this.piece === "r") {
            // coups normaux
            const DIRS = [
                // droite
                [1, 1],
                [1, 0],
                [1, -1],
                // milieu
                [0, 1],
                [0, -1],
                // gauche
                [-1, 1],
                [-1, 0],
                [-1, -1]
            ]

            DIRS.forEach((dir) => {
                // coups en dehors du plateau
                if(
                    row + dir[0] > 7 ||
                    row + dir[0] < 0 ||

                    col + dir[1] > 7 ||
                    col + dir[1] < 0
                ) {
                    return;
                }
                // coups normaux
                if(grid[row+dir[0]][col+dir[1]] === null) {
                    move.push([row+dir[0], col+dir[1], "normal"]);
                    return;
                }
                // prises
                if(grid[row+dir[0]][col+dir[1]]?.color !== this.color) {
                    move.push([row+dir[0], col+dir[1], "prise"]);
                    return;
                }
            });

            // roques (castling)
            const canRook = rooks[this.color];
            // canRook.king / leftRook / rightRook are treated as "hasMoved" flags (false = not moved)
            if (!canRook.king) {
                // kingside (rook on the right at col 7)
                if (
                    col + 2 <= 7 &&
                    !canRook.rightRook &&
                    grid[row][col + 1] === null &&
                    grid[row][col + 2] === null &&
                    grid[row][7]?.piece === "t" &&
                    grid[row][7]?.color === this.color
                ) {
                    move.push([row, col + 2, "roque"]);
                }

                // queenside (rook on the left at col 0)
                if (
                    col - 2 >= 0 &&
                    !canRook.leftRook &&
                    grid[row][col - 1] === null &&
                    grid[row][col - 2] === null &&
                    grid[row][col - 3] === null &&
                    grid[row][0]?.piece === "t" &&
                    grid[row][0]?.color === this.color
                ) {
                    move.push([row, col - 2, "roque"]);
                }
            }
        } else {
            return;
        }

        return move;
    }

    showAllPossibleMoves(moves) {
        // suppression des poins déjà existants
        document.querySelectorAll(".selected").forEach((e) => {
            e.classList.remove("selected");
        });
        document.querySelectorAll(".greyPoint").forEach((point) => {
            point.remove();
        });
        document.querySelectorAll(".redPoint").forEach((point) => {
            point.remove();
        });
        document.querySelectorAll(".bluePoint").forEach((point) => {
            point.remove();
        });
        document.querySelectorAll(".yellowPoint").forEach((point) => {
            point.remove();
        });
        // affichage des points
        moves.forEach(move => {
            if(move[2] === "normal") {
                const point = document.createElement("div");
                point.className = "greyPoint";
                const cell = document.querySelector(`
                    [data-row="${move[0]}"][data-col="${move[1]}"]`
                );
                cell.appendChild(point);
            } else if(move[2] === "prise") {
                const point = document.createElement("div");
                point.className = "redPoint";
                const cell = document.querySelector(`
                    [data-row="${move[0]}"][data-col="${move[1]}"]`
                );
                cell.appendChild(point);
            } else if(move[2] === "roque") {
                const point = document.createElement("div");
                point.className = "bluePoint";
                const cell = document.querySelector(`
                    [data-row="${move[0]}"][data-col="${move[1]}"]`
                );
                cell.appendChild(point);
            } else if(move[2] === "priseEnPassant") {
                const point = document.createElement("div");
                point.className = "yellowPoint";
                const cell = document.querySelector(`
                    [data-row="${move[0]}"][data-col="${move[1]}"]`
                );
                cell.appendChild(point);
            } else {
                return;
            }
        });
    }
    // détecte si une case est attaquée dans la position donnée
    isAttked(position, row, col, boardDir = true, lastMove = null, rooks = null) {
        const castling = rooks || {
            b: { leftRook: true, rightRook: true, king: true },
            n: { leftRook: true, rightRook: true, king: true }
        };
        const target = position[row][col];
        const targetColor = target?.color;

        for (let fromRow = 0; fromRow < position.length; fromRow++) {
            for (let fromCol = 0; fromCol < position[fromRow].length; fromCol++) {
                const piece = position[fromRow][fromCol];
                if (!piece || piece.color === targetColor) continue;

                if (piece.piece === "p") {
                    const direction = (
                        (piece.color === "b" && boardDir) ||
                        (piece.color === "n" && !boardDir)
                    ) ? -1 : 1;
                    if (
                        row - fromRow === direction &&
                        Math.abs(col - fromCol) === 1
                    ) return true;
                    continue;
                }

                const moves = piece.getAllMoves(
                    position,
                    boardDir,
                    fromRow,
                    fromCol,
                    lastMove,
                    castling
                ) || [];
                if (moves.some(
                    (move) =>
                        move[2] !== "roque" &&
                        move[0] === row &&
                        move[1] === col
                )) {
                    return true;
                }
            }
        }
        return false;
    }

    // détection des échecs (roi = "r")
    check(position, boardDir = true, lastMove = null, rooks = null) {
        for (let row = 0; row < position.length; row++) {
            for (let col = 0; col < position[row].length; col++) {
                if (
                    position[row][col]?.piece === "r" &&
                    this.isAttked(position, row, col, boardDir, lastMove, rooks)
                ) return true;
            }
        }
        return false;
    }
}

export default Pieces;