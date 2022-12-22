use std::future::IntoFuture;

use twilight_http::{response::marker::EmptyBody, Client, Response};
use twilight_model::id::Id;

use crate::env;

pub async fn webhook(
    content: String,
    http: &Client,
) -> Result<Response<EmptyBody>, twilight_http::Error> {
    http.execute_webhook(Id::new(1054131810122088558), &env::webhook())
        .content(&content)
        .unwrap()
        .thread_id(Id::new(1054131546153549924))
        .into_future()
        .await
}
