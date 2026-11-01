export const LANE_WIDTH = 3.2;
export const LANES = [-1, 0, 1]; // Left, Center, Right

export const POWERUP_DURATIONS = {
  magnet: 12,
  jetpack: 11,
  hoverboard: 15,
  multiplier: 14
};

export class GameEngine {
  constructor(options = {}) {
    this.character = options.character || 'Dash';
    this.speed = options.speedBase || 20;
    this.speedMax = options.speedMax || 38;
    this.speedBase = options.speedBase || 20;
    this.acceleration = 0.4; // m/s per 10 seconds

    // Difficulty tuning
    this.trainSpawnRate = options.trainSpawnRate || 0.3;
    this.powerupFrequency = options.powerupFrequency || 0.12;
    this.obstacleGap = options.obstacleGap || 32;

    // Player state
    this.lane = 0; // -1, 0, 1
    this.posY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isOnTrain = false;
    this.trainRoofY = 3.2;
    this.invulnerableTimer = 0;

    // Run metrics
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.multiplier = 1;
    this.isGameOver = false;
    this.isPaused = false;

    // Power-ups state: remaining seconds
    this.powerups = {
      magnet: 0,
      jetpack: 0,
      hoverboard: 0,
      multiplier: 0
    };

    // 500-Metre Elevated Running Route
    this.elevatedRoute = {
      active: false,
      startDistance: 0,
      distance: 0,
      maxDistance: 500,
      isLanding: false
    };

    // Tracking for AI Coach
    this.runStats = {
      jumps: 0,
      slides: 0,
      coins: 0,
      trainsDodged: 0,
      nearMisses: 0,
      causeOfDeath: 'unknown',
      timePlayed: 0
    };

    // World items
    this.chunks = [
      { id: 1, z: 0 },
      { id: 2, z: -100 },
      { id: 3, z: -200 }
    ];
    this.obstacles = [];
    this.coinsList = [];
    this.powerupsList = [];

    this.nextSpawnZ = -35;
    this.initSpawnPool();
  }

  initSpawnPool() {
    // Pre-populate obstacles and coins for the first 250 meters
    while (this.nextSpawnZ > -250) {
      this.spawnSegment(this.nextSpawnZ);
      this.nextSpawnZ -= this.obstacleGap;
    }
  }

  checkSideCollision(targetLane) {
    if (this.powerups.jetpack > 0 || this.posY > 4.5) return null;
    const targetX = targetLane * LANE_WIDTH;

    for (const obs of this.obstacles) {
      if (Math.abs(obs.x - targetX) > 0.8) continue;

      if (obs.type === 'train') {
        const halfL = (obs.length || 18) / 2;
        const frontZ = obs.z + halfL;
        const rearZ = obs.z - halfL;

        // Player is running alongside this train if player z (0) is between rearZ and frontZ
        if (rearZ <= 0.8 && frontZ >= -0.8) {
          if (this.posY < this.trainRoofY - 0.2) {
            return obs;
          }
        }
      } else if (obs.type === 'roadblock' || obs.type === 'low_barrier' || obs.type === 'high_barrier') {
        if (obs.z >= -1.0 && obs.z <= 1.0) {
          return obs;
        }
      }
    }
    return null;
  }

  triggerSideCollision(obs) {
    if (this.invulnerableTimer > 0) return;
    this.invulnerableTimer = 0.5; // Short cooldown between bumps
    if (this.onSideCollision) {
      this.onSideCollision(obs);
    }
  }

  moveLeft() {
    if (this.isGameOver || this.isPaused) return false;
    if (this.lane > -1) {
      const targetLane = this.lane - 1;
      const hit = this.checkSideCollision(targetLane);
      if (hit) {
        this.triggerSideCollision(hit);
        return false; // Cannot pass through train or obstacle flank
      }
      this.lane = targetLane;
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.isGameOver || this.isPaused) return false;
    if (this.lane < 1) {
      const targetLane = this.lane + 1;
      const hit = this.checkSideCollision(targetLane);
      if (hit) {
        this.triggerSideCollision(hit);
        return false; // Cannot pass through train or obstacle flank
      }
      this.lane = targetLane;
      return true;
    }
    return false;
  }

  jump() {
    if (this.isGameOver || this.isPaused) return false;
    let groundY = this.isOnTrain ? this.trainRoofY : 0;
    if (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) {
      groundY = 4.75;
    }
    if (this.posY <= groundY + 0.25 && !this.powerups.jetpack) {
      this.velocityY = 15.0;
      this.isJumping = true;
      this.isSliding = false;
      this.slideTimer = 0;
      this.runStats.jumps++;
      return true;
    }
    return false;
  }

