import { Client } from 'discord.js';
import kleur from 'kleur';

export default async function (c: Client<true>) {
  console.log(`[${kleur.green('ready')}] Logged in as ${c.user!.tag}`);
}