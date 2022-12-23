use std::collections::HashMap;
use std::io::Cursor;

use mongodb::bson::{doc, to_document};
use mongodb::options::UpdateOptions;
use mongodb::Collection;
use murmur3::murmur3_32;
use serde::Serialize;

use crate::database::Experiment;
use crate::rollouts::{self, Assignment, HashKey};

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
    assignments: HashMap<String, i32>,
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
            assignments: map,
            revision: revision as i64,
        }
    }
}

pub async fn apply_assignments(
    coll: Collection<Experiment>,
    assignments: Vec<Assignment>,
    fingerprint: String,
) -> anyhow::Result<()> {
    for Assignment(HashKey(hash_key), revision, bucket, override_, population) in assignments {
        let experiment = coll
            .find_one(doc! { "hash_key": hash_key.clone() }, None)
            .await?;

        match experiment {
            None => {
                println!("Missing experiment metadata for hash key {}", hash_key);

                coll.insert_one(
                    &Experiment::new(
                        rollouts::HashKey(hash_key),
                        Some(true),
                        Some(revision as i64),
                    ),
                    None,
                )
                .await?;

                println!(" => inserted");

                continue;
            }
            Some(experiment) => {
                if let Some(name) = experiment.name {
                    let pos = crate::assignments::get_position(fingerprint.clone(), name);

                    coll.update_one(
                            doc! { "hash_key": hash_key.clone() },
                            doc! { "$set": to_document(&crate::assignments::BaseAssignment::from((hash_key, revision, bucket), pos))? },
                            None,
                        )
                        .await?;
                } else if experiment.has_assignments.is_none() {
                    println!("Missing experiment metadata for hash key {}", hash_key);

                    coll.update_one(
                        doc! { "hash_key": hash_key },
                        doc! { "$set": { "has_assignments": true, "revision": revision } },
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
