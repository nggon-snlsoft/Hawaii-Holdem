import { CustomApiServer } from "./main";
import exitHook from "./modules/hookExit";

const server: CustomApiServer = new CustomApiServer();
server.listen( 9000 );

exitHook(() => {
    console.log("server is Closing");
    console.error("OnExit");
    
  });
