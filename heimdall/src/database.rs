use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    metadata::Bucket,
    rollouts::{Assignment, HashKey, Override, Populations},
};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Experiment {
    pub hash_key: HashKey,
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overrides: Option<Vec<Override>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overrides_formatted: Option<Vec<Vec<Populations>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub populations: Option<Vec<Populations>>,
    pub revision: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub buckets: Option<Vec<Bucket>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub type_field: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_assignments: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assignments: Option<HashMap<String, Value>>,
}

impl Experiment {
    pub fn new(
        hash_key: HashKey,
        has_assignments: Option<bool>,
        revision: Option<i64>,
        bucket: Assignment,
        position: u32,
        id: String,
    ) -> Self {
        let mut map = HashMap::new();

        map.insert(format!("{position}"), bucket.to_json(id));

        Self {
            hash_key,
            name: None,
            overrides: None,
            overrides_formatted: None,
            populations: None,
            revision,
            buckets: None,
            description: None,
            title: None,
            type_field: None,
            has_assignments,
            assignments: Some(map),
        }
    }
}
