from enum import Enum
from typing import Any
import discord
from dotenv import load_dotenv
import os
from pymongo import MongoClient
import asyncio

load_dotenv(".env.local")  # take environment variables from .env.

# Provide the mongodb atlas url to connect python to mongodb using pymongo
CONNECTION_STRING = os.environ["MONGODB_URI"]

# Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
client = MongoClient(CONNECTION_STRING)[
    f"exps_{os.environ['ENVIRONMENT'] if os.environ.get('ENVIRONMENT') is not None else 'production'}"
]


def get_filters(filters):
    obj = {}

    for type, value in filters:
        if type == 1604612045:
            features = value[0][1]
            obj["features"] = features
        elif type == 2404720969:
            ((_, start), (_, end)) = value
            obj["id_range"] = {"start": start, "end": end}
        elif type == 2918402255:
            ((_, start), (_, end)) = value
            obj["member_count"] = {"start": start, "end": end}
        elif type == 3013771838:
            ids = value[0][1]
            obj["ids"] = ids
        elif type == 4148745523:
            hub_types = value[0][1]
            obj["hub_types"] = hub_types
        elif type == 2294888943:
            ((_, hash_key), (_, target)) = value
            obj["range_by_hash"] = {"hash_key": hash_key, "target": target}
        elif type == 188952590:
            obj["vanity_url"] = value[0][1]
        else:
            raise NotImplementedError(f"Unknown filter type: {type}")

    return obj


collection = client["experiments"]


def handle_exp(experiment):
    collection.update_one(
        {"hash_key": experiment.hash_key},
        {
            "$set": {
                # "name": experiment.name,
                "populations": [
                    {
                        "filters": get_filters(filters),
                        "rollout": [
                            {"bucket": bucket, "rollout": data}
                            for (bucket, data) in rollout
                        ],
                    }
                    for (rollout, filters) in experiment.populations
                ],
                "overrides_formatted": [
                    [
                        {
                            "filters": get_filters(filters),
                            "rollout": [
                                {"bucket": bucket, "rollout": data}
                                for (bucket, data) in rollout
                            ],
                        }
                        for (rollout, filters) in pop
                    ]
                    for pop in experiment.overrides_formatted
                ],
                "overrides": experiment.overrides,
                "holdout": experiment.holdout,
                "aa_mode": experiment.aa_mode,
            }
        },
        upsert=True,
    )


class HiminsbjorgClient(discord.Client):
    async def on_ready(self):
        print("Logged on as", self.user)

        while True:
            for experiment in self.guild_experiments:
                print(f"Handling experiment {experiment.name} ({experiment.hash_key})")

                handle_exp(experiment)
            
            await asyncio.sleep(900)

            await self.close()
            self.clear()
            await self.connect(reconnect=True)

    async def on_message(self, message):
        # only respond to ourselves
        if message.author != self.user:
            return

        if message.content == "ping":
            await message.channel.send("pong")


client = HiminsbjorgClient()
client.run(os.environ["TOKEN"])
