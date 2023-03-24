import { HoldemApiServer } from "./main";
import exitHook from "./modules/hookExit";

const server: HoldemApiServer = new HoldemApiServer();
server.listen( 2600 );

exitHook(() => {
    console.log("server is Closing");
    // appObject.onClose();
    console.error("OnExit");
    
  });
