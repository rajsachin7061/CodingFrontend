import { useLocation } from "react-router-dom";

const problemCategories = {
  "/javaproblem": "Java",
  "/cppproblem": "C++",
  "/htmlproblem": "HTML",
  "/cssproblem": "CSS",
};

const Problems = () => {
  const { pathname } = useLocation();
  const category = problemCategories[pathname] || "Java";

  return (
    <div className="problems-page">
      <h1>{category} Problems</h1>
      <p>Here you can practice problems for the selected languageses. </p>{" "}
      <a href="/question-details">
        {" "}
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
        <br></br>
        1.Which feature allows same method name with different parameters?e{" "}
        <button class="button">Solve</button>
      </a>
    </div>
  );
};

export default Problems;
