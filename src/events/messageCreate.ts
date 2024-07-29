import { Client, Message, MessageType } from 'discord.js';
import kleur from 'kleur';

export default async function (m: Message) {
  if (m.mentions.users.has(m.client.user!.id) && m.type !== MessageType.Reply) {
    return m.reply('Hello! I am a bot that helps you track guild rollouts. For help, type `/help`.');
  }
}