import { AutocompleteInteraction, Client, Collection, CommandInteraction, GatewayIntentBits, MessageComponentInteraction } from "discord.js"; 
import fastify from "fastify";
import fastifyCookie from "fastify-cookie";
import { readdirSync } from "fs";
import kleur from "kleur";
import { dirname } from "path";
import { loadRollouts } from "./load";

declare module "fastify" {
  export interface FastifyRequest {
    auth: { type: string, id?: string, token: string };
  }
}

const __dirname = dirname(import.meta.url).replace(/^file:\/{2}/, "");

/// --- BOT --- ///

const client = new Client({
  intents: GatewayIntentBits.Guilds,
});

process.on("unhandledRejection", (reason, _) => {
  console.error(`[${kleur.red("unhandledRejection")}] ${reason}`);
});
process.on("uncaughtException", (err: Error) => {
  console.error(`[${kleur.red("uncaughtException")}] ${err.message}`);
});
process.on("beforeExit", () => {
  console.info(`[${kleur.bold("exit")}] exiting`);
  client.destroy();
});

load()

export const commands = new Collection<string, 
  { 
    handle: (i: CommandInteraction) => 
      | { success: boolean; error: string } 
      | Promise<
        | { success: boolean; error: string }
      >; 
    handleComponent: (i: MessageComponentInteraction) => void | Promise<void>;
  }
>();
export const autocompleteStores = new Collection<string, (i: AutocompleteInteraction) => void | Promise<void>>();


async function load() { 

for (const event of readdirSync(__dirname + "/events")) {
  const { eventName = event.match(/(.*)\.js$/)?.[1], default: handler, type = "on" } = await import(`./events/${event}`);

  client[type as "on"](eventName, handler);

  console.debug(`[${kleur.green("events")}::load] loaded event ${eventName}`);
}

for (const command of readdirSync(__dirname + "/commands")) {
  const { default: handler, name = command.match(/(.*)\.js$/)?.[1], handleComponent = () => {} } = await import(`./commands/${command}`);

  commands.set(name, { handle: handler, handleComponent });

  console.debug(`[${kleur.blue("commands")}::load] loaded command ${name}`);
} 

for (const autocomplete of readdirSync(__dirname + "/autocomplete")) {
  const { default: handler, name = autocomplete.match(/(.*)\.js$/)?.[1] } = await import(`./autocomplete/${autocomplete}`);

  autocompleteStores.set(name, handler);

  console.debug(`[${kleur.cyan("autocomplete")}::load] loaded autocomplete store ${name}`);
}

client.on("debug", (...d: any) => console.debug(kleur.gray("[client::debug]"), ...d.map(kleur.gray)));

}

client.login();
loadRollouts();
setInterval(loadRollouts, /* four hours */ 4 * 60 * 60 * 1000);

/// --- API --- ///

const server = fastify({
  logger: false,
  ignoreTrailingSlash: false,
});

// plugins
server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});

// errors
server
  .setErrorHandler((error, req, reply) => {
    console.error(`[${kleur.red("error")}] ${error.message}`);
  
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Internal Server Error";
  
    reply.code(error.statusCode).send({
      error: {
        message: error.message,
        validation: error.validation,
        code: error.code ?? error.statusCode,
      },
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  })
  .setNotFoundHandler((req, reply) => {
    reply.code(404).send({
      error: {
        message: "Not Found",
        code: 404,
      },
    });
  });

// auth 
server.addHook("onRequest", async (req, res, next) => {
  console.debug(`[${kleur.green("request")}] ${req.method} ${req.url}${req.query}`);

  if (!req.headers.authorization)
    return res.code(401).send({
      error: {
        message: "Unauthorized",
        details: "Missing Authorization header",
        code: 401,
      },
    }); 

  const [type, token] = req.headers.authorization.split(" ");

  if (!["Bearer", "Bot"].includes(type)) 
    return res.code(401).send({
      error: {
        message: "Unauthorized",
        details: "Invalid Authorization header",
        code: 401,
      },
    });

  switch (type) {
    case "Bot":
      if (token !== process.env.BOT_TOKEN)
        return res.code(401).send({
          error: {
            message: "Unauthorized",
            details: "Invalid Authorization header",
            code: 401,
          },
        });

      req.auth = {
        type: "Bot",
        token,
      };
      break;
    case "Bearer": {
      const [id, secret] = token.split(".");

      req.auth = {
        type: "User",
        id,
        token: secret,
      };
      break;
    }
  }

  next();
});
