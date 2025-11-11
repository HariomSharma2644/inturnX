const Battle = require('../models/Battle');
const BattleResult = require('../models/BattleResult');
const { calculateEloRating } = require('./eloRating');
const { problems } = require('../problems');

class BattleManager {
  constructor(io) {
    this.io = io;
    this.activeBattles = new Map();
    this.matchmakingQueue = new Map(); // battleType -> array of players
    this.playerSockets = new Map(); // userId -> socketId
  }

  // Join matchmaking queue
  async joinQueue(socket, data) {
    try {
      const { userId, userName, battleType, rating } = data;

      // Remove from any existing queues
      this.leaveQueue(socket, { userId });

      // Add to matchmaking queue
      if (!this.matchmakingQueue.has(battleType)) {
        this.matchmakingQueue.set(battleType, []);
      }

      const queue = this.matchmakingQueue.get(battleType);
      const player = {
        userId,
        userName,
        rating: rating || 1200,
        socketId: socket.id,
        joinedAt: Date.now()
      };

      queue.push(player);
      this.playerSockets.set(userId, socket.id);

      socket.emit('queue-joined', { battleType, playersInQueue: queue.length });

      console.log(`Player ${userName} joined ${battleType} queue. Queue size: ${queue.length}`);

      // Try to find a match
      await this.findMatch(battleType);

    } catch (error) {
      console.error('Error joining queue:', error);
      socket.emit('queue-error', { message: 'Failed to join queue' });
    }
  }

  // Leave matchmaking queue
  leaveQueue(socket, data) {
    const { userId } = data;

    for (const [battleType, queue] of this.matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.userId === userId);
      if (index !== -1) {
        queue.splice(index, 1);
        socket.emit('queue-left');
        console.log(`Player ${userId} left ${battleType} queue`);
        break;
      }
    }