  slide() {
    if (this.isGameOver || this.isPaused) return false;
    if (this.powerups.jetpack) return false;

    // Fast downward slam if currently in mid-air
    const groundY = (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) ? 4.75 : 0.3;
    if (this.isJumping || this.posY > groundY) {
      this.velocityY = -24;
    }

    this.isSliding = true;
    this.slideTimer = 0.75;
    this.runStats.slides++;
    return true;
  }

  activateHoverboard() {
    if (this.isGameOver || this.isPaused) return;
    this.powerups.hoverboard = POWERUP_DURATIONS.hoverboard;
  }

  activateJetpack(duration = 11) {
    if (this.isGameOver || this.isPaused) return;
    this.powerups.jetpack = duration;
    if (this.onPowerupCollect) this.onPowerupCollect('jetpack');
  }

  activateElevatedRoute() {
    if (this.isGameOver || this.isPaused || this.elevatedRoute.active) return;
    this.elevatedRoute.active = true;
    this.elevatedRoute.startDistance = this.distance;
    this.elevatedRoute.distance = 0;
    this.elevatedRoute.isLanding = false;
    if (this.onElevatedRouteStart) this.onElevatedRouteStart();
  }

  completeElevatedRoute() {
    if (!this.elevatedRoute.active) return;
    this.elevatedRoute.isLanding = true;
  }

