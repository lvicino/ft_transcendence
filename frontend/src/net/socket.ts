const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:3000/ws";

export function connectGameSocket(
  matchId: string,
  onMessage: (data: any) => void
) {
  const ws = new WebSocket(WS_BASE_URL);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        gameid: matchId,
        password: null,
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

  ws.onerror = (err) => {
    console.error("WebSocket error", err);
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
