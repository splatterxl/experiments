// https://aether.gaminggeek.dev/v2/discexp

use std::env::VarError;

use reqwest::{header::HeaderMap, Client};
use serde::{Deserialize, Serialize};
use serde_json::Value;

pub type AetherResponse = Vec<ExperimentAether>;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExperimentAether {
    #[serde(rename = "type")]
    pub type_field: String,
    pub title: String,
    pub description: Vec<String>,
    pub buckets: Vec<i64>,
    pub id: String,
    pub hash: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExperimentMetadata {
    #[serde(rename = "type")]
    pub type_field: String,
    pub title: String,
    pub buckets: Vec<Bucket>,
    pub description: Option<String>,
    pub name: String,
    pub hash_key: i64,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Bucket {
    pub name: String,
    pub description: Option<String>,
}

pub async fn get_metadata() -> anyhow::Result<Vec<ExperimentMetadata>> {
    // we need to do this for some reason
    let mut headers = HeaderMap::new();
    headers.insert("authority", "aether.gaminggeek.dev".parse().unwrap());
    headers.insert(
        "accept-language",
        "en-GB,en;q=0.9,en-US;q=0.8,en-IE;q=0.7,de-DE;q=0.6,de;q=0.5"
            .parse()
            .unwrap(),
    );
    headers.insert("cache-control", "max-age=0".parse().unwrap());
    headers.insert("dnt", "1".parse().unwrap());
    headers.insert(
        "sec-ch-ua",
        "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\""
            .parse()
            .unwrap(),
    );
    headers.insert("sec-ch-ua-mobile", "?0".parse().unwrap());
    headers.insert("sec-ch-ua-platform", "\"macOS\"".parse().unwrap());
    headers.insert("sec-fetch-dest", "document".parse().unwrap());
    headers.insert("sec-fetch-mode", "navigate".parse().unwrap());
    headers.insert("sec-fetch-site", "none".parse().unwrap());
    headers.insert("sec-fetch-user", "?1".parse().unwrap());
    headers.insert("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36".parse().unwrap());

    let client = Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap();
    let res = client
        .get("https://aether.gaminggeek.dev/v2/discexp")
        .headers(headers)
        .send()
        .await?
        .json::<AetherResponse>()
        .await?;

    let mut experiments = Vec::new();

    for experiment in res {
        let mut buckets = Vec::new();
        let description = if (experiment.description.len() - experiment.buckets.len()) == 1 {
            Some(experiment.description.get(0).unwrap().clone())
        } else {
            None
        };

        for (i, v) in experiment.buckets.iter().enumerate() {
            let index = if description.is_some() { i + 1 } else { i };

            buckets.push(Bucket {
                name: if i == 0 {
                    "Control".to_string()
                } else {
                    format!("Treatment {}", v)
                },
                description: experiment.description.get(index).cloned(),
            })
        }

        experiments.push(ExperimentMetadata {
            title: experiment.title,
            type_field: experiment.type_field,
            hash_key: experiment.hash,
            name: experiment.id,
            buckets,
            description,
        })
    }

    Ok(experiments)
}
