use serde::{Deserialize, Serialize};
use std::collections::HashMap;
#[cfg(not(target_arch = "wasm32"))]
use std::fs;
use rand::Rng;
use rand_distr::Poisson;

#[cfg(not(target_arch = "wasm32"))]
use walkdir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamStats {
    pub tries: u32,
    pub conversions: u32,
    pub penalties: u32,
    #[serde(rename = "dropGoals")]
    pub drop_goals: u32,
    pub score: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameData {
    pub away: TeamStats,
    pub home: TeamStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventStatistics {
    pub mean: f64,
    pub std_dev: f64,
    pub min: u32,
    pub max: u32,
}

pub struct RugbyPredictionModel {
    models: HashMap<String, EventStatistics>,
    event_types: Vec<&'static str>,
    positions: Vec<&'static str>,
}

impl RugbyPredictionModel {
    pub fn new() -> Self {
        RugbyPredictionModel {
            models: HashMap::new(),
            event_types: vec!["tries", "conversions", "penalties", "drop_goals"],
            positions: vec!["home", "away"],
        }
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn load_data(&mut self, data_dir: &str) -> Result<usize, Box<dyn std::error::Error>> {
        let mut game_count = 0;
        let mut all_games = Vec::new();

        for entry in walkdir::WalkDir::new(data_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "json"))
        {
            let content = fs::read_to_string(entry.path())?;
            let game: GameData = serde_json::from_str(&content)?;
            all_games.push(game);
            game_count += 1;
        }

        all_games.sort_by_key(|g| {
            g.home.score + g.away.score
        });

        // Train models on the loaded data
        self.train_models(&all_games)?;

        println!("Loaded {} games", game_count);
        Ok(game_count)
    }

    pub fn train_models(&mut self, games: &[GameData]) -> Result<(), Box<dyn std::error::Error>> {
        for position in &self.positions {
            for event_type in &self.event_types {
                let key = format!("{}_{}", position, event_type);
                let data: Vec<u32> = games
                    .iter()
                    .map(|game| {
                        let team = if *position == "home" {
                            &game.home
                        } else {
                            &game.away
                        };
                        match *event_type {
                            "tries" => team.tries,
                            "conversions" => team.conversions,
                            "penalties" => team.penalties,
                            "drop_goals" => team.drop_goals,
                            _ => 0,
                        }
                    })
                    .collect();

                let mean = data.iter().map(|&x| x as f64).sum::<f64>() / data.len() as f64;
                let variance = data
                    .iter()
                    .map(|&x| (x as f64 - mean).powi(2))
                    .sum::<f64>()
                    / data.len() as f64;
                let std_dev = variance.sqrt();

                let stats = EventStatistics {
                    mean,
                    std_dev,
                    min: *data.iter().min().unwrap_or(&0),
                    max: *data.iter().max().unwrap_or(&0),
                };

                self.models.insert(key, stats);
            }
        }

        Ok(())
    }

    pub fn print_statistics(&self) {
        println!("\n=== Rugby Prediction Model Statistics ===\n");

        for position in &self.positions {
            println!("\n{} TEAM STATISTICS:", position.to_uppercase());
            println!("{}", "-".repeat(70));

            for event_type in &self.event_types {
                let key = format!("{}_{}", position, event_type);
                if let Some(stats) = self.models.get(&key) {
                    println!(
                        "{:15} | Mean: {:5.2} | Std: {:5.2} | Min: {:3} | Max: {:3}",
                        event_type, stats.mean, stats.std_dev, stats.min, stats.max
                    );
                }
            }
        }
    }

    pub fn predict(&self, position: &str) -> Result<TeamStats, String> {
        if position != "home" && position != "away" {
            return Err("Position must be 'home' or 'away'".to_string());
        }

        let mut rng = rand::thread_rng();
        let mut predictions = HashMap::new();

        for event_type in &self.event_types {
            let key = format!("{}_{}", position, event_type);
            if let Some(stats) = self.models.get(&key) {
                let mean = stats.mean.max(0.1);

                // Sample from Poisson distribution
                let poisson = Poisson::new(mean).unwrap();
                let prediction = rng.sample(poisson) as u32;

                predictions.insert(*event_type, prediction);
            }
        }

        let tries = predictions.get("tries").copied().unwrap_or(0);
        let mut conversions = predictions.get("conversions").copied().unwrap_or(0);
        let penalties = predictions.get("penalties").copied().unwrap_or(0);
        let drop_goals = predictions.get("drop_goals").copied().unwrap_or(0);

        // Conversions can only occur up to the number of tries
        conversions = conversions.min(tries);

        // Calculate score: tries (5), conversions (2), penalties (3), drop goals (3)
        let score = tries * 5 + conversions * 2 + penalties * 3 + drop_goals * 3;

        Ok(TeamStats {
            tries,
            conversions,
            penalties,
            drop_goals,
            score,
        })
    }

    pub fn predict_game(&self) -> Result<GameData, String> {
        let home = self.predict("home")?;
        let away = self.predict("away")?;

        Ok(GameData { home, away })
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn save_model(&self, filepath: &str) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(&self.models)?;
        fs::write(filepath, json)?;
        println!("Model saved to {}", filepath);
        Ok(())
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub fn load_model(&mut self, filepath: &str) -> Result<(), Box<dyn std::error::Error>> {
        let content = fs::read_to_string(filepath)?;
        self.models = serde_json::from_str(&content)?;
        println!("Model loaded from {}", filepath);
        Ok(())
    }

    pub fn load_from_json_str(&mut self, json: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.models = serde_json::from_str(json)?;
        Ok(())
    }
}

impl Default for RugbyPredictionModel {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(target_arch = "wasm32")]
mod wasm;
