import { HoldemCalculateCronServer } from "./main";
import exitHook from "./modules/hookExit";

const server: HoldemCalculateCronServer = new HoldemCalculateCronServer();

exitHook(() => {
    console.log("server is Closing");
    console.error("OnExit");
    
  });
