import { AutocompleteInteraction } from "discord.js";
import { fuzzy } from "../index.js";
import { removeRolloutsPrefix } from "../util.js";

export default function (i: AutocompleteInteraction) {
  const typing = removeRolloutsPrefix(i.options.getString("experiment", true));

  let res =
    fuzzy
      ?.search(typing)
      .map((x: any) => ({ name: x.data.title.slice(0, 100), value: x.data.id }))
      .slice(0, 20) ?? [];

  if (typing.toLowerCase().includes("all")) {
    res = res.concat([{ name: "All experiments", value: "all" }]);
  }

  return i.respond(res);
}
