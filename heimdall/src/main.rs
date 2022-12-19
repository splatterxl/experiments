use std::{env, future::IntoFuture};
use twilight_http::{
    request::{Method, RequestBuilder},
    routing::Path,
    Client,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize the tracing subscriber.
    tracing_subscriber::fmt::init();

    let client = Client::new(env::var("DISCORD_TOKEN")?).await;

    let req = RequestBuilder::raw(
        Method::Post,
        Path::Gateway,
        "https://51b4-2a09-bac1-3500-10-00-34-42.eu.ngrok.io".to_owned(),
    )
    .build();

    let _ = client.request::<()>(req).into_future().await?;

    let me = client.current_user().await?.model().await?;
    println!("Current user: {}#{}", me.name, me.discriminator);

    Ok(())
}
