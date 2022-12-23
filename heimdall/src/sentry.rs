use std::time::Duration;

use reqwest::{
    header::{AUTHORIZATION, CONTENT_TYPE},
    Client,
};
use serde::Deserialize;
use serde_json::{json, Value};

const MONITOR_ID: &'static str = "a315430d-dd6f-498d-b60f-3a6b592d69da";
const DSN: &'static str =
    "https://352f8e9b23364aa284aaf79fd69cf727@o917511.ingest.sentry.io/4504368705830912";

#[derive(Deserialize)]
struct CheckInId {
    pub id: String,
}

pub async fn start(client: &Client) -> anyhow::Result<String> {
    let CheckInId { id } = client
        .post(format!(
            "https://sentry.io/api/0/monitors/{MONITOR_ID}/checkins/"
        ))
        .header(AUTHORIZATION, format!("DSN {DSN}"))
        .header(CONTENT_TYPE, "application/json")
        .json(&json!({ "status": "in_progress" }))
        .send()
        .await?
        .json::<CheckInId>()
        .await?;

    Ok(id)
}

pub async fn end(client: &Client, check_in_id: String, duration: Duration) -> anyhow::Result<()> {
    client
        .put(format!(
            "https://sentry.io/api/0/monitors/{MONITOR_ID}/checkins/{check_in_id}/"
        ))
        .header(AUTHORIZATION, format!("DSN {DSN}"))
        .header(CONTENT_TYPE, "application/json")
        .json(&json!({ "status": "ok", "duration": duration.as_millis() as u64 }))
        .send()
        .await?
        .json::<Value>()
        .await?;

    Ok(())
}
