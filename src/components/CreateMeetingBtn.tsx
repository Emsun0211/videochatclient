import { useContext } from "react";

import { RoomContext } from "../context/RoomContext";

export const CreateMeetingBtn: React.FC = () => {
	const { ws } = useContext(RoomContext);
	const createMeeting = () => {
		ws.emit("create-room");
	};
	return (
		<button
			onClick={createMeeting}
			className='bg-rose-400 px-8 py-2 text-white rounded-lg text-xl hover:bg-rose-600'>
			Start New Meeting{" "}
		</button>
	);
};
