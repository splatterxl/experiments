use mongodb::{bson::doc, options::ClientOptions, Client as MongoClient};
use std::{env, future::IntoFuture};
use twilight_http::Client;
use twilight_model::id::Id;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize the tracing subscriber.
    tracing_subscriber::fmt::init();

    let client = Client::new(env!("DISCORD_TOKEN").to_string()).await;

    client
        .execute_webhook(Id::new(1054131810122088558), env!("DISCORD_WEBHOOK"))
        .content("Starting scrape")?
        .thread_id(Id::new(1054131546153549924))
        .into_future()
        .await?;

    let me = client.current_user().await?.model().await?;
    println!("[discord] current user: {}#{}", me.name, me.discriminator);

    let mut client_options = ClientOptions::parse(env!("MONGODB_URI")).await?;

    let client = MongoClient::with_options(client_options)?;
    // Ping the server to see if you can connect to the cluster
    let db = client.database(&format!("exps_{}", env!("ENV")));

    db.run_command(doc! {"ping": 1}, None).await?;
    println!("[mongo] connected successfully.");

    Ok(())
}
