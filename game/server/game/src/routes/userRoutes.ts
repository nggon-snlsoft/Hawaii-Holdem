import { ServerError } from "colyseus";
import express from "express";
import * as authController from "../controllers/authController";
import { publicRoomManager } from "../controllers/publicRoomManager";
import { InstanceRoomManager } from "../controllers/InstanceRoomManager";
import logger from "../util/logger";
import {RoomController} from "../controllers/RoomController";
import {
	getPlayerProfile,
	getUserInfoByDB,
	setting,
	updateUserAvatar,
	updateUserSetting
} from "../controllers/authController";
import {UserController} from "../controllers/UserController";

const router = express.Router();

router.post( "/", function(req,res) {
	res.send("OK");
});

// router.post("/auth", authController.auth );
// router.post("/test", authController.test );

// router.post("/setting", authController.setting );
// router.post("/updateUserAvatar", authController.updateUserAvatar );
// router.post("/joinPrivateRoom", authController.joinPrivateRoom);
// router.post("/privateRoomInfo", authController.getPrivateRoomInfo);

// router.post("/roomList", publicRoomManager.Instance().RequestRoomList.bind(publicRoomManager.Instance()));
// router.post("/roomInfo", publicRoomManager.Instance().RequestRoomInfo.bind(publicRoomManager.Instance()));
// router.post("/joinPublicRoom", publicRoomManager.Instance().RequestJoinPublicRoom.bind(publicRoomManager.Instance()));

// router.post("/cancleRejoin", authController.cancelRejoin);

// router.post("/makeInstanceRoom", RoomController.Instance().RequestMakeInstanceRoom.bind(RoomController.Instance()));
// router.post("/joinRoom", RoomController.Instance().RequestJoinRoom.bind(RoomController.Instance()));
// router.post("/tableList", RoomController.Instance().RequestTableList.bind(RoomController.Instance()));

// router.post("/getUserInfoByDB", authController.getUserInfoByDB );
// router.post("/updateUserSetting", authController.updateUserSetting );
// router.post("/getPlayerProfile", authController.getPlayerProfile );

export default  router;