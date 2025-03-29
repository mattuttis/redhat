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

            // Create background img
            this.createBackgroundImg();
            this.vpContext = vpContext;

            this.mapX = 0;
        }

        draw() {
            vpContext.clearRect(0, 0, 600, 400);
            vpContext.drawImage(this.backgroundImg, this.mapX, 0);
        }

        createBackgroundImg() {
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
        }
    }

    class Metrics {
        constructor(player) {
            this.player = player;
        }

        update() {
            document.getElementById('xPlayer').innerText = this.player.x;
            document.getElementById('yPlayer').innerText = this.player.y;
            document.getElementById('jumpStep').innerText = this.player.jumpStep;
            document.getElementById('jumped').innerText = this.player.jumped
            document.getElementById('jumping').innerText = this.player.jumping
            document.getElementById('grounded').innerText = this.player.grounded;
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
            this.maxHeightJump = 100;
            this.jumped = 0;
            this.jumpStep = 0;
            this.grounded = false;
        }

        draw() {
            vpContext.fillStyle = 'white';
            vpContext.fillRect(this.x, this.y, this.width, this.height);
        }

        update(input) {
            this.handleJump(input);
            if (input.keys.indexOf('ArrowRight') > -1) {
                if (!this.hittingLeftSideTile()) {
                    background.mapX--;
                }
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                if (!this.hittingRightSideTile()) {
                    background.mapX++;
                }
            }  else {
                if (this.jumping) {
                    return;
                }
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
                        this.jumped = 0;
                        this.lastHorizontalMove = 0;
                    }
                }
            }
        }

        handleJump(input) {
            if (input.keys.indexOf(' ') > -1) {
                if (!this.grounded && !this.jumping) {
                    return;
                }
                this.jumping = true;

                if (this.jumped >= this.maxHeightJump) {
                    this.jumping = false;
                    this.jumpStep = 0;
                    return;
                }

                this.grounded = false;

                if (this.jumped < 50) {
                    this.jumpStep = 5;
                } else if (this.jumped >= 50 && this.jumped < 75) {
                    this.jumpStep = 3;
                } else if (this.jumped >= 75) {
                    this.jumpStep = 1;
                }

                if (!this.hittingCeiling(-this.jumpStep)) {
                    this.y = this.y - this.jumpStep;
                    this.jumped += this.jumpStep;
                    console.log('jumpStep', this.jumpStep);
                    console.log('jumped', this.jumped);
                    console.log('this.y', this.y);
                } else if ((this.jumpStep -1) > 0 && !this.hittingCeiling(-(this.jumpStep -1))) {
                    this.y = this.y - (this.jumpStep - 1);
                    this.jumped += this.jumpStep -1;
                    console.log('jumpStep', this.jumpStep);
                    console.log('jumped', this.jumped);
                    console.log('this.y', this.y);
                } else if ((this.jumpStep -2) > 0 && !this.hittingCeiling(-(this.jumpStep -2))) {
                    this.y = this.y - (this.jumpStep - 2);
                    this.jumped += this.jumpStep -2;
                    console.log('jumpStep', this.jumpStep);
                    console.log('jumped', this.jumped);
                    console.log('this.y', this.y);
                } else if ((this.jumpStep -3) > 0 && !this.hittingCeiling(-(this.jumpStep -3))) {
                    this.y = this.y - (this.jumpStep - 3);
                    this.jumped += this.jumpStep -3;
                    console.log('jumpStep', this.jumpStep);
                    console.log('jumped', this.jumped);
                    console.log('this.y', this.y);
                } else if ((this.jumpStep -4) > 0 && !this.hittingCeiling(-(this.jumpStep -4))) {
                    this.y = this.y - (this.jumpStep - 4);
                    this.jumped += this.jumpStep -4;
                    console.log('jumpStep', this.jumpStep);
                    console.log('jumped', this.jumped);
                    console.log('this.y', this.y);
                }
                console.log('---');
            } else {
                // if (this.jumping) {
                    this.jumping = false;
                    this.jumpStep = 0;
                    this.jumped = 0;
                // }
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
                            this.grounded = true;
                            return true;
                        }
                    }
                }
            }
            this.grounded = false;
            return false;
        }

        hittingCeiling(deltaY) {
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

