import { AutocompleteInteraction } from "discord.js";
import { fuzzy } from "..";

export default function (i: AutocompleteInteraction) {
  const typing = i.options.getString("id", true);

  const res = fuzzy?.search(typing).map((x: any) => ({ name: x.data.title, value: x.data.id })).slice(0, 20) ?? [{ name: typing + " (service interruption)", value: typing }];

  if (res.length === 0) i.respond([ { name: typing, value: typing } ]);
  else i.respond(res);
}
