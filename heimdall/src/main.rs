use std::{future::IntoFuture, time::Instant};

use mongodb::{
    bson::{doc, to_document},
    options::{ClientOptions, UpdateOptions},
    Client as MongoClient,
};
use twilight_http::client::ClientBuilder;
use twilight_model::{http::attachment::Attachment, id::Id};

mod assignments;
mod database;
mod env;
mod metadata;
mod rollouts;
mod sentry;

use database::Experiment;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let http = ClientBuilder::default().build().await;

    let client_options = ClientOptions::parse(&env::mongo()).await?;

    let client = MongoClient::with_options(client_options)?;
    // Ping the server to see if you can connect to the cluster
    let db = client.database(&format!("exps_{}", env::env()));

    db.run_command(doc! {"ping": 1}, None).await?;
    println!("[mongo] connected successfully.");

    let req = reqwest::Client::new();
    let check_in_id = sentry::start(&req).await?;
    let start = Instant::now();

    let coll = db.collection::<Experiment>("experiments");

    // {
    //     let metadata = metadata::get_metadata().await?;

    //     println!("[aether] fetched experiment metadata");

    //     // http.execute_webhook(Id::new(1054131810122088558), &env::webhook())
    //     //     .thread_id(Id::new(1054131546153549924))
    //     //     .content(&format!(
    //     //         "Fetched experiment metadata: {} results",
    //     //         metadata.len()
    //     //     ))?
    //     //     .attachments(&[Attachment {
    //     //         file: serde_json::to_vec_pretty(&metadata)?,
    //     //         filename: "rollouts.json".to_string(),
    //     //         id: 0,
    //     //         description: None,
    //     //     }])?
    //     //     .into_future()
    //     //     .await?;

    //     for experiment in metadata {
    //         coll.update_one(
    //             doc! { "hash_key": experiment.hash_key },
    //             doc! { "$set": to_document(&experiment).unwrap() },
    //             UpdateOptions::builder().upsert(Some(true)).build(),
    //         )
    //         .await?;
    //     }

    //     println!("[mongo] inserted metadata into database");
    // }

    {
        let rollouts = rollouts::get_rollouts().await?;

        let vec = serde_json::to_vec_pretty(&rollouts).unwrap();

        // http.execute_webhook(Id::new(1054131810122088558), &env::webhook())
        //     .thread_id(Id::new(1054131546153549924))
        //     .content(&format!(
        //         "Fetched guild rollouts: {} results",
        //         rollouts.guild_experiments.len()
        //     ))?
        //     .attachments(&[Attachment {
        //         file: vec,
        //         filename: "rollouts.json".to_string(),
        //         id: 0,
        //         description: None,
        //     }])?
        //     .into_future()
        //     .await?;

        for experiment in rollouts.guild_experiments {
            coll.update_one(
                doc! { "hash_key": experiment.hash_key.0 },
                doc! { "$set": to_document(&experiment).unwrap() },
                UpdateOptions::builder().upsert(Some(true)).build(),
            )
            .await?;
        }

        println!("[mongo] inserted guild rollouts into database");

        assignments::apply_assignments(&coll, rollouts.assignments, rollouts.fingerprint.clone())
            .await?;

        println!(
            "[mongo] inserted user assignments for {} into database",
            rollouts.fingerprint
        );
    }


    
    {
        let metadata = metadata::get_metadata().await?;

        println!("[aether] fetched experiment metadata");

        // http.execute_webhook(Id::new(1054131810122088558), &env::webhook())
        //     .thread_id(Id::new(1054131546153549924))
        //     .content(&format!(
        //         "Fetched experiment metadata: {} results",
        //         metadata.len()
        //     ))?
        //     .attachments(&[Attachment {
        //         file: serde_json::to_vec_pretty(&metadata)?,
        //         filename: "rollouts.json".to_string(),
        //         id: 0,
        //         description: None,
        //     }])?
        //     .into_future()
        //     .await?;

        for experiment in metadata {
            coll.update_one(
                doc! { "hash_key": experiment.hash_key },
                doc! { "$set": to_document(&experiment).unwrap() },
                UpdateOptions::builder().upsert(Some(true)).build(),
            )
            .await?;
        }

        println!("[mongo] inserted metadata into database");
    }


    let duration = start.elapsed();

    sentry::end(&req, check_in_id, duration).await?;

    Ok(())
}
