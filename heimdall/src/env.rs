pub fn token() -> String {
    env!("DISCORD_TOKEN").to_string()
}

pub fn webhook() -> String {
    env!("DISCORD_WEBHOOK").to_string()
}

pub fn mongo() -> String {
    env!("MONGODB_URI").to_string()
}

pub fn env() -> String {
    env!("ENV").to_string()
}
