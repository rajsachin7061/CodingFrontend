const StartQuiz = () => {
  return (
    <div className="flex items-center justify-center px-60 py-30 ">
      <h1>Give A quiz for </h1>
      <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 hover:scale-105 transition duration-200 cursor-pointer">
        <a href="/java">Start</a>
      </button>
    </div>
  );
};

export default StartQuiz;