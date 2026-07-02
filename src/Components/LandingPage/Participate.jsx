import { useState } from "react";
const Participates = () => {
  const [feedback, setFeedback] = useState("");
  return (

    
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <h1 className="text-3xl font-bold bg-amber-400 px-4 py-2 rounded ">Coming soon?</h1>
    <input type="text" 
    placeholder="Give feedback here" 
    value={feedback} onChange={(e)=> setFeedback(e.target.value)}
    className="border border-gray-400 p-1.5 w-70 rounded-lg "/>

    <a
        href={feedback.trim() ? "/submit" : "#"}
        className={`px-4 py-2 rounded text-sm ${
          feedback.trim()
            ? "bg-blue-800 text-white"
            : "bg-gray-400 text-gray-200 pointer-events-none"
        }`}
      >
        Submit
      </a>
    </div>
  );
};

export default Participates;