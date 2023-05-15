import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Chat } from "../components/chat/Chat";
import { Chatbutton } from "../components/ChatButton";
import { Sharebutton } from "../components/Sharebutton";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../reducers/peerReducer";
import { RoomContext } from "../context/RoomContext";

export const Room = () => {
	const { id } = useParams();
	const {
		ws,
		me,
		stream,
		peers,
		shareScreen,
		screenSharingId,
		setRoomId,
		toggleChat,
		chat,
	} = useContext(RoomContext);

	console.log({ screenSharingId });
	const screenSharingVideo =
		screenSharingId === me?.id ? stream : peers[screenSharingId]?.stream;

	const { [screenSharingId]: sharing, ...peersToShow } = peers;

	useEffect(() => {
		if (me) ws.emit("join-room", { roomId: id, peerId: me._id });
	}, [id, me, ws]);

	useEffect(() => {
		setRoomId(id);
	}, [id, setRoomId]);
	return (
		<div className='flex flex-col min-h-screen'>
			<p className='bg-rose-500 p-2 w-[500px] text-white'>Room ID: {id}</p>
			<div className='flex grow'>
				{screenSharingVideo && (
					<div className='w-4/5 pr-4'>
						<VideoPlayer stream={screenSharingVideo} />
					</div>
				)}

				<div
					className={`grid  gap-4 ${
						screenSharingVideo ? "w-1/5 grid-col-1" : "grid-cols-4"
					}`}>
					{/* {screenSharingId !== me.id && <VideoPlayer stream={stream} />} */}
					{<VideoPlayer stream={stream} />}
					{Object.values(peersToShow as PeerState).map((peer) => {
						return <VideoPlayer stream={peer.stream} />;
					})}
				</div>
				{chat.isChatOpen && (
					<div className='border-l-2 pb-28'>
						<Chat />
					</div>
				)}
			</div>
			<div className='h-28 fixed  bottom-0 p-6 w-full flex items-center justify-center border-t-2 bg-white'>
				<Sharebutton onClick={shareScreen} />
				<Chatbutton onClick={toggleChat} />
			</div>
		</div>
	);
};
