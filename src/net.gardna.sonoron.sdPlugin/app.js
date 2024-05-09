/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const setFrequency = new Action("net.gardna.sonoron.set-frequency");
const toggleScanFrequncy = new Action(
  "net.gardna.sonoron.toggle-scan-frequency"
);
let selectedContext = undefined;
let scannedFrequencies = [];

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(
  ({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
    console.log("Stream Deck connected!");
  }
);

setFrequency.onKeyUp(({ action, context, device, event, payload }) => {
  const websocket = new WebSocket("ws://[::1]:33802");
  websocket.onopen = () => {
    let request = {
      type: "set_frequencies",
      freq_recv: payload.settings.recv.split(".").map((i) => parseInt(i)),
      freq_xmit: payload.settings.xmit.split(".").map((i) => parseInt(i)),
    };
    websocket.send(JSON.stringify(request));
    websocket.close();
  };
  if (selectedContext !== undefined) {
    $SD.setState(selectedContext, 0);
  }
  selectedContext = context;
  $SD.setState(context, 1);
});

toggleScanFrequncy.onKeyUp(({ action, context, device, event, payload }) => {
  if (payload.state == 0) {
    scannedFrequencies.push(payload.settings.recv);
  } else {
    let index = scannedFrequencies.indexOf(payload.settings.recv);
    if (index > -1) {
      scannedFrequencies.splice(index, 1);
    }
  }
  const websocket = new WebSocket("ws://[::1]:33802");
  websocket.onopen = () => {
    let request = {
      type: "set_frequencies_scanned",
      freqs: scannedFrequencies.map((i) =>
        i.split(".").map((n) => parseInt(n))
      ),
    };
    websocket.send(JSON.stringify(request));
    websocket.close();
  };
});
