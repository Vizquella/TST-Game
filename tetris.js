// tetris.js - Core Tetris Game Logic with SRS Wall Kicks & 7-Bag Randomizer

const COLS = 10;
const ROWS = 20;
const HIDDEN_ROWS = 4;
const TOTAL_ROWS = ROWS + HIDDEN_ROWS;

// Standard Tetromino definitions (matrices in initial rotation 0)
const TETROMINOES = {
    I: {
        id: 'I',
        colorIndex: 0,
        shapes: [
            [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
            [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
            [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
        ]
    },
    J: {
        id: 'J',
        colorIndex: 1,
        shapes: [
            [[1,0,0], [1,1,1], [0,0,0]],
            [[0,1,1], [0,1,0], [0,1,0]],
            [[0,0,0], [1,1,1], [0,0,1]],
            [[0,1,0], [0,1,0], [1,1,0]]
        ]
    },
    L: {
        id: 'L',
        colorIndex: 2,
        shapes: [
            [[0,0,1], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,0], [0,1,1]],
            [[0,0,0], [1,1,1], [1,0,0]],
            [[1,1,0], [0,1,0], [0,1,0]]
        ]
    },
    O: {
        id: 'O',
        colorIndex: 3,
        shapes: [
            [[1,1], [1,1]],
            [[1,1], [1,1]],
            [[1,1], [1,1]],
            [[1,1], [1,1]]
        ]
    },
    S: {
        id: 'S',
        colorIndex: 4,
        shapes: [
            [[0,1,1], [1,1,0], [0,0,0]],
            [[0,1,0], [0,1,1], [0,0,1]],
            [[0,0,0], [0,1,1], [1,1,0]],
            [[1,0,0], [1,1,0], [0,1,0]]
        ]
    },
    T: {
        id: 'T',
        colorIndex: 5,
        shapes: [
            [[0,1,0], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,1], [0,1,0]],
            [[0,0,0], [1,1,1], [0,1,0]],
            [[0,1,0], [1,1,0], [0,1,0]]
        ]
    },
    Z: {
        id: 'Z',
        colorIndex: 6,
        shapes: [
            [[1,1,0], [0,1,1], [0,0,0]],
            [[0,0,1], [0,1,1], [0,1,0]],
            [[0,0,0], [1,1,0], [0,1,1]],
            [[0,1,0], [1,1,0], [1,0,0]]
        ]
    }
};

const PIECE_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// Super Rotation System (SRS) Kick Tables
// Format: [xOffset, yOffset] (positive Y is down towards floor in grid coords)
const JLSTZ_KICKS = {
    '0->1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '1->0': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    '1->2': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    '2->1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '2->3': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '3->2': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '3->0': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '0->3': [[0,0], [1,0], [1,-1], [0,2], [1,2]]
};

const I_KICKS = {
    '0->1': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
    '1->0': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
    '1->2': [[0,0], [-1,0], [2,0], [-1,-2], [2,1]],
    '2->1': [[0,0], [1,0], [-2,0], [1,2], [-2,-1]],
    '2->3': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
    '3->2': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
    '3->0': [[0,0], [1,0], [-2,0], [1,2], [-2,-1]],
    '0->3': [[0,0], [-1,0], [2,0], [-1,-2], [2,1]]
};

class TetrisGame {
    constructor() {
        this.board = this.createBoard();
        this.bag = [];
        this.nextQueue = [];
        this.heldPiece = null;
        this.canHold = true;
        
        this.currentPiece = null;
        this.ghostY = 0;
        
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = -1;
        this.b2b = false;
        
        this.highScore = parseInt(localStorage.getItem('tetris3d_highscore') || '0', 10);
        
        this.isGameOver = false;
        this.isPaused = false;
        
        this.dropTimer = 0;
        this.dropInterval = 800;
        this.lockDelay = 500;
        this.lockTimer = 0;
        this.isLocking = false;
        this.lockMoves = 0;
        const MAX_LOCK_MOVES = 15;
        this.MAX_LOCK_MOVES = MAX_LOCK_MOVES;
        
        // Listeners
        this.onEvent = null;
        
        this.init();
    }

    createBoard() {
        const board = [];
        for (let r = 0; r < TOTAL_ROWS; r++) {
            board.push(new Array(COLS).fill(0));
        }
        return board;
    }

    init() {
        this.board = this.createBoard();
        this.bag = [];
        this.nextQueue = [];
        this.heldPiece = null;
        this.canHold = true;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = -1;
        this.b2b = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.dropInterval = this.getSpeedForLevel(this.level);
        
        // Fill initial queue (at least 4 pieces)
        while (this.nextQueue.length < 4) {
            this.refillBagIfNeeded();
            this.nextQueue.push(this.bag.pop());
        }
        
        this.spawnNextPiece();
    }

    refillBagIfNeeded() {
        if (this.bag.length === 0) {
            const newBag = [...PIECE_NAMES];
            // Fisher-Yates shuffle
            for (let i = newBag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
            }
            this.bag = newBag;
        }
    }

    spawnNextPiece() {
        this.refillBagIfNeeded();
        const type = this.nextQueue.shift();
        this.nextQueue.push(this.bag.pop());
        
        const pieceData = TETROMINOES[type];
        const shape = pieceData.shapes[0];
        
        // Initial spawn position: centered horizontally, in hidden rows
        const x = Math.floor((COLS - shape[0].length) / 2);
        const y = HIDDEN_ROWS - 2; // spawn near visible top
        
        this.currentPiece = {
            type: type,
            shapeIndex: 0,
            x: x,
            y: y,
            colorIndex: pieceData.colorIndex
        };

        this.canHold = true;
        this.isLocking = false;
        this.lockTimer = 0;
        this.lockMoves = 0;

        // Check if spawn position collides (immediate game over)
        if (this.collides(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shapeIndex)) {
            this.isGameOver = true;
            this.saveHighScore();
            this.emit('gameOver', { score: this.score, lines: this.lines, level: this.level, highScore: this.highScore });
            return;
        }

        this.updateGhost();
        this.emit('spawn', { piece: this.currentPiece, nextQueue: this.nextQueue, ghostY: this.ghostY });
    }

    getPieceMatrix(type, shapeIndex) {
        return TETROMINOES[type].shapes[shapeIndex];
    }

    collides(x, y, shapeIndex, pieceType = null) {
        const type = pieceType || this.currentPiece.type;
        const matrix = this.getPieceMatrix(type, shapeIndex);
        
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const boardX = x + c;
                    const boardY = y + r;

                    // Bounds check
                    if (boardX < 0 || boardX >= COLS) return true;
                    if (boardY >= TOTAL_ROWS) return true;
                    if (boardY < 0) continue; // Allow piece to exist above buffer temporarily
                    
                    // Occupied cell check
                    if (this.board[boardY][boardX] !== 0) return true;
                }
            }
        }
        return false;
    }

    updateGhost() {
        if (!this.currentPiece) return;
        let gy = this.currentPiece.y;
        while (!this.collides(this.currentPiece.x, gy + 1, this.currentPiece.shapeIndex)) {
            gy++;
        }
        this.ghostY = gy;
    }

    moveLeft() {
        if (this.isGameOver || this.isPaused || !this.currentPiece) return false;
        if (!this.collides(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shapeIndex)) {
            this.currentPiece.x--;
            this.onPieceManipulated();
            this.updateGhost();
            this.emit('move', { piece: this.currentPiece, ghostY: this.ghostY });
            return true;
        }
        return false;
    }

    moveRight() {
        if (this.isGameOver || this.isPaused || !this.currentPiece) return false;
        if (!this.collides(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shapeIndex)) {
            this.currentPiece.x++;
            this.onPieceManipulated();
            this.updateGhost();
            this.emit('move', { piece: this.currentPiece, ghostY: this.ghostY });
            return true;
        }
        return false;
    }

    rotate(direction = 1) { // 1 = clockwise, -1 = counter-clockwise
        if (this.isGameOver || this.isPaused || !this.currentPiece) return false;
        if (this.currentPiece.type === 'O') return false; // O piece doesn't rotate

        const currentRot = this.currentPiece.shapeIndex;
        const nextRot = (currentRot + direction + 4) % 4;
        const transitionKey = `${currentRot}->${nextRot}`;

        const kickTable = (this.currentPiece.type === 'I') ? I_KICKS : JLSTZ_KICKS;
        const kicks = kickTable[transitionKey] || [[0,0]];

        for (let i = 0; i < kicks.length; i++) {
            const [dx, dy] = kicks[i];
            // SRS y offset: in standard guideline, +y is up, in our grid array +y is down, so invert dy
            const testX = this.currentPiece.x + dx;
            const testY = this.currentPiece.y - dy;

            if (!this.collides(testX, testY, nextRot)) {
                this.currentPiece.x = testX;
                this.currentPiece.y = testY;
                this.currentPiece.shapeIndex = nextRot;
                this.onPieceManipulated();
                this.updateGhost();
                this.emit('rotate', { piece: this.currentPiece, ghostY: this.ghostY });
                return true;
            }
        }
        return false;
    }

    onPieceManipulated() {
        if (this.isLocking && this.lockMoves < this.MAX_LOCK_MOVES) {
            this.lockTimer = 0;
            this.lockMoves++;
        }
    }

    softDrop() {
        if (this.isGameOver || this.isPaused || !this.currentPiece) return false;
        if (!this.collides(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shapeIndex)) {
            this.currentPiece.y++;
            this.score += 1; // Soft drop point
            this.updateGhost();
            this.emit('softDrop', { piece: this.currentPiece, score: this.score });
            return true;
        } else {
            this.isLocking = true;
            return false;
        }
    }

    hardDrop() {
        if (this.isGameOver || this.isPaused || !this.currentPiece) return;
        this.updateGhost();
        const dropDist = this.ghostY - this.currentPiece.y;
        this.currentPiece.y = this.ghostY;
        this.score += dropDist * 2; // Hard drop points

        this.emit('hardDrop', { piece: this.currentPiece, dropDist: dropDist, score: this.score });
        this.lockPiece();
    }

    hold() {
        if (this.isGameOver || this.isPaused || !this.canHold || !this.currentPiece) return false;

        const currentType = this.currentPiece.type;
        if (this.heldPiece === null) {
            this.heldPiece = currentType;
            this.spawnNextPiece();
        } else {
            const temp = this.heldPiece;
            this.heldPiece = currentType;
            
            const pieceData = TETROMINOES[temp];
            const shape = pieceData.shapes[0];
            const x = Math.floor((COLS - shape[0].length) / 2);
            const y = HIDDEN_ROWS - 2;

            this.currentPiece = {
                type: temp,
                shapeIndex: 0,
                x: x,
                y: y,
                colorIndex: pieceData.colorIndex
            };
            this.updateGhost();
        }

        this.canHold = false;
        this.emit('hold', { heldPiece: this.heldPiece, currentPiece: this.currentPiece, nextQueue: this.nextQueue });
        return true;
    }

    lockPiece() {
        const matrix = this.getPieceMatrix(this.currentPiece.type, this.currentPiece.shapeIndex);
        const colorVal = this.currentPiece.colorIndex + 1; // 1-7
        
        let lockedAbove = true;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const bx = this.currentPiece.x + c;
                    const by = this.currentPiece.y + r;
                    if (by >= 0 && by < TOTAL_ROWS && bx >= 0 && bx < COLS) {
                        this.board[by][bx] = colorVal;
                        if (by >= HIDDEN_ROWS) {
                            lockedAbove = false;
                        }
                    }
                }
            }
        }

        // Lock out check (all blocks above visible playfield)
        if (lockedAbove) {
            this.isGameOver = true;
            this.saveHighScore();
            this.emit('gameOver', { score: this.score, lines: this.lines, level: this.level, highScore: this.highScore });
            return;
        }

        this.emit('lock', { piece: this.currentPiece, board: this.board });
        this.checkLineClears();
    }

    checkLineClears() {
        const clearedIndices = [];
        
        for (let r = TOTAL_ROWS - 1; r >= HIDDEN_ROWS; r--) {
            let full = true;
            for (let c = 0; c < COLS; c++) {
                if (this.board[r][c] === 0) {
                    full = false;
                    break;
                }
            }
            if (full) {
                clearedIndices.push(r);
            }
        }

        if (clearedIndices.length > 0) {
            const count = clearedIndices.length;
            this.lines += count;
            this.combo++;

            // Scoring system
            const linePoints = [0, 100, 300, 500, 800];
            let baseScore = (linePoints[count] || 800) * this.level;
            
            // Back-to-back bonus for Tetris
            if (count === 4) {
                if (this.b2b) {
                    baseScore = Math.floor(baseScore * 1.5);
                }
                this.b2b = true;
            } else {
                this.b2b = false;
            }

            // Combo bonus
            if (this.combo > 0) {
                baseScore += 50 * this.combo * this.level;
            }

            this.score += baseScore;

            // Level up check (every 10 lines)
            const newLevel = Math.floor(this.lines / 10) + 1;
            const leveledUp = newLevel > this.level;
            this.level = newLevel;
            this.dropInterval = this.getSpeedForLevel(this.level);

            this.saveHighScore();

            // Notify clear event for animation
            this.emit('lineClear', {
                clearedIndices: clearedIndices.map(r => r - HIDDEN_ROWS), // Relative to visible board (0..19)
                rawIndices: clearedIndices,
                linesCount: count,
                score: this.score,
                lines: this.lines,
                level: this.level,
                combo: this.combo,
                b2b: this.b2b,
                leveledUp: leveledUp
            });

            // Remove rows from board
            clearedIndices.forEach(rowIdx => {
                this.board.splice(rowIdx, 1);
                this.board.unshift(new Array(COLS).fill(0));
            });

            // Spawn next piece after brief clear animation
            setTimeout(() => {
                if (!this.isGameOver) {
                    this.spawnNextPiece();
                }
            }, 180);
        } else {
            this.combo = -1;
            this.spawnNextPiece();
        }
    }

    getSpeedForLevel(level) {
        // Guideline approximate ms
        const speeds = [
            800, 715, 632, 549, 468, 388, 310, 236, 168, 120,
            100, 80, 65, 50, 40, 30, 25, 20, 15, 12
        ];
        return speeds[Math.min(level - 1, speeds.length - 1)];
    }

    update(dt) {
        if (this.isGameOver || this.isPaused || !this.currentPiece) return;

        // Check if piece is on ground
        const onGround = this.collides(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shapeIndex);

        if (onGround) {
            this.isLocking = true;
            this.lockTimer += dt;
            if (this.lockTimer >= this.lockDelay) {
                this.lockPiece();
            }
        } else {
            this.isLocking = false;
            this.lockTimer = 0;
            this.dropTimer += dt;
            if (this.dropTimer >= this.dropInterval) {
                this.dropTimer = 0;
                this.currentPiece.y++;
                this.updateGhost();
                this.emit('dropTick', { piece: this.currentPiece });
            }
        }
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('tetris3d_highscore', this.highScore.toString());
            } catch (e) {}
        }
    }

    togglePause() {
        if (this.isGameOver) return false;
        this.isPaused = !this.isPaused;
        this.emit('pause', { isPaused: this.isPaused });
        return this.isPaused;
    }

    restart() {
        this.init();
        this.emit('restart', {});
    }

    emit(eventName, data) {
        if (this.onEvent) {
            this.onEvent(eventName, data);
        }
    }
}

window.TetrisGame = TetrisGame;
window.COLS = COLS;
window.ROWS = ROWS;
window.HIDDEN_ROWS = HIDDEN_ROWS;
window.TETROMINOES = TETROMINOES;
