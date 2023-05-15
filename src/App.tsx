import React, { useEffect } from "react";

import "./App.css";
import { CreateMeetingBtn } from "./components/CreateMeetingBtn";

function App() {
	return (
		<div className='flex h-screen w-screen items-center justify-center'>
			<CreateMeetingBtn />
		</div>
	);
}

export default App;
