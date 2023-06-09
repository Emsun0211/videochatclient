import React, { useContext } from "react";
import { RoomContext } from "../../context/RoomContext";
import { IMessage } from "../../types/chat";
import { ChatBubble } from "./ChatBubbles";
import { ChatInput } from "./ChatInput";

export const Chat: React.FC = ({}) => {
	const { chat } = useContext(RoomContext);
	console.log(chat.messages);

	return (
		<div className='flex flex-col h-full justify-between'>
			<div>
				{chat?.messages.map((message: IMessage) => (
					<ChatBubble message={message} />
				))}
			</div>
			<ChatInput />
		</div>
	);
};
