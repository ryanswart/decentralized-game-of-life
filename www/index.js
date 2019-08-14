import { Contract, Wavelet } from "wavelet-client";
import { BigInt } from "jsbi";

const pre = document.getElementById("game-of-life-canvas");
const host = "https://testnet.perlin.net";
const contractAddress =
  "0ae4ddc727646aef27487b442bc57f98272c26bc9cd13898419809f0a781582f";

const wallet = Wavelet.generateNewWallet();

const client = new Wavelet(host);

const contract = new Contract(client, contractAddress);

contract.init().then(r => {
  const results = contract.test(wallet, "render", BigInt(0)).logs[0];
  pre.textContent = results;
});

const playPauseButton = document.getElementById("play-pause");
let running = false;

const play = () => {
  playPauseButton.textContent = "⏸";
    // calling the step function will trigger consensus,
    // and therefor start the render loop
  contract.call(wallet, "step", BigInt(0), BigInt(1), BigInt(0));
  running = true;
};

const pause = () => {
  playPauseButton.textContent = "▶";
  running = false;
};

playPauseButton.addEventListener("click", event => {
  if (running) {
    pause();
  } else {
    play();
  }
});

// replace the old client.pollConsensus call with
client.pollConsensus({
  onRoundEnded: _ => {
    contract.fetchAndPopulateMemoryPages().then(_ => {
      const results = contract.test(wallet, "render", BigInt(0)).logs[0];
      pre.textContent = results;

      if (running) {
          try{
              contract.call(wallet, "step", BigInt(0), BigInt(1), BigInt(0));
          }catch (e){
              console.error(e);
          }
      }
    });
  }
});

pre.addEventListener("click", event => {
  const boundingRect = pre.getBoundingClientRect();

  const scaleX = 64 / boundingRect.width;
  const scaleY = 64 / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop), 64 - 1);
  const col = Math.min(Math.floor(canvasLeft), 64 - 1);

  contract.call(
    wallet,
    "toggle",
    BigInt(0),
    BigInt(1),
    BigInt(0),
    {
      type: "uint32",
      value: row
    },
    {
      type: "uint32",
      value: col
    }
  );
});

const publicKey = Buffer.from(wallet.publicKey, "binary").toString("hex");

fetch("https://faucet.perlin.net", {
  method: "POST",
  body: JSON.stringify({
    address: publicKey
  })
}).then(play);
