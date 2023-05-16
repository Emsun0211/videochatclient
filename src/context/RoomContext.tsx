import { connect } from "http2";
import Peer from "peerjs";
import {
	createContext,
	ReactNode,
	useEffect,
	useReducer,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import socketIo from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { IMessage } from "../types/chat";
import { addPeerAction, removePeerAction } from "../reducers/peerActions";
import { peerReducer } from "../reducers/peerReducer";
import { chatReducer } from "../reducers/ChatReducer";
import {
	addHistoryAction,
	addMessageAction,
	toggleChatAction,
} from "../reducers/ChatActions";

// const WS = "http://localhost:8080";
const WS = "https://videoserver-a1l4.onrender.com";

export const RoomContext = createContext<null | any>(null);
const ws = socketIo(WS);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const navigate = useNavigate();

	const [me, setMe] = useState<Peer>();
	const [stream, setStream] = useState<MediaStream>();
	const [peers, dispatch] = useReducer(peerReducer, {});
	const [chat, chatDispatch] = useReducer(chatReducer, {
		messages: [],
		isChatOpen: false,
	});
	const [screenSharingId, setScreenSharingId] = useState<string>();
	const [roomId, setRoomId] = useState<string>();

	const enterRoom = ({ roomId }: { roomId: string }) => {
		console.log({ roomId });
		navigate(`/room/${roomId}`);
	};
	const removePeer = (peerId: string) => dispatch(removePeerAction(peerId));
	const getUsers = ({ participants }: { participants: string[] }) => {
		console.log({ participants });
	};

	console.log(chat);
	const switchStream = (stream: MediaStream) => {
		setStream(stream);
		setScreenSharingId(me?.id || "");
		if (me) {
			Object.values(me?.connections).forEach((connection: any) => {
				const videoTrack = stream
					?.getTracks()
					.find((track) => track.kind === "video");
				connection[0].peerConnection
					.getSenders()[1]
					.replaceTrack(videoTrack)
					.catch((error: any) => console.log(error));
			});
		}
	};

	const shareScreen = () => {
		if (screenSharingId) {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then(switchStream);
		} else {
			navigator.mediaDevices.getDisplayMedia({}).then(switchStream);
		}
	};
	const sendMessage = (message: string) => {
		const messageData: IMessage = {
			content: message,
			timestamp: Date.now(),
			author: me?.id,
		};
		chatDispatch(addMessageAction(messageData));
		ws.emit("send-message", roomId, messageData);
	};

	const addMessage = (message: IMessage) => {
		console.log({ message });
		chatDispatch(addMessageAction(message));
	};

	const addHistory = (messages: IMessage[]) => {
		console.log(messages);
		// chatDispatch(addHistoryAction(messages));
	};

	const toggleChat = () => {
		chatDispatch(toggleChatAction(!chat.isChatOpen));
	};
	useEffect(() => {
		const meId = uuidv4();

		// const peer = new Peer(meId, {
		// 	host: "localhost",
		// 	port: 9001,
		// 	path: "/",
		// });
		const peer = new Peer(meId);
		setMe(peer);
		try {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					setStream(stream);
				});
		} catch (error) {
			console.log(error);
		}

		ws.on("room-created", enterRoom);
		ws.on("get-users", getUsers);
		ws.on("user-disconnected", removePeer);
		ws.on("user-started-sharing", (peerId) => setScreenSharingId(peerId));
		ws.on("user-stoped-sharing", () => setScreenSharingId(""));
		ws.on("message-added", addMessage);
		ws.on("get-messages", addHistory);

		return () => {
			ws.off("room-created", enterRoom);
			ws.off("get-users", getUsers);
			ws.off("user-disconnected", removePeer);
			ws.off("user-started-sharing", (peerId) => setScreenSharingId(peerId));
			ws.off("user-stoped-sharing", () => setScreenSharingId(""));
			ws.off("message-added");
			ws.off("get-messages");
		};
	}, []);

	useEffect(() => {
		if (screenSharingId) {
			ws.emit("start-sharing", { peerId: screenSharingId, roomId });
		} else {
			ws.emit("stop-sharing");
		}
	}, [screenSharingId, roomId]);

	useEffect(() => {
		if (!me) return;
		if (!stream) return;
		ws.on("user-joined", ({ peerId }) => {
			const call = me.call(peerId, stream);
			console.log(call);
			call.on("stream", (peerStream) => {
				console.log("I am calling ");
				dispatch(addPeerAction(peerId, peerStream));
			});
		});

		me.on("call", (call) => {
			console.log("I am receiving call");
			call.answer(stream);
			call.on("stream", (peerStream) => {
				dispatch(addPeerAction(call.peer, peerStream));
			});
		});
	}, [me, stream]);
	console.log({ peers });
	return (
		<RoomContext.Provider
			value={{
				ws,
				me,
				stream,
				chat,
				peers,
				shareScreen,
				screenSharingId,
				setRoomId,
				toggleChat,
				sendMessage,
			}}>
			{children}
		</RoomContext.Provider>
	);
};
