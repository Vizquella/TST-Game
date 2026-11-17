// main.js - Application Orchestrator: UI, Input Handlers, Game Loop & Mini Previews

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Components
    const renderer = new Tetris3DRenderer('canvas-3d');
    const game = new TetrisGame();
    const sound = window.soundEngine;

    // UI Elements
    const scoreVal = document.getElementById('stat-score');
    const highScoreVal = document.getElementById('stat-high-score');
    const linesVal = document.getElementById('stat-lines');
    const levelVal = document.getElementById('stat-level');
    const centerToast = document.getElementById('center-toast');
    
    // Modals
    const gameOverModal = document.getElementById('game-over-modal');
    const pauseModal = document.getElementById('pause-modal');
    const helpModal = document.getElementById('help-modal');
    const finalScoreVal = document.getElementById('final-score');
    const finalLinesVal = document.getElementById('final-lines');
    const finalLevelVal = document.getElementById('final-level');

    // Mini Canvases
    const holdCanvas = document.getElementById('hold-canvas');
    const holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;
    const nextCanvases = [
        document.getElementById('next-canvas-1'),
        document.getElementById('next-canvas-2'),
        document.getElementById('next-canvas-3')
    ].map(c => c ? c.getContext('2d') : null);

    // Initial Stats
    highScoreVal.textContent = game.highScore.toLocaleString();

    // 2. Event Dispatcher from Tetris Core to 3D Renderer & Audio & UI
    game.onEvent = (eventName, data) => {
        switch (eventName) {
            case 'spawn':
                renderer.renderActivePiece(data.piece);
                renderer.renderGhostPiece(data.piece, data.ghostY);
                updateNextPieces(data.nextQueue);
                break;
            case 'move':
                sound.playMove();
                renderer.renderActivePiece(data.piece);
                renderer.renderGhostPiece(data.piece, data.ghostY);
                break;
            case 'rotate':
                sound.playRotate();
                renderer.renderActivePiece(data.piece);
                renderer.renderGhostPiece(data.piece, data.ghostY);
                break;
            case 'dropTick':
                renderer.renderActivePiece(data.piece);
                break;
            case 'softDrop':
                sound.playSoftDrop();
                renderer.renderActivePiece(data.piece);
                scoreVal.textContent = data.score.toLocaleString();
                break;
            case 'hardDrop':
                sound.playHardDrop();
                renderer.triggerHardDropImpact(data.piece, data.dropDist);
                scoreVal.textContent = data.score.toLocaleString();
                break;
            case 'lock':
                renderer.renderBoard(data.board);
                renderer.renderActivePiece(null);
                renderer.renderGhostPiece(null, 0);
                break;
            case 'hold':
                sound.playHold();
                drawMiniPiece(holdCtx, data.heldPiece, holdCanvas.width, holdCanvas.height);
                renderer.renderActivePiece(data.currentPiece);
                renderer.renderGhostPiece(data.currentPiece, game.ghostY);
                updateNextPieces(data.nextQueue);
                break;
            case 'lineClear':
                sound.playLineClear(data.linesCount);
                renderer.triggerLineClearExplosion(data.clearedIndices, (data.linesCount >= 4 ? 6 : data.linesCount));
                
                scoreVal.textContent = data.score.toLocaleString();
                linesVal.textContent = data.lines.toString();
                levelVal.textContent = data.level.toString();
                highScoreVal.textContent = game.highScore.toLocaleString();

                // Toast Celebration
                if (data.linesCount === 4) {
                    showToast(data.b2b ? 'BACK-TO-BACK TETRIS!' : 'TETRIS!!');
                } else if (data.linesCount === 3) {
                    showToast('TRIPLE CLEAR!');
                } else if (data.combo > 1) {
                    showToast(`COMBO x${data.combo}!`);
                }

                if (data.leveledUp) {
                    sound.playLevelUp();
                    setTimeout(() => showToast(`LEVEL UP: ${data.level}!`), 400);
                }

                setTimeout(() => {
                    renderer.renderBoard(game.board);
                }, 160);
                break;
            case 'gameOver':
                sound.playGameOver();
                finalScoreVal.textContent = data.score.toLocaleString();
                finalLinesVal.textContent = data.lines.toString();
                finalLevelVal.textContent = data.level.toString();
                gameOverModal.classList.add('active');
                break;
            case 'pause':
                if (data.isPaused) {
                    pauseModal.classList.add('active');
                } else {
                    pauseModal.classList.remove('active');
                }
                break;
            case 'restart':
                gameOverModal.classList.remove('active');
                pauseModal.classList.remove('active');
                scoreVal.textContent = '0';
                linesVal.textContent = '0';
                levelVal.textContent = '1';
                drawMiniPiece(holdCtx, null, holdCanvas.width, holdCanvas.height);
                renderer.renderBoard(game.board);
                renderer.renderActivePiece(game.currentPiece);
                renderer.renderGhostPiece(game.currentPiece, game.ghostY);
                updateNextPieces(game.nextQueue);
                break;
        }
    };

    // 3. Mini Preview Drawing with 3D Beveled Look
    function drawMiniPiece(ctx, pieceType, width, height) {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        if (!pieceType) return;

        const pieceData = window.TETROMINOES[pieceType];
        const shape = pieceData.shapes[0];
        const theme = renderer.themes[renderer.currentTheme];
        const hexColor = '#' + theme.palette[pieceData.colorIndex].toString(16).padStart(6, '0');

        const rows = shape.length;
        const cols = shape[0].length;
        const cellSize = Math.min((width - 16) / cols, (height - 16) / rows, 18);

        const offsetX = (width - cols * cellSize) / 2;
        const offsetY = (height - rows * cellSize) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c]) {
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize;
                    
                    // Main block body
                    ctx.fillStyle = hexColor;
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

                    // Top/Left highlight for 3D bevel
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, 2);
                    ctx.fillRect(x + 1, y + 1, 2, cellSize - 2);

                    // Bottom/Right shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(x + 1, y + cellSize - 3, cellSize - 2, 2);
                    ctx.fillRect(x + cellSize - 3, y + 1, 2, cellSize - 2);
                }
            }
        }
    }

    function updateNextPieces(queue) {
        for (let i = 0; i < nextCanvases.length; i++) {
            const ctx = nextCanvases[i];
            const canvasElem = ctx ? ctx.canvas : null;
            if (ctx && canvasElem && queue[i]) {
                drawMiniPiece(ctx, queue[i], canvasElem.width, canvasElem.height);
            }
        }
    }

    function redrawAllMiniPreviews() {
        if (holdCtx && holdCanvas) {
            drawMiniPiece(holdCtx, game.heldPiece, holdCanvas.width, holdCanvas.height);
        }
        updateNextPieces(game.nextQueue);
    }

    // 4. Center Toast Notification Helper
    let toastTimeout = null;
    function showToast(text) {
        if (toastTimeout) clearTimeout(toastTimeout);
        centerToast.textContent = text;
        centerToast.classList.add('show');
        toastTimeout = setTimeout(() => {
            centerToast.classList.remove('show');
        }, 1100);
    }

    // 5. Theme Switching Logic
    const themeButtons = document.querySelectorAll('.theme-btn');
    function selectTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        renderer.applyTheme(themeName);
        sound.setTheme(themeName);
        redrawAllMiniPreviews();
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.init();
            selectTheme(btn.dataset.theme);
        });
    });

    // Haptic Feedback for Mobile Devices
    function triggerHaptic(duration = 15) {
        if (navigator.vibrate) {
            try { navigator.vibrate(duration); } catch(e) {}
        }
    }

    // 6. Camera Presets (Desktop & Mobile Header Cycle Button)
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderer.setCameraPreset(btn.dataset.preset);
        });
    });

    const camCycleBtn = document.getElementById('btn-cam-cycle');
    const cameraPresetsList = ['default', 'classic', 'isometric', 'top'];
    let currentCamIndex = 0;
    if (camCycleBtn) {
        camCycleBtn.addEventListener('click', () => {
            sound.init();
            triggerHaptic(20);
            currentCamIndex = (currentCamIndex + 1) % cameraPresetsList.length;
            const targetPreset = cameraPresetsList[currentCamIndex];
            renderer.setCameraPreset(targetPreset);

            presetButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.preset === targetPreset);
            });

            const presetLabels = {
                default: '3D Angled',
                classic: 'Classic 2D',
                isometric: 'Isometric',
                top: 'Top View'
            };
            showToast(`📷 ${presetLabels[targetPreset]}`);
        });
    }

    // Tap on top Hold card directly to trigger Hold piece
    const holdCardBtn = document.getElementById('hold-card-btn');
    if (holdCardBtn) {
        holdCardBtn.addEventListener('click', () => {
            sound.init();
            triggerHaptic(18);
            game.hold();
        });
    }

    // 7. Audio & Utility Controls
    const sfxBtn = document.getElementById('btn-sfx');
    const bgmBtn = document.getElementById('btn-bgm');
    const helpBtn = document.getElementById('btn-help');
    const closeHelpBtn = document.getElementById('btn-close-help');

    if (sfxBtn) {
        sfxBtn.addEventListener('click', () => {
            sound.init();
            const enabled = sound.toggleSFX();
            sfxBtn.classList.toggle('active', enabled);
            sfxBtn.textContent = enabled ? '🔊' : '🔇';
        });
    }

    if (bgmBtn) {
        bgmBtn.addEventListener('click', () => {
            sound.init();
            const enabled = sound.toggleBGM();
            bgmBtn.classList.toggle('active', enabled);
            bgmBtn.textContent = enabled ? '🎵' : '🎼';
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', () => helpModal.classList.add('active'));
    }
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => helpModal.classList.remove('active'));
    }

    // 8. Game Buttons (Restart, Resume)
    document.getElementById('btn-restart-modal').addEventListener('click', () => {
        sound.init();
        game.restart();
    });
    document.getElementById('btn-resume-modal').addEventListener('click', () => {
        game.togglePause();
    });

    // 9. Delayed Auto Shift (DAS) & Auto Repeat Rate (ARR) Keyboard Engine
    const keyState = {};
    const DAS = 140; // ms initial delay
    const ARR = 38;  // ms repeat rate
    let dasTimers = {};

    function startAutoRepeat(key, action) {
        action();
        dasTimers[key] = setTimeout(() => {
            dasTimers[key] = setInterval(action, ARR);
        }, DAS);
    }

    function stopAutoRepeat(key) {
        if (dasTimers[key]) {
            clearTimeout(dasTimers[key]);
            clearInterval(dasTimers[key]);
            delete dasTimers[key];
        }
    }

    window.addEventListener('keydown', (e) => {
        sound.init(); // Auto-start audio context on first keystroke

        if (e.repeat) return; // Prevent native browser repeat, handled by our DAS/ARR
        const key = e.key;

        if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            e.preventDefault();
            startAutoRepeat('left', () => game.moveLeft());
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            e.preventDefault();
            startAutoRepeat('right', () => game.moveRight());
        } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
            e.preventDefault();
            startAutoRepeat('down', () => game.softDrop());
        } else if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'x' || key === 'X') {
            e.preventDefault();
            game.rotate(1); // Clockwise
        } else if (key === 'z' || key === 'Z') {
            e.preventDefault();
            game.rotate(-1); // Counter-clockwise
        } else if (key === ' ') {
            e.preventDefault();
            game.hardDrop();
        } else if (key === 'c' || key === 'C' || key === 'Shift') {
            e.preventDefault();
            game.hold();
        } else if (key === 'p' || key === 'P' || key === 'Escape') {
            e.preventDefault();
            game.togglePause();
        } else if (key === 'r' || key === 'R') {
            e.preventDefault();
            game.restart();
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key;
        if (key === 'ArrowLeft' || key === 'a' || key === 'A') stopAutoRepeat('left');
        if (key === 'ArrowRight' || key === 'd' || key === 'D') stopAutoRepeat('right');
        if (key === 'ArrowDown' || key === 's' || key === 'S') stopAutoRepeat('down');
    });

    // 10. Touch / Mobile On-Screen Controls & Canvas Gesture Engine
    const bindTouchBtn = (id, onAction, autoRepeat = false) => {
        const el = document.getElementById(id);
        if (!el) return;

        let repeatTimer = null;
        const trigger = (e) => {
            e.preventDefault();
            sound.init();
            triggerHaptic(id === 'touch-hard' ? 25 : 12);
            onAction();
            if (autoRepeat) {
                repeatTimer = setTimeout(() => {
                    repeatTimer = setInterval(() => {
                        triggerHaptic(8);
                        onAction();
                    }, ARR);
                }, DAS);
            }
        };

        const stop = (e) => {
            e.preventDefault();
            if (repeatTimer) {
                clearTimeout(repeatTimer);
                clearInterval(repeatTimer);
                repeatTimer = null;
            }
        };

        el.addEventListener('pointerdown', trigger);
        el.addEventListener('pointerup', stop);
        el.addEventListener('pointercancel', stop);
        el.addEventListener('pointerleave', stop);
    };

    bindTouchBtn('touch-left', () => game.moveLeft(), true);
    bindTouchBtn('touch-right', () => game.moveRight(), true);
    bindTouchBtn('touch-down', () => game.softDrop(), true);
    bindTouchBtn('touch-rot-cw', () => game.rotate(1));
    bindTouchBtn('touch-rot-ccw', () => game.rotate(-1));
    bindTouchBtn('touch-hard', () => game.hardDrop());
    bindTouchBtn('touch-hold', () => game.hold());

    // Canvas Touch Gestures (Swipe to Move/Drop, Tap to Rotate)
    const canvasContainer = document.getElementById('canvas-3d');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSingleTouch = false;

    if (canvasContainer) {
        canvasContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isSingleTouch = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = performance.now();
                sound.init();
            } else {
                // Multi-touch: allow OrbitControls for 3D camera rotation
                isSingleTouch = false;
            }
        }, { passive: true });

        canvasContainer.addEventListener('touchmove', (e) => {
            if (!isSingleTouch || e.touches.length !== 1) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - touchStartX;
            const dy = currentY - touchStartY;

            const THRESHOLD_X = 26;
            const THRESHOLD_Y = 30;

            if (Math.abs(dx) > THRESHOLD_X) {
                if (dx > 0) {
                    game.moveRight();
                } else {
                    game.moveLeft();
                }
                triggerHaptic(10);
                touchStartX = currentX;
            } else if (dy > THRESHOLD_Y) {
                game.softDrop();
                triggerHaptic(8);
                touchStartY = currentY;
            }
        }, { passive: true });

        canvasContainer.addEventListener('touchend', (e) => {
            if (!isSingleTouch) return;
            const touchDuration = performance.now() - touchStartTime;
            const changeX = (e.changedTouches[0]?.clientX || 0) - touchStartX;
            const changeY = (e.changedTouches[0]?.clientY || 0) - touchStartY;
            const totalDist = Math.hypot(changeX, changeY);

            // Quick tap without significant movement -> Rotate Piece!
            if (touchDuration < 220 && totalDist < 12) {
                game.rotate(1);
                triggerHaptic(12);
            }
            isSingleTouch = false;
        }, { passive: true });
    }

    // 11. Initial Render and Game Tick Loop
    renderer.renderBoard(game.board);
    renderer.renderActivePiece(game.currentPiece);
    renderer.renderGhostPiece(game.currentPiece, game.ghostY);
    updateNextPieces(game.nextQueue);

    let lastTime = performance.now();
    function gameLoop(now) {
        const dt = now - lastTime;
        lastTime = now;

        game.update(dt);
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
});
