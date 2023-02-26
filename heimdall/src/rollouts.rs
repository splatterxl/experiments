use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RolloutsRaw {
    pub fingerprint: String,
    pub assignments: Vec<Assignment>,
    pub guild_experiments: Vec<GuildExperiment>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GuildRollouts {
    pub fingerprint: String,
    #[serde(skip_serializing)]
    pub assignments: Vec<Assignment>,
    pub guild_experiments: Vec<ExperimentRollout>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Assignment(pub HashKey, pub u32, pub i32, pub i32, pub i32);

impl RolloutsRaw {
    pub fn simplify(self) -> GuildRollouts {
        let experiments = self.guild_experiments;
        let mut new_experiments = Vec::new();

        for experiment in experiments {
            new_experiments.push(experiment.simplify())
        }

        GuildRollouts {
            fingerprint: self.fingerprint,
            assignments: self.assignments,
            guild_experiments: new_experiments,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GuildExperiment(
    HashKey,
    ExperimentName,
    Revision,
    /// [number, any[]][][][]
    Vec<Population>,
    Vec<Override>,
    Vec<Vec<Population>>,
);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExperimentRollout {
    pub hash_key: HashKey,
    pub name: ExperimentName,
    pub revision: Revision,
    pub populations: Vec<Populations>,
    pub overrides: Vec<Override>,
    pub overrides_formatted: Vec<Vec<Populations>>,
}

impl GuildExperiment {
    pub fn simplify(self) -> ExperimentRollout {
        let mut populations = Vec::new();

        for pop in self.3 {
            populations.push(pop.get_filters());
        }

        let mut overrides = Vec::new();

        for override_ in self.5 {
            let mut inner = Vec::new();

            for pop in override_ {
                inner.push(pop.get_filters())
            }

            overrides.push(inner)
        }

        ExperimentRollout {
            hash_key: self.0,
            name: self.1,
            revision: self.2,
            populations,
            overrides: self.4,
            overrides_formatted: overrides,
        }
    }
}

// [[number, Rollout][], Filter[]]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Population(Vec<PopulationRollout>, Vec<PopulationFilter>);

impl Population {
    pub fn get_filters(self) -> Populations {
        Populations::from(self)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Populations {
    pub rollout: Vec<PopulationRollouts>,
    pub filters: FiltersFlattened,
}

impl Populations {
    pub fn from(pop: Population) -> Self {
        let mut filters = Vec::new();

        for filter in pop.1 {
            filters.push(filter.get_filter())
        }

        Self {
            rollout: PopulationRollouts::from(pop.0),
            filters: FiltersFlattened::flatten(filters),
        }
    }
}

// [number, Rollout[]]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PopulationRollout(i32, Vec<Rollout>);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PopulationRollouts {
    bucket: i32,
    rollout: Vec<Rollout>,
}

impl PopulationRollouts {
    pub fn from(rollouts: Vec<PopulationRollout>) -> Vec<Self> {
        let mut new = Vec::new();

        for rollout in rollouts {
            new.push(Self {
                bucket: rollout.0,
                rollout: rollout.1,
            });
        }

        new
    }
}

// [number, Rollout[]]
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PopulationFilter(u64, Value);

impl PopulationFilter {
    pub fn get_filter(&self) -> Filter {
        let func = match self.0 {
            1604612045 => Filter::feature,
            2404720969 => Filter::id_range,
            2918402255 => Filter::member_count,
            3013771838 => Filter::id,
            4148745523 => Filter::hub_type,
            188952590 => Filter::vanity_url,
            2294888943 => Filter::range_by_hash,
            _ => unreachable!(),
        };

        func(self.1.as_array().expect("non-vec filter passed").to_vec())
    }
}

// { s: number, e: number }
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Rollout {
    /// Start
    pub s: u64,
    /// End
    pub e: u64,
}

// string | null
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExperimentName(pub Option<String>);

// number
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Revision(u64);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HashKey(pub i64);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Override {
    /// Assigned bucket
    pub b: i64,
    /// Guild/User IDs
    pub k: Vec<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Filter {
    Feature(Vec<String>),
    IDRange {
        start: Option<u64>,
        end: Option<u64>,
    },
    MemberCount {
        start: Option<u64>,
        end: Option<u64>,
    },
    IDs(Vec<u64>),
    HubTypes(Vec<i64>),
    RangeByHash {
        hash_key: i64,
        target: i64,
    },
    VanityURL(bool),
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FiltersFlattened {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub features: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id_range: Option<IDRange>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub member_count: Option<MemberCountRange>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ids: Option<Vec<u64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hub_types: Option<Vec<i64>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub range_by_hash: Option<RangeByHash>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vanity_url: Option<bool>,
}

impl Default for FiltersFlattened {
    fn default() -> Self {
        Self {
            features: None,
            hub_types: None,
            id_range: None,
            ids: None,
            member_count: None,
            range_by_hash: None,
            vanity_url: None,
        }
    }
}

impl FiltersFlattened {
    pub fn flatten(vec: Vec<Filter>) -> Self {
        let mut it = Self::default();

        for filter in vec {
            match filter {
                Filter::Feature(features) => it.features = Some(features),
                Filter::IDRange { start, end } => it.id_range = Some(IDRange { start, end }),
                Filter::RangeByHash { hash_key, target } => {
                    it.range_by_hash = Some(RangeByHash { hash_key, target })
                }
                Filter::MemberCount { start, end } => {
                    it.member_count = Some(MemberCountRange { start, end })
                }
                Filter::IDs(ids) => it.ids = Some(ids),
                Filter::HubTypes(types) => it.hub_types = Some(types),
                Filter::VanityURL(enabled) => it.vanity_url = Some(enabled),
            }
        }

        it
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct IDRange {
    pub start: Option<u64>,
    pub end: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MemberCountRange {
    pub start: Option<u64>,
    pub end: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RangeByHash {
    hash_key: i64,
    target: i64,
}

impl Filter {
    // vec is [[_, features: string[]]]
    pub fn feature(vec: Vec<Value>) -> Filter {
        let vec = vec[0].as_array().unwrap()[1].as_array().unwrap();
        let mut features = Vec::new();

        for feature in vec {
            if let Some(str) = feature.as_str() {
                features.push(str.to_string())
            }
        }

        Filter::Feature(features)
    }

    // [[_, start: string | null], [_, end: string | null]]
    pub fn id_range(vec: Vec<Value>) -> Filter {
        let start = vec[0].as_array().unwrap()[1]
            .as_str()
            .map(|s| s.parse::<u64>().unwrap());
        let end = vec[1].as_array().unwrap()[1]
            .as_str()
            .map(|s| s.parse::<u64>().unwrap());

        Filter::IDRange { start, end }
    }

    // [[_, start: number | null], [_, end: number | null]]
    pub fn member_count(vec: Vec<Value>) -> Filter {
        let start = vec[0].as_array().unwrap()[1].as_u64();
        let end = vec[1].as_array().unwrap()[1].as_u64();

        Filter::MemberCount { start, end }
    }

    // [[_, string[]]]
    pub fn id(vec: Vec<Value>) -> Filter {
        let vec = vec[0].as_array().unwrap()[1].as_array().unwrap();
        let mut ids = Vec::new();

        for id in vec {
            if let Some(id) = id.as_str().map(|id| id.parse::<u64>().unwrap()) {
                ids.push(id)
            }
        }

        Filter::IDs(ids)
    }

    // [[_, number[]]]
    pub fn hub_type(vec: Vec<Value>) -> Filter {
        let vec = vec[0].as_array().unwrap()[1].as_array().unwrap();
        let mut types = Vec::new();

        for typ in vec {
            if let Some(typ) = typ.as_i64() {
                types.push(typ)
            }
        }

        Filter::HubTypes(types)
    }

    // [[_, number], [_, number]]
    pub fn range_by_hash(vec: Vec<Value>) -> Filter {
        let hash_key = vec[0].as_array().unwrap()[1].as_i64().unwrap();
        let target = vec[1].as_array().unwrap()[1].as_i64().unwrap();

        Filter::RangeByHash { hash_key, target }
    }

    pub fn vanity_url(vec: Vec<Value>) -> Filter {
        let boolean = vec[0].as_array().unwrap()[1].as_bool().unwrap();

        Filter::VanityURL(boolean)
    }
}

pub async fn get_rollouts() -> anyhow::Result<GuildRollouts> {
    let resp = reqwest::get("http://discord.com/api/v9/experiments?with_guild_experiments=true")
        .await?
        .json::<RolloutsRaw>()
        .await?;

    let resp = resp.simplify();

    Ok(resp)
}
