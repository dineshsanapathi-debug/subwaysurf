/**
 * AI Assistant for Cartoon Rail Rush
 * Powered by Google Gemini API with smart offline fallback
 */

const https = require('https');

class AIAssistant {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  getApiKey() {
    return process.env.GEMINI_API_KEY || this.apiKey || '';
  }

  /**
   * Helper to call Gemini REST API via native Node HTTPS
   */
  async callGemini(promptText, systemInstruction = '') {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }]
        }
      ]
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const urlPath = `/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      const req = https.request(
        {
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: urlPath,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 8000
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const json = JSON.parse(body);
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) resolve(text);
                else reject(new Error('Empty Gemini response'));
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error(`Gemini API HTTP ${res.statusCode}: ${body.slice(0, 150)}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Gemini API request timed out'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Analyze player run and give coaching & challenges
   */
  async analyzeRun(runData) {
    const {
      score = 0,
      distance = 0,
      coins = 0,
      jumps = 0,
      slides = 0,
      characterUsed = 'Dash',
      hitObstacleType = 'train',
      nearMisses = 0
    } = runData;

    // Try Gemini first if key is available
    if (this.getApiKey()) {
      try {
        const systemPrompt = `You are "Coach Spark", an energetic, witty cartoon arcade coach for the 3D subway runner game "Cartoon Rail Rush". Characters are Dash (sprinter), Luna (skater), and Bolt (robot). Keep commentary punchy, encouraging, and tactical. Respond strictly with a valid JSON object matching the requested schema.`;

        const userPrompt = `A player just finished a run:
- Character: ${characterUsed}
- Score: ${score}
- Distance: ${distance} meters
- Coins Collected: ${coins}
- Jumps Made: ${jumps}
- Slides Performed: ${slides}
- Cause of Collision: ${hitObstacleType}
- Near Misses: ${nearMisses}

Provide a JSON object with:
{
  "rating": "S | A | B | C",
  "headline": "Short snappy catchphrase (max 7 words)",
  "feedback": "2 sentences analyzing their performance",
  "proTip": "1 concrete gameplay tip",
  "challenge": "A specific mini-mission for their next run (e.g. 'Slide under 5 barriers without taking damage')",
  "rewardCoins": 50,
  "difficultyRecommendation": "Easy | Medium | Hard | Turbo"
}`;

        const raw = await this.callGemini(userPrompt, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          source: 'Gemini AI',
          ...parsed
        };
      } catch (err) {
        console.warn('[AIAssistant] Gemini call failed, falling back to local coach:', err.message);
      }
    }

    // Local Rule-Based Intelligent Fallback
    return this.getLocalAnalysis(runData);
  }

  /**
   * Local intelligent heuristics fallback
   */
  getLocalAnalysis(runData) {
    const {
      score = 0,
      distance = 0,
      coins = 0,
      jumps = 0,
      slides = 0,
      characterUsed = 'Dash',
      hitObstacleType = 'train'
    } = runData;

    let rating = 'C';
    let headline = 'Nice try, rookie!';
    let feedback = '';
    let proTip = '';
    let challenge = '';
    let rewardCoins = 50;
    let difficultyRecommendation = 'Normal';

    if (score >= 20000) {
      rating = 'S';
      headline = '🔥 GODLIKE RUN! City Champion!';
      feedback = `Sensational control with ${characterUsed}! You mastered high-speed lane weaving at ${distance}m with ${coins} coins banked.`;
      proTip = 'Stack the 2x Multiplier with Jetpacks to shoot your score past 30,000!';
      challenge = 'Reach 3,500m distance using only side lanes!';
      rewardCoins = 150;
      difficultyRecommendation = 'Turbo';
    } else if (score >= 10000) {
      rating = 'A';
      headline = '⚡ Blazing Fast Reflexes!';
      feedback = `Solid technique! You survived ${distance} meters and collected ${coins} coins with ${characterUsed}.`;
      proTip = hitObstacleType === 'train' 
        ? 'Spot train headlights early — hop onto train roofs with ramps to avoid ground collisions!' 
        : 'Double-tap jump when collecting coins on top of barriers for extra clearance.';
      challenge = 'Perform 12 jumps and 8 slides before your first collision!';
      rewardCoins = 100;
      difficultyRecommendation = 'Hard';
    } else if (score >= 4000) {
      rating = 'B';
      headline = '🛹 Getting in the Groove!';
      feedback = `Good run! You cleared ${distance}m, but that ${hitObstacleType} caught you off guard.`;
      proTip = slides < 3 
        ? 'Remember to use Down Arrow / Swipe Down! High roadblocks must be dodged with slides.' 
        : 'Pick up the Coin Magnet to gather coins while keeping your eyes locked ahead.';
      challenge = `Collect at least 40 coins in your next run with ${characterUsed}.`;
      rewardCoins = 60;
      difficultyRecommendation = 'Medium';
    } else {
      rating = 'C';
      headline = '🚀 Warm-Up Lap Complete!';
      feedback = `You took an early bump at ${distance}m. Quick reflexes come with practice!`;
      proTip = 'Keep your character centered when unfamiliar obstacles appear so you have 2 exit lanes.';
      challenge = 'Survive at least 500 meters without crashing.';
      rewardCoins = 40;
      difficultyRecommendation = 'Easy';
    }

    return {
      source: 'AI Coach Engine',
      rating,
      headline,
      feedback,
      proTip,
      challenge,
      rewardCoins,
      difficultyRecommendation
    };
  }

  /**
   * Smart Adaptive Difficulty calculation
   */
  calculateAdaptiveDifficulty(stats) {
    const {
      averageScore = 0,
      recentCrashes = 1,
      totalRuns = 1,
      playerPreference = 'auto'
    } = stats;

    if (playerPreference === 'easy') {
      return {
        levelName: 'Chill Glide',
        speedBase: 18,
        speedMax: 30,
        trainSpawnRate: 0.15,
        powerupFrequency: 0.18,
        obstacleGap: 38
      };
    }
    if (playerPreference === 'hard') {
      return {
        levelName: 'Hyper Rails',
        speedBase: 24,
        speedMax: 48,
        trainSpawnRate: 0.45,
        powerupFrequency: 0.09,
        obstacleGap: 24
      };
    }

    // Auto-Adaptive
    if (averageScore > 15000) {
      return {
        levelName: 'AI Master Mode',
        speedBase: 23,
        speedMax: 44,
        trainSpawnRate: 0.40,
        powerupFrequency: 0.10,
        obstacleGap: 26,
        description: 'AI detected veteran reaction time — faster train spawns & tighter gaps!'
      };
    } else if (averageScore > 6000) {
      return {
        levelName: 'AI Balanced Mode',
        speedBase: 20,
        speedMax: 36,
        trainSpawnRate: 0.28,
        powerupFrequency: 0.13,
        obstacleGap: 30,
        description: 'AI tuned tracks for optimal flow and coin collection.'
      };
    } else {
      return {
        levelName: 'AI Gentle Curve',
        speedBase: 17,
        speedMax: 28,
        trainSpawnRate: 0.18,
        powerupFrequency: 0.16,
        obstacleGap: 36,
        description: 'AI smoothed obstacle pacing to help hone your timing and slides.'
      };
    }
  }

  /**
   * Interactive Coach Q&A
   */
  async askCoach(question, playerStats = {}) {
    if (this.getApiKey()) {
      try {
        const systemPrompt = `You are Coach Spark, a funny and wise cartoon Subway Surfer coach. Give concise answers (under 60 words) with arcade gaming enthusiasm.`;
        const text = await this.callGemini(question, systemPrompt);
        return { answer: text.trim() };
      } catch (err) {
        console.warn('[AIAssistant] askCoach failed:', err.message);
      }
    }

    // Heuristic answers for popular questions
    const q = (question || '').toLowerCase();
    if (q.includes('character') || q.includes('who') || q.includes('best')) {
      return {
        answer: 'Dash has lightning reaction recovery, Luna has enhanced hoverboard air-time, and Bolt has a built-in magnetic coin pulse! Choose according to your style!'
      };
    }
    if (q.includes('score') || q.includes('high')) {
      return {
        answer: 'To score huge: keep your 2x multiplier active, grab jetpacks to skip dangerous train clusters, and always slide right after a jump to land faster!'
      };
    }
    if (q.includes('train')) {
      return {
        answer: 'Look ahead 3 track segments! Trains with yellow safety ramps on their bumper can be mounted from the front by jumping!'
      };
    }
    return {
      answer: 'Stay in the center lane whenever possible, slide early under high girders, and never hesitate to pop a hoverboard when things get tight!'
    };
  }
}

module.exports = new AIAssistant();

