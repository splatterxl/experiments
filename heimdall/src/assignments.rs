use std::collections::HashMap;
use std::io::Cursor;

use mongodb::bson::doc;
use mongodb::options::UpdateOptions;
use mongodb::Collection;
use murmur3::murmur3_32;
use reqwest::Client;
use serde::Serialize;
use serde_json::{from_str, json, to_string, Value};

use crate::database::Experiment;
use crate::rollouts::{self, Assignment};

pub fn get_position(fingerprint: String, experiment_id: String) -> u32 {
    let id = fingerprint.split('.').next().unwrap();

    let hash_result = murmur3_32(&mut Cursor::new(format!("{id}:{experiment_id}")), 0).expect(
        &format!("Could not hash fingerprint and experiment id for {experiment_id}"),
    );

    hash_result % 10_000
}

#[derive(Serialize)]
pub struct BaseAssignment {
    hash_key: i64,
    has_assignments: bool,
    revision: i64,
}

impl BaseAssignment {
    pub fn from(assignment: (i64, u32, i32), pos: u32) -> Self {
        let mut map = HashMap::new();

        let (hash_key, revision, bucket) = assignment;

        map.insert(pos.to_string(), bucket);

        Self {
            hash_key,
            has_assignments: true,
            revision: revision as i64,
        }
    }
}

pub async fn apply_assignments(
    coll: &Collection<Experiment>,
    assignments: Vec<Assignment>,
    fingerprint: String,
) -> anyhow::Result<()> {
    for assignment in assignments {
        let experiment = coll
            .find_one(doc! { "hash_key": assignment.0.clone().0 }, None)
            .await?;

        let pos = assignment.5 as u32;

        match experiment {
            None => {
                println!(
                    "\nMissing experiment metadata for hash key {}",
                    assignment.0 .0
                );

                coll.insert_one(
                    &Experiment::new(
                        assignment.0.clone(),
                        Some(true),
                        Some(assignment.1.clone() as i64),
                        assignment,
                        pos,
                        fingerprint.split(".").next().unwrap().to_string(),
                    ),
                    None,
                )
                .await?;

                println!(" => inserted");

                continue;
            }
            Some(experiment) => {
                if let Some(name) = experiment.name {
                    let str = format!("assignments.{pos}");

                    coll.update_one(
                        doc! { "hash_key": assignment.0.clone().0 },
                        doc! { "$set": {
                            str: {
                                "bucket": assignment.2,
                                "override": assignment.3,
                                "population": assignment.4,
                                "fingerprint_id": fingerprint.split(".").next().unwrap().to_string()
                            },
                            "revision": assignment.1
                        } },
                        None,
                    )
                    .await?;
                } else if experiment.has_assignments.is_none() {
                    println!(
                        "\nMissing experiment metadata for hash key {}",
                        assignment.0.clone().0
                    );

                    coll.update_one(
                        doc! { "hash_key": assignment.0.clone().0 },
                        doc! { "$set": { "has_assignments": true, "revision": assignment.1, } },
                        Some(UpdateOptions::builder().upsert(Some(true)).build()),
                    )
                    .await?;

                    println!(" => updated");

                    continue;
                } else {
                    continue;
                }
            }
        }
    }

    Ok(())
}

pub async fn fetch_assignments(
    coll: &Collection<Experiment>,
    http_client: &Client,
) -> anyhow::Result<()> {
    let file = std::fs::read_to_string("./fingerprints.txt")?;
    let lines = file.lines();

    let mut enumerator = lines.enumerate();
    let (lower, upper) = enumerator.size_hint();
    let len = (lower + upper.unwrap_or(lower)) / 2;

    let json = from_str::<Value>(&std::fs::read_to_string("meta.json")?)?;
    let obj = json.as_object().unwrap();
    let mut pos = obj.get("pos").unwrap().as_i64().unwrap();
    let last_updated = obj.get("last_updated").unwrap().as_i64().unwrap();

    // if last updated is yesterday
    if last_updated
        < (std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64
            - 86400i64)
    {
        pos = 0;
    }

    for (i, line) in enumerator.skip(pos as usize) {
        let fingerprint = line.trim();

        println!(
            "Handling fingerprint: {fingerprint} (No. {i}{})",
            if len == 0 {
                "".to_string()
            } else {
                format!("/{len}")
            }
        );

        let response = rollouts::get_rollouts(Some(fingerprint), &http_client).await?;

        if let Some(new_fp) = response.fingerprint {
            println!("Bogus fingerprint: {fingerprint}");
            apply_assignments(&coll, response.assignments, new_fp).await?;
        } else {
            apply_assignments(&coll, response.assignments, fingerprint.to_string());
        }

        std::fs::write(
            "meta.json",
            to_string(&json!({ "pos": i, "last_updated": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() })).unwrap(),
        )
        .unwrap();
    }

    println!("Done handling fingerprints.");

    Ok(())
}
