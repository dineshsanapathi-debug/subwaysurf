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
    this.trainSpawnRate = options.trainSpawnRate || 0.32;
    this.powerupFrequency = options.powerupFrequency || 0.12;
    this.obstacleGap = options.obstacleGap || 36;

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
    this.sideBumpCooldown = 0;

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

    // Upper Skyway Route (Activated EXCLUSIVELY by the Rocket)
    this.elevatedRoute = {
      active: false,
      startDistance: 0,
      distance: 0,
      maxDistance: 500,
      isLanding: false
    };
    this.lastRocketDistance = -120;

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
    this.warningState = null;

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
      } else if (obs.type === 'high_barrier') {
        if (obs.z >= -1.0 && obs.z <= 1.0) {
          // If sliding under high barrier, allow smooth lane transition
          if (!this.isSliding || this.posY > 0.4) {
            return obs;
          }
        }
      } else if (obs.type === 'roadblock' || obs.type === 'low_barrier') {
        if (obs.z >= -1.0 && obs.z <= 1.0) {
          return obs;
        }
      }
    }
    return null;
  }

  triggerSideCollision(obs) {
    if (this.sideBumpCooldown > 0) return;
    this.sideBumpCooldown = 0.5; // Cooldown between side bump triggers and sound
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
      groundY = 8.65;
    }
    // Jump from ground, train roof, or cancel active slide immediately
    if (this.posY <= groundY + 0.35) {
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

    // Fast downward dive slam if currently in mid-air
    const groundY = (this.elevatedRoute?.active && !this.elevatedRoute.isLanding)
      ? 8.65
      : (this.isOnTrain ? this.trainRoofY : 0);

    if (this.isJumping || this.posY > groundY + 0.1) {
      this.velocityY = -26;
    }

    // 700ms slide timer with smooth restart on repeated presses
    this.isSliding = true;
    this.slideTimer = 0.70;
    this.runStats.slides++;
    return true;
  }

  activateHoverboard() {
    if (this.isGameOver || this.isPaused) return;
    this.powerups.hoverboard = POWERUP_DURATIONS.hoverboard;
  }

  activateJetpack(duration = 14) {
    if (this.isGameOver || this.isPaused) return;
    this.powerups.jetpack = duration;
    // Activate the Upper Skyway upon touching the Rocket!
    this.elevatedRoute.active = true;
    this.elevatedRoute.startDistance = this.distance;
    this.elevatedRoute.distance = 0;
    this.elevatedRoute.duration = duration;
    this.elevatedRoute.maxDistance = duration * (this.speed || 22);
    this.elevatedRoute.isLanding = false;
    this.elevatedRoute.hasLeaped = false;

    // Rocket thruster launch impulse: shoot up into the sky!
    this.velocityY = 18;
    this.isJumping = true;

    // Immediately spawn rich lanes of collectible mangoes on the skyway ahead
    const lanes = [-1, 0, 1];
    for (let mz = -20; mz >= -220; mz -= 5.5) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      this.coinsList.push({
        id: 'sky_mango_' + Math.random(),
        x: lane * LANE_WIDTH,
        y: 9.55, // Exact skyway collection height (surface 8.65 + 0.90)
        z: mz
      });
    }

    if (this.onElevatedRouteStart) this.onElevatedRouteStart();
    if (this.onPowerupCollect) this.onPowerupCollect('jetpack');
  }

  activateElevatedRoute(duration = 14) {
    this.activateJetpack(duration);
  }

  completeElevatedRoute() {
    if (!this.elevatedRoute.active || this.elevatedRoute.isLanding) return;
    this.elevatedRoute.isLanding = true;
    this.powerups.jetpack = 0;
    // Hero leaps forward off the upper skyway edge down to the ground tracks!
    this.velocityY = 4.5;
    this.isJumping = true;
    this.isSliding = false;
    this.slideTimer = 0;
    if (this.onElevatedLeap) this.onElevatedLeap();
  }

  spawnSegment(z) {
    // Upper Skyway Spawning: Dynamic high-altitude hazards (Laser gates, aerial drones & mango waves)
    if (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) {
      const laneChoices = [-1, 0, 1];
      const roll = Math.random();

      if (roll < 0.38) {
        // Sky Laser Gate (Spans runway deck at Y=8.65; clearance requires SLIDE)
        this.obstacles.push({
          id: 'skygate_' + Math.random(),
          type: 'sky_laser_gate',
          lane: 0,
          x: 0,
          y: 8.65,
          z
        });
        // Low sliding mango trail underneath the laser gate
        const slideLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
        for (let cz = z - 4; cz <= z + 4; cz += 2.0) {
          this.coinsList.push({
            id: 'sky_c_' + Math.random(),
            x: slideLane * LANE_WIDTH,
            y: 9.15,
            z: cz
          });
        }
      } else if (roll < 0.72) {
        // Aerial Cyber Drone in 1 lane (Dodging required)
        const droneLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
        this.obstacles.push({
          id: 'skydrone_' + Math.random(),
          type: 'sky_drone',
          lane: droneLane,
          x: droneLane * LANE_WIDTH,
          y: 8.65,
          z
        });

        // Open lanes get mango streams
        const openLanes = laneChoices.filter((l) => l !== droneLane);
        const rewardLane = openLanes[Math.floor(Math.random() * openLanes.length)];
        for (let cz = z - 6; cz <= z + 6; cz += 2.2) {
          this.coinsList.push({
            id: 'sky_c_' + Math.random(),
            x: rewardLane * LANE_WIDTH,
            y: 9.55,
            z: cz
          });
        }
      } else {
        // Bonus mango streams across skyway lanes
        const skyLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
        for (let cz = z - 6; cz <= z + 6; cz += 2.2) {
          this.coinsList.push({
            id: 'sky_c_' + Math.random(),
            x: skyLane * LANE_WIDTH,
            y: 9.55,
            z: cz
          });
        }
      }
      return;
    }

    const laneChoices = [-1, 0, 1];
    const occupiedLanes = new Set();

    // Regular Rocket power-up spawning on track ("rocket type thing")
    if (
      this.distance - this.lastRocketDistance > 220 &&
      !this.elevatedRoute.active &&
      this.powerups.jetpack <= 0
    ) {
      this.lastRocketDistance = this.distance;
      const rocketLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      occupiedLanes.add(rocketLane);
      this.powerupsList.push({
        id: 'rocket_' + Math.random(),
        type: 'jetpack',
        x: rocketLane * LANE_WIDTH,
        y: 1.25,
        z
      });
    }

    // Decide if spawning a train or static obstacles
    const rollTrain = Math.random() < this.trainSpawnRate;

    if (rollTrain) {
      const trainLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      occupiedLanes.add(trainLane);
      const isMoving = Math.random() < 0.45;
      const hasRamp = Math.random() < 0.30;
      const length = 28; // Indian WAP-4 Locomotive + 3 Blue Passenger Coaches (28m rake)

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
        color: '#d71932'
      });

      // Spawn vertical mango collectibles along the train roof
      for (let cz = z - length + 2; cz < z; cz += 2.8) {
        this.coinsList.push({
          id: 'c_' + Math.random(),
          x: trainLane * LANE_WIDTH,
          y: 3.7,
          z: cz
        });
      }

      // 35% chance to spawn an overhead beam girder crossing above this train rake
      if (Math.random() < 0.35) {
        this.obstacles.push({
          id: 'overhead_' + Math.random(),
          type: 'overhead_beam',
          lane: 0,
          x: 0,
          y: 0,
          z: z - 12
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
    if (this.sideBumpCooldown > 0) {
      this.sideBumpCooldown -= delta;
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

    // 2. Record previous Z positions for swept continuous collision detection
    for (const obs of this.obstacles) {
      obs.prevZ = obs.z;
    }

    // Move obstacles & trains forward
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

    // Upper Skyway progression (activated upon touching the rocket)
    if (this.elevatedRoute?.active) {
      this.elevatedRoute.distance = Math.floor(this.distance - this.elevatedRoute.startDistance);

      if (!this.elevatedRoute.isLanding) {
        // Smooth rocket ascent up to Upper Skyway deck (8.65m)
        if (this.posY < 8.65) {
          this.posY = Math.min(8.65, this.posY + delta * 20.0);
          this.velocityY = 0;
          this.isJumping = true;
        }

        // Rocket flight ends: hero runs off the skyway edge and leaps down to ground!
        if (
          this.powerups.jetpack <= 0 ||
          (this.elevatedRoute.maxDistance && this.elevatedRoute.distance >= this.elevatedRoute.maxDistance)
        ) {
          this.completeElevatedRoute();
        }
      }
    }

    // 4. Stable Vertical Physics & Gravity
    let currentBaseY = this.isOnTrain ? this.trainRoofY : 0;
    if (this.elevatedRoute?.active && !this.elevatedRoute.isLanding && this.posY >= 8.65) {
      currentBaseY = 8.65;
    }

    // Natural arcade gravity
    this.velocityY += -34 * delta;
    this.posY += this.velocityY * delta;

    // Clean ground/skyway landing clamp
    if (this.posY <= currentBaseY) {
      this.posY = currentBaseY;
      this.velocityY = 0;
      this.isJumping = false;

      // If hero was leaping down from the skyway, touchdown on ground completed!
      if (this.elevatedRoute?.isLanding) {
        this.elevatedRoute.active = false;
        this.elevatedRoute.isLanding = false;
        if (this.onElevatedLanding) this.onElevatedLanding();
        if (this.onElevatedRouteComplete) this.onElevatedRouteComplete();
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

    // Advance Hazard Warning scanner (Sky lasers, drones, overhead beams, trains)
    this.updateHazardWarning();
  }

  updateHazardWarning() {
    if (this.isGameOver || this.isPaused) {
      this.warningState = null;
      return;
    }

    const isPlayerElevated = (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) || this.posY >= 7.0;
    const playerX = this.lane * LANE_WIDTH;

    let closestHazard = null;
    let minDistance = Infinity;

    for (const obs of this.obstacles) {
      // Player is at z = 0; oncoming obstacles are at negative z (e.g. z = -25 is 25m ahead)
      const dist = -obs.z;

      // 1. SKY LASER GATE (Spans across skyway runway; duck/slide required)
      if (obs.type === 'sky_laser_gate') {
        if (isPlayerElevated && dist > 5 && dist < 42) {
          if (dist < minDistance) {
            minDistance = dist;
            closestHazard = {
              active: true,
              message: 'SKY LASER GATE',
              action: 'SLIDE',
              distance: Math.max(1, Math.round(dist))
            };
          }
        }
      }
      // 2. AERIAL SKY DRONE IN PLAYER'S LANE (Lane switch required)
      else if (obs.type === 'sky_drone') {
        if (isPlayerElevated && Math.abs(playerX - obs.x) < 1.35 && dist > 5 && dist < 42) {
          if (dist < minDistance) {
            minDistance = dist;
            closestHazard = {
              active: true,
              message: 'SKY DRONE IN LANE',
              action: 'SWITCH_LANE',
              distance: Math.max(1, Math.round(dist))
            };
          }
        }
      }
      // 3. LOW OVERHEAD GIRDER (Over train tracks; slide/duck required)
      else if (obs.type === 'overhead_beam') {
        if ((this.isOnTrain || this.posY >= 3.0) && dist > 5 && dist < 42) {
          if (dist < minDistance) {
            minDistance = dist;
            closestHazard = {
              active: true,
              message: 'LOW OVERHEAD GIRDER',
              action: 'SLIDE',
              distance: Math.max(1, Math.round(dist))
            };
          }
        }
      }
      // 4. ONCOMING HEAD-ON TRAIN (Lane switch required)
      else if (obs.type === 'train' && !isPlayerElevated) {
        const halfL = (obs.length || 28) / 2;
        const frontDist = -(obs.z + halfL);
        if (Math.abs(playerX - obs.x) < 1.35 && frontDist > 8 && frontDist < 42 && !obs.hasRamp && !this.isOnTrain) {
          if (frontDist < minDistance) {
            minDistance = frontDist;
            closestHazard = {
              active: true,
              message: 'HEAD-ON TRAIN',
              action: 'SWITCH_LANE',
              distance: Math.max(1, Math.round(frontDist))
            };
          }
        }
      }
      // 5. HIGH BARRIER ON GROUND TRACK (Slide required)
      else if (obs.type === 'high_barrier' && !isPlayerElevated) {
        if (Math.abs(playerX - obs.x) < 1.35 && dist > 5 && dist < 35 && !this.isOnTrain) {
          if (dist < minDistance) {
            minDistance = dist;
            closestHazard = {
              active: true,
              message: 'HIGH BARRIER',
              action: 'SLIDE',
              distance: Math.max(1, Math.round(dist))
            };
          }
        }
      }
    }

    this.warningState = closestHazard;
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
        this.mangoes = this.coins;
        this.runStats.coins++;
        this.runStats.mangoes = (this.runStats.mangoes || 0) + 1;
        this.score += 10 * this.multiplier;
        this.coinsList.splice(i, 1);
        if (this.onMangoCollect) this.onMangoCollect(c);
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
    const isPlayerElevated = (this.elevatedRoute?.active && !this.elevatedRoute.isLanding) || this.posY >= 7.0;
    const playerX = this.lane * LANE_WIDTH;

    for (const obs of this.obstacles) {
      const prevZ = obs.prevZ !== undefined ? obs.prevZ : obs.z;
      const curZ = obs.z;

      // 1. SKY LASER GATE (Upper Skyway runway)
      if (obs.type === 'sky_laser_gate') {
        if (isPlayerElevated) {
          const swept = (curZ >= -1.6 && prevZ <= 1.6);
          if (swept) {
            // Player must be sliding (ducking under 1.35m laser) to clear!
            if (!this.isSliding || this.posY > 8.9) {
              this.handleCollision('sky_laser_gate');
              return;
            }
          }
        }
        continue;
      }

      // 2. SKY DRONE (Upper Skyway lane obstacle)
      if (obs.type === 'sky_drone') {
        if (isPlayerElevated && Math.abs(playerX - obs.x) < 1.35) {
          const swept = (curZ >= -1.5 && prevZ <= 1.5);
          if (swept) {
            this.handleCollision('sky_drone');
            return;
          }
        }
        continue;
      }

      // 3. OVERHEAD INDUSTRIAL GIRDER (Over train tracks)
      if (obs.type === 'overhead_beam') {
        const swept = (curZ >= -1.5 && prevZ <= 1.5);
        if (swept) {
          // If player is on train or jumping high, must slide to duck under beam at Y=5.25m!
          if (this.posY >= 4.6) {
            this.handleCollision('overhead_beam');
            return;
          } else if (this.isOnTrain && (!this.isSliding || this.posY > 4.1)) {
            this.handleCollision('overhead_beam');
            return;
          }
        }
        continue;
      }

      // Ground hazards below: if player is elevated high in skyway, ground hazards cannot hit them!
      if (isPlayerElevated) continue;

      // Must be roughly in same lane
      if (Math.abs(playerX - obs.x) > 1.35) continue;

      if (obs.type === 'low_barrier') {
        // Continuous swept test: did the barrier pass through player z=0?
        const swept = (curZ >= -1.4 && prevZ <= 1.4);
        if (swept) {
          // If player jumped high enough (y >= 1.05), clears it!
          if (this.posY < 1.05) {
            this.handleCollision('low_barrier');
            return;
          }
        }
      } else if (obs.type === 'high_barrier') {
        // High barrier swept test
        const swept = (curZ >= -1.4 && prevZ <= 1.4);
        if (swept) {
          // Cleared only if actively sliding and low to track
          if (!this.isSliding || this.posY > 0.45) {
            this.handleCollision('high_barrier');
            return;
          }
        }
      } else if (obs.type === 'roadblock') {
        // Roadblock swept test
        const swept = (curZ >= -1.6 && prevZ <= 1.6);
        if (swept) {
          if (this.posY < 2.0) {
            this.handleCollision('roadblock');
            return;
          }
        }
      } else if (obs.type === 'train') {
        const halfL = (obs.length || 28) / 2;
        const frontZ = curZ + halfL;
        const prevFrontZ = prevZ + halfL;
        const rearZ = curZ - halfL;

        // Check A: Front bumper swept collision
        const frontSwept = (frontZ >= -2.2 && prevFrontZ <= 2.2);

        if (frontSwept) {
          if (obs.hasRamp) {
            // Front ramp approach: smoothly run up ramp onto train roof floor!
            this.isOnTrain = true;
            const rampProgress = Math.max(0, Math.min(1, (frontZ + 2.2) / 3.4));
            this.posY = Math.max(this.posY, this.trainRoofY * rampProgress);
            if (this.posY >= this.trainRoofY - 0.25) {
              this.posY = this.trainRoofY;
              this.velocityY = 0;
              this.isJumping = false;
            }
          } else {
            // Solid locomotive bumper:
            if (this.posY >= this.trainRoofY - 0.35) {
              this.isOnTrain = true;
              this.posY = Math.max(this.posY, this.trainRoofY);
            } else {
              // Fatal head-on collision with train!
              this.handleCollision('train');
              return;
            }
          }
        }
        // Check B: Inside train body while on ground in the same lane (run over)
        else if (rearZ <= 1.2 && frontZ >= -1.2) {
          if (this.posY < this.trainRoofY - 0.35) {
            this.handleCollision('train');
            return;
          }
        }
      }
    }
  }

  handleCollision(obstacleType) {
    // 1. Mango Shield Protection (Absorbs one collision and protects player)
    if (this.onShieldHit && this.onShieldHit(obstacleType)) {
      this.invulnerableTimer = 1.5; // Grace window to safely pass the obstacle
      if (this.onShieldAbsorb) this.onShieldAbsorb(obstacleType);
      return;
    }

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