  spawnSegment(z) {
    const laneChoices = [-1, 0, 1];
    const occupiedLanes = new Set();

    // Decide if spawning a train or static obstacles
    const rollTrain = Math.random() < this.trainSpawnRate;

    if (rollTrain) {
      const trainLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      occupiedLanes.add(trainLane);
      const isMoving = Math.random() < 0.45;
      const hasRamp = Math.random() < 0.65;
      const length = 18;

      this.obstacles.push({
        id: 'train_' + Math.random(),
        type: 'train',
        lane: trainLane,
        x: trainLane * LANE_WIDTH,
        y: 0,
        z: z - length / 2,
        length,
        hasRamp,
        isMoving,
        moveSpeed: isMoving ? 8 : 0,
        color: ['#dc2626', '#2563eb', '#16a34a'][Math.floor(Math.random() * 3)]
      });

      // Spawn coins along train roof!
      for (let cz = z - length + 2; cz < z; cz += 2.5) {
        this.coinsList.push({
          id: 'c_' + Math.random(),
          x: trainLane * LANE_WIDTH,
          y: 3.7,
          z: cz
        });
      }
    }

    // Pick another lane for obstacle or powerup
    const freeLanes = laneChoices.filter((l) => !occupiedLanes.has(l));
    if (freeLanes.length > 0) {
      const obsLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      occupiedLanes.add(obsLane);

      const r = Math.random();
      if (r < 0.4) {
        // Low barrier (jump)
        this.obstacles.push({
          id: 'low_' + Math.random(),
          type: 'low_barrier',
          lane: obsLane,
          x: obsLane * LANE_WIDTH,
          y: 0,
          z
        });
        // Coin arc above barrier
        this.coinsList.push(
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 1.2, z: z + 2 },
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 2.2, z },
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 1.2, z: z - 2 }
        );
      } else if (r < 0.75) {
        // High barrier (slide)
        this.obstacles.push({
          id: 'high_' + Math.random(),
          type: 'high_barrier',
          lane: obsLane,
          x: obsLane * LANE_WIDTH,
          y: 0,
          z
        });
        // Low coins underneath
        this.coinsList.push(
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 0.5, z: z + 1.5 },
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 0.5, z },
          { id: 'c_' + Math.random(), x: obsLane * LANE_WIDTH, y: 0.5, z: z - 1.5 }
        );
      } else {
        // Roadblock (lane switch)
        this.obstacles.push({
          id: 'rb_' + Math.random(),
          type: 'roadblock',
          lane: obsLane,
          x: obsLane * LANE_WIDTH,
          y: 0,
          z
        });
      }
    }

    // Free lane gets coins or power-ups!
    const openLanes = laneChoices.filter((l) => !occupiedLanes.has(l));
    if (openLanes.length > 0) {
      const coinLane = openLanes[0];
      // Powerup chance
      if (Math.random() < this.powerupFrequency) {
        const types = ['magnet', 'jetpack', 'hoverboard', 'multiplier'];
        const pType = types[Math.floor(Math.random() * types.length)];
        this.powerupsList.push({
          id: 'p_' + Math.random(),
          type: pType,
          x: coinLane * LANE_WIDTH,
          y: 1.2,
          z
        });
      } else {
        // Coin trail
        for (let cz = z - 6; cz <= z + 6; cz += 2) {
          this.coinsList.push({
            id: 'c_' + Math.random(),
            x: coinLane * LANE_WIDTH,
            y: 0.8,
            z: cz
          });
        }
      }
    }
  }

  update(delta) {
    if (this.isGameOver || this.isPaused) return;

    this.runStats.timePlayed += delta;

    // Invulnerability decay after hoverboard crash
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
    }

    // Power-ups countdown
    Object.keys(this.powerups).forEach((k) => {
      if (this.powerups[k] > 0) {
        this.powerups[k] = Math.max(0, this.powerups[k] - delta);
      }
    });

    // Speed progression
    this.speed = Math.min(this.speedMax, this.speed + this.acceleration * delta * 0.1);

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Multiplier
    this.multiplier = this.powerups.multiplier > 0 ? 2 : 1;

    // Distance & Score
    const moveDist = this.speed * delta;
    this.distance += moveDist;
    this.score += Math.floor(moveDist * 2.5 * this.multiplier);

    // 1. Move track chunks forward (+z toward player)
    for (const chunk of this.chunks) {
      chunk.z += moveDist;
    }
    // Recycle chunk when it passes behind camera
    for (const chunk of this.chunks) {
      if (chunk.z > 100) {
        const minZ = Math.min(...this.chunks.map((c) => c.z));
        chunk.z = minZ - 100;
      }
    }

    // 2. Move obstacles & trains forward
    for (const obs of this.obstacles) {
      obs.z += moveDist;
      if (obs.isMoving) {
        obs.z += obs.moveSpeed * delta;
      }
    }

    // 3. Determine if player is supported by any train roof BEFORE vertical physics
    let standingOnAnyTrain = false;
    const playerX = this.lane * LANE_WIDTH;

    for (const obs of this.obstacles) {
      if (obs.type === 'train') {
        const halfL = (obs.length || 18) / 2;
        const trainZMin = obs.z - halfL;
        const trainZMax = obs.z + halfL;

        // Same lane
        if (Math.abs(playerX - obs.x) < 1.15) {
          // Player is within the length of the train (with small forgiveness buffer)
          if (0 >= trainZMin - 0.2 && 0 <= trainZMax + 0.8) {
            // If player is already on train or at roof height
            if (this.isOnTrain || this.posY >= this.trainRoofY - 0.35) {
              standingOnAnyTrain = true;
            }
          }
        }
      }
    }
    this.isOnTrain = standingOnAnyTrain;

    // 500-Metre Elevated Route progression
    if (this.elevatedRoute?.active) {
      this.elevatedRoute.distance = Math.min(500, Math.floor(this.distance - this.elevatedRoute.startDistance));

      if (!this.elevatedRoute.isLanding) {
        // Smoothly rise to upper floor (4.75m)
        if (this.posY < 4.75 && !this.isJumping) {
          this.posY = Math.min(4.75, this.posY + delta * 7.5);
        }
      } else {
        // Smooth landing transition back to ground/train roof
        const targetLandingY = this.isOnTrain ? this.trainRoofY : 0;
        if (this.posY > targetLandingY && !this.isJumping) {
          this.posY = Math.max(targetLandingY, this.posY - delta * 7.5);
          if (this.posY <= targetLandingY + 0.08) {
            this.posY = targetLandingY;
            this.elevatedRoute.active = false;
            this.elevatedRoute.isLanding = false;
            if (this.onElevatedRouteComplete) this.onElevatedRouteComplete();
          }
        }
      }

      // Check 500m endpoint
      if (this.elevatedRoute.distance >= 500 && !this.elevatedRoute.isLanding) {
        this.completeElevatedRoute();
      }
    }

    // 4. Stable Vertical Physics & Gravity
    let currentBaseY = this.isOnTrain ? this.trainRoofY : 0;
    if (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) {
      currentBaseY = 4.75;
    }

    if (this.powerups.jetpack > 0) {
      this.posY = 6.2;
      this.velocityY = 0;
      this.isJumping = false;
    } else {
      // Natural arcade gravity
      this.velocityY += -34 * delta;
      this.posY += this.velocityY * delta;

      // Clean ground/roof landing clamp
      if (this.posY <= currentBaseY) {
        this.posY = currentBaseY;
        this.velocityY = 0;
        this.isJumping = false;
      }
    }

    // 5. Move coins & powerups
    for (const coin of this.coinsList) {
      coin.z += moveDist;

      // Magnet attraction
      if (this.powerups.magnet > 0) {
        const dx = this.lane * LANE_WIDTH - coin.x;
        const dz = 0 - coin.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 14) {
          coin.x += (dx / dist) * delta * 24;
          coin.z += (dz / dist) * delta * 24;
          coin.y += ((this.posY + 1.0 - coin.y) / dist) * delta * 20;
        }
      }
    }

    for (const p of this.powerupsList) {
      p.z += moveDist;
    }

    // Spawn more segments ahead
    this.nextSpawnZ += moveDist;
    if (this.nextSpawnZ > -250) {
      this.spawnSegment(this.nextSpawnZ - 30);
      this.nextSpawnZ -= this.obstacleGap;
    }

    // Remove passed obstacles & items
    this.obstacles = this.obstacles.filter((obs) => obs.z < 25);
    this.coinsList = this.coinsList.filter((c) => c.z < 10);
    this.powerupsList = this.powerupsList.filter((p) => p.z < 10);

    // Coin collection check
    this.checkCoinCollections();

    // Powerup collection check
    this.checkPowerupCollections();

    // Obstacle collision check
    if (this.invulnerableTimer <= 0) {
      this.checkObstacleCollisions();
    }
  }

  checkCoinCollections() {
    const playerX = this.lane * LANE_WIDTH;
    const playerY = this.posY + 1.0;

    for (let i = this.coinsList.length - 1; i >= 0; i--) {
      const c = this.coinsList[i];
      const dx = Math.abs(c.x - playerX);
      const dy = Math.abs(c.y - playerY);
      const dz = Math.abs(c.z - 0);

      if (dx < 1.0 && dy < 1.3 && dz < 1.4) {
        this.coins++;
        this.runStats.coins++;
        this.score += 10 * this.multiplier;
        this.coinsList.splice(i, 1);
        if (this.onCoinCollect) this.onCoinCollect();
      }
    }
  }

  checkPowerupCollections() {
    const playerX = this.lane * LANE_WIDTH;
    const playerY = this.posY + 1.0;

    for (let i = this.powerupsList.length - 1; i >= 0; i--) {
      const p = this.powerupsList[i];
      const dx = Math.abs(p.x - playerX);
      const dy = Math.abs(p.y - playerY);
      const dz = Math.abs(p.z - 0);

      if (dx < 1.2 && dy < 1.5 && dz < 1.5) {
        this.powerups[p.type] = POWERUP_DURATIONS[p.type] || 10;
        this.powerupsList.splice(i, 1);
        if (this.onPowerupCollect) this.onPowerupCollect(p.type);
      }
    }
  }

  checkObstacleCollisions() {
    // Flying high in jetpack mode bypasses all ground/train obstacle collisions
    if (this.powerups.jetpack > 0 || this.posY > 4.5) return;

    const playerX = this.lane * LANE_WIDTH;

    for (const obs of this.obstacles) {
      // Must be roughly in same lane
      if (Math.abs(playerX - obs.x) > 1.0) continue;

      if (obs.type === 'low_barrier') {
        // Low barrier: z around 0 (-0.8 to 0.8)
        if (obs.z >= -0.8 && obs.z <= 0.8) {
          // If player jumped high enough (y >= 1.0), clears it!
          if (this.posY < 1.0) {
            this.handleCollision('low_barrier');
            return;
          }
        }
      } else if (obs.type === 'high_barrier') {
        // High barrier: z around 0 (-0.8 to 0.8)
        if (obs.z >= -0.8 && obs.z <= 0.8) {
          // Cleared if sliding on ground
          if (!this.isSliding || this.posY > 0.4) {
            this.handleCollision('high_barrier');
            return;
          }
        }
      } else if (obs.type === 'roadblock') {
        if (obs.z >= -1.0 && obs.z <= 1.0) {
          if (this.posY < 2.0) {
            this.handleCollision('roadblock');
            return;
          }
        }
      } else if (obs.type === 'train') {
        const halfL = (obs.length || 18) / 2;
        const frontZ = obs.z + halfL;
        const rearZ = obs.z - halfL;

        // Front bumper collision
        if (frontZ >= -1.6 && frontZ <= 1.6) {
          // If train has ramp and player is jumping or high enough, smoothly glide onto roof
          if (obs.hasRamp && (this.isJumping || this.posY > 0.6)) {
            this.isOnTrain = true;
            this.posY = Math.max(this.posY, this.trainRoofY);
            if (this.velocityY < 0) this.velocityY = 0;
          } else if (this.posY < this.trainRoofY - 0.3) {
            this.handleCollision('train');
            return;
          }
        }
        // Body of train collision (side impact)
        else if (0 >= rearZ && 0 <= frontZ) {
          if (this.posY < this.trainRoofY - 0.3) {
            this.triggerSideCollision(obs);
            return;
          }
        }
      }
    }
  }

  handleCollision(obstacleType) {
    if (this.powerups.hoverboard > 0) {
      // Hoverboard saves player!
      this.powerups.hoverboard = 0;
      this.invulnerableTimer = 1.8;
      if (this.onHoverboardBreak) this.onHoverboardBreak();
      return;
    }

    this.isGameOver = true;
    this.runStats.causeOfDeath = obstacleType;
    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        distance: Math.floor(this.distance),
        coins: this.coins,
        characterUsed: this.character,
        runStats: this.runStats
      });
    }
  }
}

