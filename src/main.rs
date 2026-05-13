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

    // Generate a simulated game with timestamps
    println!("\n=== Example Simulated Game with Timeline ===\n");

    let simulated_game = model.simulate_game()?;

    println!(
        "Final Score: Home {} - Away {}",
        simulated_game.home.score, simulated_game.away.score
    );
    println!("\nGame Timeline (80-minute match):\n");

    for event in &simulated_game.events {
        let minutes = event.timestamp_seconds / 60;
        let seconds = event.timestamp_seconds % 60;
        let team_name = match &event.team {
            rugby_simulator::Team::Home => "Home",
            rugby_simulator::Team::Away => "Away",
        };
        let event_name = if event.event_type == rugby_simulator::EventType::Try {
            if event.converted {
                "TRY (CONVERTED)"
            } else {
                "TRY"
            }
        } else {
            match &event.event_type {
                rugby_simulator::EventType::Try => "TRY",
                rugby_simulator::EventType::Conversion => "Conversion",
                rugby_simulator::EventType::Penalty => "Penalty",
                rugby_simulator::EventType::DropGoal => "Drop Goal",
            }
        };

        println!("{:2}:{:02} - {} scores a {}!", minutes, seconds, team_name, event_name);
    }

    Ok(())
}
