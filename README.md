# Experiments

A simple Discord bot to view, check and explore guild experiments of the Discord
API. If you don't know what that means, this probably doesn't apply to you.

## Methodology

Every 4 hours, data is fetched and cached from
[advaith's rollouts API](https://rollouts.advaith.io), falling back to Aether
and/or a local backup if an outage occurs. When a user runs `/check`, `/view` or
`/list`, data is retrieved from this cache to be rendered
([source](https://github.com/splatterxl/experiments/blob/main/src/render.ts))
into viewable data.

## Links

- [Invite the bot](https://discord.com/api/oauth2/authorize?client_id=957383358592217088&scope=applications.commands)
- [Source code](https://github.com/splatterxl/experiments)
- [Rollouts UI](https://rollouts.advaith.io)
