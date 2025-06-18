import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  css: {
    devSourcemap: true
  },
  server: {
    host: true,
    port: 15113,
    allowedHosts: [
      'pure-calf-lively.ngrok-free.app' // Add 5173 to ngrok first -> add url to here
    ]
  }
});

// TOKEN 2xA8jVNwDNatIguFQoduaDn3T2F_2gVutwe58ELAtegEZWRkR
// npm dev run -> NetworkIP
// docker run -it -e NGROK_AUTHTOKEN=2xA8jVNwDNatIguFQoduaDn3T2F_2gVutwe58ELAtegEZWRkR ngrok/ngrok http NetworkIP --url=pure-calf-lively.ngrok-free.app
// docker run -it -e NGROK_AUTHTOKEN=2xA8jVNwDNatIguFQoduaDn3T2F_2gVutwe58ELAtegEZWRkR ngrok/ngrok http http://26.120.21.89:15113/ --url=pure-calf-lively.ngrok-free.app
