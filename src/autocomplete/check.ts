import { AutocompleteInteraction } from "discord.js";
import { fuzzy } from "../index.js";

export default function (i: AutocompleteInteraction) {
  const typing = i.options.getString("id", true);

  let res = fuzzy?.search(typing).map((x: any) => ({ name: x.data.title, value: x.data.id })).slice(0, 20) ?? [{ name: typing + " (service interruption)", value: typing }];

  if (typing.toLowerCase().includes("all")) {
    res = res.concat([{ name: "All experiments", value: "all" }]);
  }

  if (res.length === 0) i.respond([ { name: typing, value: typing } ]);
  else i.respond(res);
}
