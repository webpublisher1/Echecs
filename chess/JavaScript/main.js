import Game from "./game.js";
let game;

const init = `<label>Niveau de l'IA</label><br>
        <input id="level" type="range" min="1" max="500" value="3" step="1">
        <div id="indicator">3</div>
        <br><br><br><br>
        <label>Vous allez jouer en tant que</label><br><br>
        <div>
        <label>blanc</label>
        <input 
            id="color" 
            type="range" 
            min="0" max="1" 
            value="1" 
            style="width: 30px;"
        >
        <label>noir</label></div>
        <br /><br /><br />

        <div id="button">Jouer</div>`;

document.addEventListener("DOMContentLoaded", () => {
    const plateau = document.getElementById("presentation");
    if(!plateau) {
        alert("Impossible de charger la page !");
        return;
    }
    plateau.innerHTML = init;
    document.getElementById("level").addEventListener("input", (e) => {
        const indicator = document.getElementById("indicator");
        indicator.textContent = e.target.value;
    });
    document.getElementById("button").addEventListener("click", () => {
        plateau.id = "plateau";
        const iaLevel = Number(document.getElementById("level").value);
        if(document.getElementById("color").value === "1") {
            game = new Game(true, iaLevel);
        } else {
            game = new Game(false, iaLevel);
        }
    });
});