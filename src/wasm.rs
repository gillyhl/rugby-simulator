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
}
