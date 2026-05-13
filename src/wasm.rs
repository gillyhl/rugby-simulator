use wasm_bindgen::prelude::*;
use crate::RugbyPredictionModel;

const MODEL_JSON: &str = include_str!("../rugby_model.json");

#[wasm_bindgen]
pub struct WasmPredictor {
    model: RugbyPredictionModel,
}

#[wasm_bindgen]
impl WasmPredictor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<WasmPredictor, JsValue> {
        let mut model = RugbyPredictionModel::new();
        model.load_from_json_str(MODEL_JSON)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(WasmPredictor { model })
    }

    pub fn predict_game(&self, home_team: String, away_team: String) -> Result<String, JsValue> {
        let game = self.model.predict_game()
            .map_err(|e| JsValue::from_str(&e))?;

        let result = serde_json::json!({
            "home": {
                "team": home_team,
                "tries": game.home.tries,
                "conversions": game.home.conversions,
                "penalties": game.home.penalties,
                "drop_goals": game.home.drop_goals,
                "score": game.home.score
            },
            "away": {
                "team": away_team,
                "tries": game.away.tries,
                "conversions": game.away.conversions,
                "penalties": game.away.penalties,
                "drop_goals": game.away.drop_goals,
                "score": game.away.score
            }
        });

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn simulate_game(&self, home_team: String, away_team: String) -> Result<String, JsValue> {
        let game = self.model.simulate_game()
            .map_err(|e| JsValue::from_str(&e))?;

        let events = game.events.iter().map(|e| {
            let mut event_json = serde_json::json!({
                "event_type": match e.event_type {
                    crate::EventType::Try => "try",
                    crate::EventType::Conversion => "conversion",
                    crate::EventType::Penalty => "penalty",
                    crate::EventType::DropGoal => "dropGoal",
                },
                "team": match e.team {
                    crate::Team::Home => "home",
                    crate::Team::Away => "away",
                },
                "timestamp_seconds": e.timestamp_seconds
            });
            if e.converted {
                event_json["converted"] = serde_json::json!(true);
            }
            event_json
        }).collect::<Vec<_>>();

        let result = serde_json::json!({
            "home": {
                "team": home_team,
                "tries": game.home.tries,
                "conversions": game.home.conversions,
                "penalties": game.home.penalties,
                "drop_goals": game.home.drop_goals,
                "score": game.home.score
            },
            "away": {
                "team": away_team,
                "tries": game.away.tries,
                "conversions": game.away.conversions,
                "penalties": game.away.penalties,
                "drop_goals": game.away.drop_goals,
                "score": game.away.score
            },
            "events": events
        });

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
