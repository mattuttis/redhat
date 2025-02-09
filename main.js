class Game {
    constructor() {
    }
}

window.addEventListener('load', () => {
    var elCanvas = document.getElementById("vpCanvas");
    var vpContext = elCanvas.getContext("2d");
    elCanvas.width = 600;
    elCanvas.height = 400;

    var imgGround = document.getElementById("imgGround");
    var imgSand = document.getElementById("imgSand");

    class InputHandler {
        constructor() {
            this.keys = []
            window.addEventListener("keydown", e => {
                if ((// e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' ||
                    e.key === ' ') &&
                    this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);

                    if (e.key === ' ') {
                        setTimeout(() => {
                            this.keys.splice(this.keys.indexOf(e.key))
                            console.log('Stop jump!')
                        }, 400)
                    }
                }
            });
            window.addEventListener("keyup", e => {
                if (e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                    // e.key === 'ArrowDown'
                ) {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Background {
        constructor(vpContext) {
            this.map = [
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 1, 1, 0, 0, 0, 1, 1, 1, 1,    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2,    0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2,    1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2,    2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2,    2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2,    2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],];
            this.requestScrolling = false;

            var backgroundCanvas = document.getElementById('backgroundCanvas');
            var backgroundCtx = backgroundCanvas.getContext('2d');
            for (var i = 0; i < this.map.length; i++) {
                for (var j = 0; j < this.map[i].length; j++) {
                    if (this.map[i][j] === 1) {
                        backgroundCtx.drawImage(imgGround, j * 50, i * 50);
                    }
                    if (this.map[i][j] === 2) {
                        backgroundCtx.drawImage(imgSand, j * 50, i * 50);
                    }
                }
            }
            this.backgroundImg = new Image();
            this.backgroundImg.width = 1200;
            this.backgroundImg.height = 400;
            this.backgroundImg.src = backgroundCanvas.toDataURL("image/png");

            backgroundCanvas.remove();
            this.vpContext = vpContext;

            this.mapX = 0;
        }

        draw() {
            vpContext.clearRect(0, 0, 600, 400);
            vpContext.drawImage(this.backgroundImg, this.mapX, 0);
        }
    }

    class Metrics {
        constructor(player) {
            this.player = player;
        }

        update() {
            document.getElementById("xPlayer").innerText = this.player.x;
            document.getElementById("yPlayer").innerText = this.player.y;
        }
    }

    class Player {
        constructor(vpContext, background) {
            this.vpContext = vpContext;
            this.background = background;
            this.x = 300;
            this.y = 150;
            this.width = 25;
            this.height = 25;
            this.jumping = false;
            this.lastHorizontalMove = 0; // 1: left; 2: right
            this.xRightSidePlayingField = 500;
        }

        draw() {
            vpContext.fillStyle = 'white';
            vpContext.fillRect(this.x, this.y, this.width, this.height);
        }

        update(input) {
            if (this.x >= 500) {
                console.log('BUMP');
                background.requestScrolling = true;
            }

            if (input.keys.indexOf(' ') > -1) {
                this.jumping = true;
                if (!this.hittingAboveTile(-3)) {
                    this.y = this.y - 3;
                } else if (!this.hittingAboveTile(-2)) {
                    this.y = this.y - 2;
                } if (!this.hittingAboveTile(-1)) {
                    this.y = this.y - 1;
                }
            }
            if (input.keys.indexOf('ArrowRight') > -1) {
                if (!this.hittingLeftSideTile()) {
                    background.mapX--;
                }
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                if (!this.hittingRightSideTile()) {
                    background.mapX++;
                }
            }  else {
                if (!this.hittingGround()) {
                    this.y += 1;
                    if (this.jumping) {
                        if (this.lastHorizontalMove === 1) {
                            if (!this.hittingRightSideTile()) {
                                var cx = this.y;
                                var movingLeft = cx % 2 === 0 ? 1 : 0;
                                this.x = this.x - movingLeft;
                            }
                        } else if (this.lastHorizontalMove === 2) {
                            if (!this.hittingLeftSideTile()) {
                                this.x++;
                            }
                        }
                    }
                } else {
                    if (this.jumping) {
                        this.jumping = false;
                        this.lastHorizontalMove = 0;
                    }
                }
            }
        }

        hittingGround() {
            for (var i = 0; i < this.background.map.length; i++) {
                for (var j = 0; j < this.background.map[i].length; j++) {

                    if (this.background.map[i][j] !== 0) {
                        // we have ground
                        var beginPlayer = this.x - background.mapX;
                        var endPlayer = this.x + 24 - background.mapX;
                        var bottomPlayer = this.y + 24;

                        var beginTile = j * 50;
                        var endTile = beginTile + 49;
                        var topTile = i * 50;

                        if (((beginPlayer >= beginTile && beginPlayer <= endTile) ||
                                (endPlayer >= beginTile && endPlayer <= endTile)) &&
                            (bottomPlayer + 1 >= topTile && bottomPlayer <= topTile + 49)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        hittingAboveTile(deltaY) {
            for (var i = 0; i < this.background.map.length; i++) {
                for (var j = 0; j < this.background.map[i].length; j++) {

                    var activeHorizontalTile = Math.floor((this.x - background.mapX)/ 50);
                    var activeVerticalTile = Math.floor(this.y / 50) ;
                    if (j !== activeHorizontalTile && i !== activeVerticalTile - 1) {
                        continue;
                    }

                    if (this.background.map[i][j] !== 0) {
                        // we have ground
                        var beginPlayer = this.x - background.mapX;
                        var endPlayer = this.x + 24 - background.mapX;
                        var topPlayer = this.y;

                        var beginTile = j * 50;
                        var endTile = beginTile + 49;
                        var bottomTile = i * 50 + 49;

                        if (topPlayer + 24 < i * 50) {
                            // Ignore bottom tile
                            return false;
                        }

                        if (((beginPlayer >= beginTile && beginPlayer <= endTile) ||
                                (endPlayer >= beginTile && endPlayer <= endTile)) &&
                            (topPlayer + deltaY <= bottomTile && bottomTile < topPlayer + 24)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        hittingLeftSideTile() {
            for (var i = 0; i < this.background.map.length; i++) {
                for (let j = 0; j < this.background.map[i].length; j++) {

                    var activeHorizontalTile = Math.floor((this.x - background.mapX)/ 50);
                    if (j < activeHorizontalTile) {
                        continue;
                    }

                    if (this.background.map[i][j] !== 0) {

                        var leftPlayer = this.x - background.mapX;
                        var rightPlayer = this.x + 24 - background.mapX;
                        var topPlayer = this.y;
                        var bottomPlayer = this.y + 24;
                        var topTile = i * 50;

                        var bottomTile = topTile + 49;
                        var leftTile = j * 50;// - background.mapX;

                        if (((bottomPlayer >= topTile && bottomPlayer <= bottomTile) ||
                                (topPlayer <= bottomTile && topPlayer >= topTile)) &&
                            (rightPlayer + 1 >= leftTile)) {
                            // Hit
                            return true
                        }
                    }
                }
            }
            return false;
        }

        hittingRightSideTile() {
            for (let i = 0; i < this.background.map.length; i++) {
                for (let j = 0; j < this.background.map[i].length; j++) {

                    var activeHorizontalTile = Math.floor((this.x - background.mapX) / 50);
                    if (j > activeHorizontalTile) {
                        continue;

                    }

                    if (this.background.map[i][j] !== 0) {
                        var leftPlayer = this.x - background.mapX;
                        var topPlayer = this.y;
                        var bottomPlayer = this.y + 24;

                        var topTile = i * 50;
                        var bottomTile = topTile + 49;
                        var rightTile = j * 50 + 49;

                        if (((bottomPlayer > topTile && bottomPlayer <= bottomTile) ||
                                (topPlayer <= bottomTile && topPlayer >= topTile)) &&
                            (leftPlayer - 1 <= rightTile)) {
                            return true
                        }
                    }
                }
            }
            return false;
        }
    }

    const background = new Background(vpContext);
    const inputHandler = new InputHandler();
    const player = new Player(vpContext, background);
    const metrics = new Metrics(player);

    function animate() {
        background.draw();

        player.draw()
        player.update(inputHandler);

        metrics.update();
        requestAnimationFrame(animate);
    }

    animate();
});

