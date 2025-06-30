
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, RotateCcw, Play, Pause } from 'lucide-react';

interface GameState {
  isRunning: boolean;
  score: number;
  gameOver: boolean;
}

const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    score: 0,
    gameOver: false
  });

  // Game objects
  const gameObjects = useRef({
    dino: {
      x: 50,
      y: 150,
      width: 40,
      height: 40,
      jumping: false,
      velocity: 0,
      groundY: 150
    },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number }>,
    ground: { y: 190 },
    speed: 3,
    score: 0,
    lastObstacle: 0
  });

  const drawDino = useCallback((ctx: CanvasRenderingContext2D, dino: any) => {
    ctx.fillStyle = '#333';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Simple dino shape
    ctx.fillStyle = '#555';
    ctx.fillRect(dino.x + 5, dino.y + 5, 30, 30);
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(dino.x + 20, dino.y + 10, 5, 5);
  }, []);

  const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obstacle: any) => {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }, []);

  const drawGround = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, gameObjects.current.ground.y, canvas.width, 20);
    
    // Ground pattern
    ctx.fillStyle = '#CD853F';
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, gameObjects.current.ground.y + 10, 10, 10);
    }
  }, []);

  const checkCollision = useCallback((dino: any, obstacle: any) => {
    return dino.x < obstacle.x + obstacle.width &&
           dino.x + dino.width > obstacle.x &&
           dino.y < obstacle.y + obstacle.height &&
           dino.y + dino.height > obstacle.y;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameObjects.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update dino physics
    if (game.dino.jumping) {
      game.dino.velocity += 0.8; // gravity
      game.dino.y += game.dino.velocity;

      if (game.dino.y >= game.dino.groundY) {
        game.dino.y = game.dino.groundY;
        game.dino.jumping = false;
        game.dino.velocity = 0;
      }
    }

    // Generate obstacles
    if (Date.now() - game.lastObstacle > 2000 + Math.random() * 2000) {
      game.obstacles.push({
        x: canvas.width,
        y: 150,
        width: 20,
        height: 40
      });
      game.lastObstacle = Date.now();
    }

    // Update obstacles
    game.obstacles = game.obstacles.filter(obstacle => {
      obstacle.x -= game.speed;
      return obstacle.x + obstacle.width > 0;
    });

    // Check collisions
    for (const obstacle of game.obstacles) {
      if (checkCollision(game.dino, obstacle)) {
        setGameState(prev => ({ ...prev, gameOver: true, isRunning: false }));
        return;
      }
    }

    // Update score
    game.score += 0.1;
    setGameState(prev => ({ ...prev, score: Math.floor(game.score) }));

    // Increase speed gradually
    game.speed = Math.min(3 + game.score * 0.001, 8);

    // Draw everything
    drawGround(ctx, canvas);
    drawDino(ctx, game.dino);
    game.obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));

    // Draw score
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${Math.floor(game.score)}`, canvas.width - 150, 30);

    if (gameState.isRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.isRunning, drawDino, drawObstacle, drawGround, checkCollision]);

  const jump = useCallback(() => {
    const game = gameObjects.current;
    if (!game.dino.jumping && gameState.isRunning) {
      game.dino.jumping = true;
      game.dino.velocity = -15;
    }
  }, [gameState.isRunning]);

  const startGame = useCallback(() => {
    const game = gameObjects.current;
    game.dino = {
      x: 50,
      y: 150,
      width: 40,
      height: 40,
      jumping: false,
      velocity: 0,
      groundY: 150
    };
    game.obstacles = [];
    game.speed = 3;
    game.score = 0;
    game.lastObstacle = 0;

    setGameState({ isRunning: true, score: 0, gameOver: false });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const resetGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setGameState({ isRunning: false, score: 0, gameOver: false });
  }, []);

  useEffect(() => {
    if (gameState.isRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isRunning, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState.gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, startGame, gameState.gameOver]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          Chrome Dino Game
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="text-lg font-semibold">
              Score: {gameState.score}
            </div>
            <div className="flex gap-2">
              {!gameState.isRunning && !gameState.gameOver && (
                <Button onClick={startGame} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Game
                </Button>
              )}
              {gameState.isRunning && (
                <Button onClick={pauseGame} variant="outline" className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          
          {gameState.gameOver && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <h3 className="text-lg font-bold text-red-800 mb-2">Game Over!</h3>
              <p className="text-red-700">Final Score: {gameState.score}</p>
              <p className="text-sm text-red-600 mt-2">Press SPACE or click Start to play again</p>
            </div>
          )}
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">How to Play:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Press SPACE or UP ARROW to jump</p>
              <p>• Avoid the obstacles (cacti)</p>
              <p>• Try to get the highest score!</p>
              <p>• Click the canvas area and use keyboard controls</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gradient-to-b from-blue-200 to-blue-300">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="block cursor-pointer max-w-full"
              onClick={gameState.gameOver ? startGame : jump}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Click on the game area to focus, then use SPACE or UP ARROW to jump!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DinoGame;
