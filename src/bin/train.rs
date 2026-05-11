use rugby_simulator::RugbyPredictionModel;
use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    let model_path = if args.len() > 1 {
        &args[1]
    } else {
        "rugby_model.json"
    };

    println!("Training rugby prediction model...\n");

    let mut model = RugbyPredictionModel::new();
    model.load_data("data")?;
    model.print_statistics();
    model.save_model(model_path)?;

    println!("\nModel training complete!");

    Ok(())
}
