const { Connection } = require("@solana/web3.js");
const { Client, Intents } = require("discord.js");
require("dotenv").config();

//start discord client
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

let url = "https://api.mainnet-beta.solana.com";
const connection = new Connection(url);

let serversBelonging = [];
let TPSList = [];
client.on("messageCreate", (message) => {
  if (serversBelonging.indexOf(message.guild.id) == -1) {
    serversBelonging.push(message.guild.id);
  }
});

// console.log(client.guilds); #list of serverIds the bot belongs to,

// function sleep(milliseconds) {
//   const date = Date.now();
//   let currentDate = null;
//   do {
//     currentDate = Date.now();
//   } while (currentDate - date < milliseconds);
// }

//function that works out tps
async function getTPS() {
  let medianNumTx = 0;
  //   const GUILD_ID = "798640949990260763";
  //   const guild = await client.guilds.fetch(GUILD_ID);

  // gets performance samples of chain
  let getPerformanceSamples = await connection
    .getRecentPerformanceSamples()
    .then((res) => {
      return res;
    });

  //this loop works out the mean number of txs every x seconds
  //gets the current number + the number of transaction in that specific slot
  for (let i = 0; i < getPerformanceSamples.length; i++) {
    medianNumTx = medianNumTx + getPerformanceSamples[i].numTransactions;
  }
  // then this divides it by the length of the whole block
  // so median is calculated

  medianNumTx = medianNumTx / getPerformanceSamples.length;

  let solTPS = medianNumTx / getPerformanceSamples[0].samplePeriodSecs;

  console.log("avg tps:", parseInt(solTPS));
  let parsedSolTPS = parseInt(solTPS);
  TPSList = []; // empty list before it is pushed
  TPSList.push(parsedSolTPS.toString()); //pushed as a string because discord status only allows strings
  // console.log(serversBelonging);
  console.log(TPSList);
  return TPSList[0];
}

// let TPS = getTPS();
// console.log("tps variable" + TPS);
client.once("ready", () => {
  console.log("TPS bot online");

  const Guilds = client.guilds.cache.map((guild) => guild.id); //maps list of guilds
  const g = client.guilds.cache.find((guild) => {
    //searches every server bot belongs to and resets nickname
    guild.me.setNickname(null);
  });

  // console.log(Guilds);

  client.user.setStatus("idle");

  const getResult = async function () {
    // runs getTPS function asynchrounously
    const result = await getTPS(); //awaits each result of getTPS bcs it is async
    console.log(result);
    setTimeout(getResult, 25000); // using this would allow for the function to be ran once, after a 25 second interval. callback is after closing brakcets, so this is done recursively
    client.user.setActivity(result + " TPS (30s)");
  };
  getResult();
});

client.login(process.env.DISCORD_LOGIN);

// bot inv
// https://discord.com/oauth2/authorize?client_id=976035158866145280&scope=bot&permissions=335544320