    this.playerSockets.delete(userId);
  }

  // Find a match for the given battle type
  async findMatch(battleType) {
    const queue = this.matchmakingQueue.get(battleType);
    if (!queue || queue.length < 2) return;

    // Sort queue by rating for better matching
    queue.sort((a, b) => a.rating - b.rating);

    // Find best match (closest rating difference)
    let bestMatch = null;
    let minRatingDiff = Infinity;

    for (let i = 1; i < queue.length; i++) {
      const ratingDiff = Math.abs(queue[0].rating - queue[i].rating);
      if (ratingDiff < minRatingDiff && ratingDiff <= 300) { // Max rating difference
        minRatingDiff = ratingDiff;
        bestMatch = queue[i];
      }
    }

    if (bestMatch) {
      // Remove both players from queue
      const player1 = queue.shift();
      const bestMatchIndex = queue.findIndex(player => player.userId === bestMatch.userId);
      if (bestMatchIndex !== -1) {
        queue.splice(bestMatchIndex, 1);
      }

      // Create battle
      await this.createBattle([player1, bestMatch], battleType);
    }
  }

  // Create a new battle
  async createBattle(players, battleType) {
    try {
      const battleId = `battle-${battleType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get random problem
      const problemKeys = Object.keys(problems);
      const randomProblemKey = problemKeys[Math.floor(Math.random() * problemKeys.length)];
      const problem = problems[randomProblemKey];

      const battle = new Battle({
        battleId,
        players: players.map(player => ({
          userId: player.userId,
          userName: player.userName,
          rating: player.rating,
          socketId: player.socketId,
          code: problem.languages?.javascript?.template || '',
          language: 'javascript'
        })),
        problem: {
          id: problem.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          category: problem.category,
          examples: problem.examples,
          constraints: problem.constraints,
          testCases: problem.testCases,
          languages: problem.languages
        },
        status: 'active',
        timeLimit: 1800, // 30 minutes
        startTime: new Date(),
        battleType,
        roomId: battleId
      });

      await battle.save();
      this.activeBattles.set(battleId, battle);

      // Notify both players
      for (const player of players) {
        const socket = this.io.sockets.sockets.get(player.socketId);
        if (socket) {
          socket.emit('match-found', {
            battleId,
            opponent: players.find(p => p.userId !== player.userId),
            problem: battle.problem,
            timeLimit: battle.timeLimit,
            yourTurn: true // Both can code simultaneously
          });
        }
      }

      console.log(`Battle ${battleId} created between ${players[0].userName} and ${players[1].userName}`);

    } catch (error) {
      console.error('Error creating battle:', error);
      // Notify players of error
      for (const player of players) {
        const socket = this.io.sockets.sockets.get(player.socketId);
        if (socket) {
          socket.emit('battle-error', { message: 'Failed to create battle' });
        }
      }
    }
  }

  // Update code in battle
  updateCode(socket, data) {
    const { battleId, code, language } = data;
    const battle = this.activeBattles.get(battleId);

    if (!battle) return;

    // Find the player
    const player = battle.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // Update player's code
    player.code = code;
    player.language = language;

    // Broadcast to opponent
    const opponent = battle.players.find(p => p.socketId !== socket.id);
    if (opponent) {
      const opponentSocket = this.io.sockets.sockets.get(opponent.socketId);
      if (opponentSocket) {
        opponentSocket.emit('code-updated', {
          code,
          language,
          from: socket.id
        });
      }
    }
  }

  // Submit solution
  async submitSolution(socket, data) {
    const { battleId, code, language } = data;
    const battle = this.activeBattles.get(battleId);

    if (!battle || battle.status !== 'active') return;

    const player = battle.players.find(p => p.socketId === socket.id);
    if (!player || player.submitted) return;

    try {
      // Mark as submitted
      player.submitted = true;
      player.submissionTime = new Date();
      player.code = code;
      player.language = language;

      // Evaluate the solution
      const result = await this.evaluateSolution(code, language, battle.problem.testCases);

      player.score = result.score;
      player.testsPassed = result.passedTests;
      player.totalTests = result.totalTests;

      socket.emit('submission-received', {
        message: 'Solution submitted successfully',
        result
      });

      // Notify opponent
      const opponent = battle.players.find(p => p.socketId !== socket.id);
      if (opponent) {
        const opponentSocket = this.io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
          opponentSocket.emit('opponent-submitted', {
            userName: player.userName,
            score: result.score
          });
        }
      }

      // Check if both players have submitted
      const submittedPlayers = battle.players.filter(p => p.submitted);
      if (submittedPlayers.length === 2) {
        await this.endBattle(battle);
      }

    } catch (error) {
      console.error('Error submitting solution:', error);
      socket.emit('submission-error', { message: 'Failed to submit solution' });
    }
  }

  // Evaluate solution against test cases
  async evaluateSolution(code, language, testCases) {
    try {
      let passedTests = 0;
      const results = [];

      for (const testCase of testCases) {
        try {
          const result = await this.runTestCase(code, language, testCase);
          results.push(result);
          if (result.passed) passedTests++;
        } catch (error) {
          results.push({
            passed: false,
            error: error.message,
            executionTime: 0
          });
        }
      }

      const score = Math.round((passedTests / testCases.length) * 100);

      return {
        score,
        passedTests,
        totalTests: testCases.length,
        results
      };

    } catch (error) {
      console.error('Error evaluating solution:', error);
      return {
        score: 0,
        passedTests: 0,
        totalTests: testCases.length,
        results: [],
        error: error.message
      };
    }
  }

  // Run a single test case (simplified version - in production, use Judge0 or similar)
  async runTestCase(code, language, testCase) {
    // This is a simplified evaluation - in production, you'd use Judge0 API or similar
    // For now, we'll do basic validation
    try {
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      // For demo purposes, randomly pass/fail tests
      // In production, you'd actually execute the code
      const passed = Math.random() > 0.3; // 70% pass rate for demo

      return {
        passed,
        executionTime: Math.random() * 1000,
        memoryUsed: Math.random() * 1000000,
        output: passed ? JSON.stringify(testCase.expectedOutput) : 'Wrong answer',
        error: passed ? null : 'Test case failed'
      };

    } catch (error) {
      return {
        passed: false,
        executionTime: 0,
        memoryUsed: 0,
        output: null,
        error: error.message
      };
    }
  }

  // End battle and calculate results
  async endBattle(battle) {
    try {
      battle.status = 'completed';
      battle.endTime = new Date();

      // Determine winner
      const player1 = battle.players[0];
      const player2 = battle.players[1];

      let winner = null;
      let result = 'draw';

      if (player1.score > player2.score) {
        winner = player1;
        result = 'player1_win';
      } else if (player2.score > player1.score) {
        winner = player2;
        result = 'player2_win';
      }

      battle.winner = winner ? {
        userId: winner.userId,
        userName: winner.userName,
        score: winner.score
      } : null;

      await battle.save();

      // Calculate ELO rating changes
      const ratingChanges = calculateEloRating(
        player1.rating,
        player2.rating,
        result === 'player1_win' ? 1 : result === 'player2_win' ? 0 : 0.5
      );

      // Create battle result
      const battleResult = new BattleResult({
        battleId: battle.battleId,
        battle: battle._id,
        players: [
          {
            userId: player1.userId,
            userName: player1.userName,
            ratingBefore: player1.rating,
            ratingAfter: player1.rating + ratingChanges.player1Change,
            ratingChange: ratingChanges.player1Change,
            score: player1.score,
            testsPassed: player1.testsPassed,
            totalTests: player1.totalTests,
            submissionTime: player1.submissionTime,
            code: player1.code,
            language: player1.language,
            result: result === 'player1_win' ? 'win' : result === 'player2_win' ? 'loss' : 'draw'
          },
          {
            userId: player2.userId,
            userName: player2.userName,
            ratingBefore: player2.rating,
            ratingAfter: player2.rating + ratingChanges.player2Change,
            ratingChange: ratingChanges.player2Change,
            score: player2.score,
            testsPassed: player2.testsPassed,
            totalTests: player2.totalTests,
            submissionTime: player2.submissionTime,
            code: player2.code,
            language: player2.language,
            result: result === 'player2_win' ? 'win' : result === 'player1_win' ? 'loss' : 'draw'
          }
        ],
        winner: battle.winner,
        duration: Math.floor((battle.endTime - battle.startTime) / 1000),
        problem: {
          id: battle.problem.id,
          title: battle.problem.title,
          difficulty: battle.problem.difficulty
        },
        battleType: battle.battleType
      });

      await battleResult.save();

      // Update user ratings (you'd typically do this in a separate service)
      // For now, we'll just emit the results

      // Notify both players
      for (const player of battle.players) {
        const socket = this.io.sockets.sockets.get(player.socketId);
        if (socket) {
          const playerResult = battleResult.players.find(p => p.userId.toString() === player.userId.toString());
          socket.emit('battle-result', {
            battleId: battle.battleId,
            result,
            winner: battle.winner,
            playerResult,
            opponentResult: battleResult.players.find(p => p.userId.toString() !== player.userId.toString()),
            duration: battleResult.duration
          });
        }
      }

      // Remove from active battles
      this.activeBattles.delete(battle.battleId);

      console.log(`Battle ${battle.battleId} completed. Winner: ${winner?.userName || 'Draw'}`);

    } catch (error) {
      console.error('Error ending battle:', error);
    }
  }

  // Handle player disconnect
  handleDisconnect(socketId) {
    // Find player in active battles
    for (const [battleId, battle] of this.activeBattles.entries()) {
      const player = battle.players.find(p => p.socketId === socketId);
      if (player) {
        console.log(`Player ${player.userName} disconnected from battle ${battleId}`);
        // Mark battle as abandoned if needed
        // For now, just log the disconnect
        break;
      }
    }

    // Remove from matchmaking queues
    for (const [battleType, queue] of this.matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.socketId === socketId);
      if (index !== -1) {
        queue.splice(index, 1);
        console.log(`Player removed from ${battleType} queue due to disconnect`);
        break;
      }
    }

    // Clean up player sockets map
    for (const [userId, socket] of this.playerSockets.entries()) {
      if (socket === socketId) {
        this.playerSockets.delete(userId);
        break;
      }
    }
  }
}

module.exports = BattleManager;
