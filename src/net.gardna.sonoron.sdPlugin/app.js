/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const setFrequency = new Action("net.gardna.sonoron.set-frequency");
let selectedContext = undefined;

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
