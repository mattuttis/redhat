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
                [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [2, 2, 2, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],];
            this.requestScrolling = false;

            // Create background img
            this.createBackgroundImg();
            this.vpContext = vpContext;

            this.mapX = 0;
            this.xViewportMap = 0;
        }

        draw() {
            vpContext.clearRect(0, 0, 600, 400);
            vpContext.drawImage(this.backgroundImg, -this.xViewportMap, 0);
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

        scrollRight() {
            this.xViewportMap++;
            this.mapX--;
        }

        scrollLeft() {
            this.xViewportMap--;
            this.mapX++;
        }
    }

    class Metrics {
        constructor(player, background) {
            this.player = player;
            this.background = background;
        }

        update() {
            document.getElementById('xPlayer').innerText = this.player.x;
            document.getElementById('yPlayer').innerText = this.player.y;
            document.getElementById('mapX').innerText = this.background.mapX;
            document.getElementById('jumpStep').innerText = this.player.jumpStep;
            document.getElementById('jumped').innerText = this.player.jumped
            document.getElementById('jumping').innerText = this.player.jumping
            document.getElementById('grounded').innerText = this.player.grounded;
            document.getElementById('fallStep').innerText = this.player.roundedFallStep;
        }
    }

    class Player {
        constructor(vpContext, background) {
            this.vpContext = vpContext;
            this.background = background;
            this.xPlayerInViewport = 300;
            this.yPlayerInViewport = 150;
            this.playerWidth = 25;
            this.playerHeight = 25;
            this.jumping = false;
            this.lastHorizontalMove = 0; // 1: left; 2: right
            this.maxHeightJump = 100;
            this.jumped = 0;
            this.jumpStep = 0;
            this.fallStep = 1;
            this.roundedFallStep = 1;
            this.grounded = false;
            this.gradientFallStep = 1.03;
        }

        draw() {
            vpContext.fillStyle = 'white';
            vpContext.fillRect(this.xPlayerInViewport, this.yPlayerInViewport, this.playerWidth, this.playerHeight);
        }

        update(input) {
            this.handleJump(input);
            if (input.keys.indexOf('ArrowRight') > -1) {
                if (!this.hittingLeftSideTile()) {
                    background.scrollRight();
                }
            }
            if (input.keys.indexOf('ArrowLeft') > -1) {
                if (!this.hittingRightSideTile()) {
                    background.scrollLeft();
                }
            }

            if (this.jumping) {
                return;
            }
            if (!this.hittingGround(Math.round(this.fallStep * this.gradientFallStep))) {
                this.fallStep = this.fallStep * this.gradientFallStep;
                this.roundedFallStep = Math.floor(this.fallStep);
                this.yPlayerInViewport += this.roundedFallStep;
                if (this.jumping) {
                    if (this.lastHorizontalMove === 1) {
                        if (!this.hittingRightSideTile()) {
                            var cx = this.yPlayerInViewport;
                            var movingLeft = cx % 2 === 0 ? 1 : 0;
                            this.xPlayerInViewport = this.xPlayerInViewport - movingLeft;
                        }
                    } else if (this.lastHorizontalMove === 2) {
                        if (!this.hittingLeftSideTile()) {
                            this.xPlayerInViewport++;
                        }
                    }
                }
            } else {
                if (this.jumping) {
                    this.jumping = false;
                    this.jumped = 0;
                    this.lastHorizontalMove = 0;
                    this.fallStep = 1;
                    this.roundedFallStep = 1;
                }
                this.fallStep = 1;
                this.roundedFallStep = 1;
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
                    this.yPlayerInViewport = this.yPlayerInViewport - this.jumpStep;
                    this.jumped += this.jumpStep;
                } else if ((this.jumpStep - 1) > 0 && !this.hittingCeiling(-(this.jumpStep - 1))) {
                    this.yPlayerInViewport = this.yPlayerInViewport - (this.jumpStep - 1);
                    this.jumped += this.jumpStep - 1;
                } else if ((this.jumpStep - 2) > 0 && !this.hittingCeiling(-(this.jumpStep - 2))) {
                    this.yPlayerInViewport = this.yPlayerInViewport - (this.jumpStep - 2);
                    this.jumped += this.jumpStep - 2;
                } else if ((this.jumpStep - 3) > 0 && !this.hittingCeiling(-(this.jumpStep - 3))) {
                    this.yPlayerInViewport = this.yPlayerInViewport - (this.jumpStep - 3);
                    this.jumped += this.jumpStep - 3;
                } else if ((this.jumpStep - 4) > 0 && !this.hittingCeiling(-(this.jumpStep - 4))) {
                    this.yPlayerInViewport = this.yPlayerInViewport - (this.jumpStep - 4);
                    this.jumped += this.jumpStep - 4;
                }
                console.log('---');
            } else {
                this.jumping = false;
                this.jumpStep = 0;
                this.jumped = 0;
            }
        }

        hittingGround(roundedFallStep) {
            // TODO: calculate which tiles to test
            var xBeginPlayerMap = this.xPlayerInViewport + background.xViewportMap;
            var xEndPlayerMap = this.xPlayerInViewport + 24 + background.xViewportMap;
            var yBottomPlayerMap = this.yPlayerInViewport + 24;

            for (var i = 0; i < this.background.map.length; i++) {
                for (var j = 0; j < this.background.map[i].length; j++) {

                    if (this.background.map[i][j] !== 0) {
                        // we have ground


                        var xBeginTileMap = j * 50;
                        var xEndTileMap = xBeginTileMap + 49;
                        var yTopTileMap = i * 50;

                        if (((xBeginPlayerMap >= xBeginTileMap && xBeginPlayerMap <= xEndTileMap) ||
                                (xEndPlayerMap >= xBeginTileMap && xEndPlayerMap <= xEndTileMap)) &&
                            (yBottomPlayerMap + roundedFallStep >= yTopTileMap && yBottomPlayerMap <= yTopTileMap + (50 - roundedFallStep))) {
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

                    var activeHorizontalTile = Math.floor((this.xPlayerInViewport - background.mapX) / 50);
                    var activeVerticalTile = Math.floor(this.yPlayerInViewport / 50);
                    if (j !== activeHorizontalTile && i !== activeVerticalTile - 1) {
                        continue;
                    }

                    if (this.background.map[i][j] !== 0) {
                        // we have ground
                        var beginPlayer = this.xPlayerInViewport - background.mapX;
                        var endPlayer = this.xPlayerInViewport + 24 - background.mapX;
                        var topPlayer = this.yPlayerInViewport;

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

                    var activeHorizontalTile = Math.floor((this.xPlayerInViewport - background.mapX) / 50);
                    if (j < activeHorizontalTile) {
                        continue;
                    }

                    if (this.background.map[i][j] !== 0) {

                        var leftPlayer = this.xPlayerInViewport - background.mapX;
                        var rightPlayer = this.xPlayerInViewport + 24 - background.mapX;
                        var topPlayer = this.yPlayerInViewport;
                        var bottomPlayer = this.yPlayerInViewport + 24;
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

                    var activeHorizontalTile = Math.floor((this.xPlayerInViewport - background.mapX) / 50);
                    if (j > activeHorizontalTile) {
                        continue;
                    }

                    if (this.background.map[i][j] !== 0) {
                        var leftPlayer = this.xPlayerInViewport - background.mapX;
                        var topPlayer = this.yPlayerInViewport;
                        var bottomPlayer = this.yPlayerInViewport + 24;

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
    const metrics = new Metrics(player, background);

    function animate() {
        background.draw();

        player.draw()
        player.update(inputHandler);

        metrics.update();
        requestAnimationFrame(animate);
    }

    animate();
});

