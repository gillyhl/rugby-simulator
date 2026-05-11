use rugby_simulator::RugbyPredictionModel;
use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    let model_path = if args.len() > 1 {
        &args[1]
    } else {
        "rugby_model.json"
    };

    let mut model = RugbyPredictionModel::new();

    // Load pre-trained model
    model.load_model(model_path)?;

    // Display statistics about the model
    model.print_statistics();

    // Generate 10 example game predictions
    println!("\n=== Example Game Predictions ===\n");

    for i in 1..=10 {
        let prediction = model.predict_game()?;

        println!(
            "Game {}:",
            i
        );
        println!(
            "  Home: {} tries, {} conversions, {} penalties, {} drop goals (Score: {})",
            prediction.home.tries,
            prediction.home.conversions,
            prediction.home.penalties,
            prediction.home.drop_goals,
            prediction.home.score
        );
        println!(
            "  Away: {} tries, {} conversions, {} penalties, {} drop goals (Score: {})",
            prediction.away.tries,
            prediction.away.conversions,
            prediction.away.penalties,
            prediction.away.drop_goals,
            prediction.away.score
        );
        println!();
    }

    Ok(())
}
