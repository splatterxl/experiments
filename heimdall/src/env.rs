pub fn webhook() -> String {
    env!("DISCORD_WEBHOOK").to_string()
}

pub fn mongo() -> String {
    env!("MONGODB_URI").to_string()
}

pub fn env() -> String {
    env!("ENV").to_string()
}

pub fn fingerprints_uri() -> String {
    env!("FINGERPRINTS_URI").to_string()
}
