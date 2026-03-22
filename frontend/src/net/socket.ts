const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ??
  `ws://${window.location.host}/api/games/ws`;

export function connectGameSocket(
  matchId: string,
  //password
  onMessage: (data: any) => void
) {
  const ws = new WebSocket(WS_BASE_URL);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        gameid: matchId,
        password: "",
      })
    );
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("WS parse error", err);
    }
  };

  ws.onerror = () => {
    console.error("WebSocket error");
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
  };

  return {
    send(data: any) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },

    close() {
      ws.close();
    },
  };
}