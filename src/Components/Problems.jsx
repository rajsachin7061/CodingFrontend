import { useLocation } from "react-router-dom";
import "./problems.css";

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

<div className="Container">
  <div className="f">Sachin kumar</div>
  
  <div className="s">puja kumar
    <div class="practiesmodularheader">
      <div class="PracticemoduleNumberbadge">
        <span class="PracticemoduleNumber">1</span>
        </div>
        <div class="practicemoduleinfo">
          <h3 class="practicemoduletitel">Print statement and java Syntex</h3>
          <p class="practicemoduledescription">
            Practice the basic concept of java one of the moust widly used object oriented programing languages 
          </p>
        </div>

        <div class="practicemoduleprogress"></div>
        <span></span>
      </div>
     <div class="div2">div2</div>
     <div class="div3">div3</div>
     <div class="div4">div4</div>
     <div class ="div5">div5</div>
     <div class="div6">div6</div>
     <div class="div7">div7</div>
     <div class="div8">div8</div>
     <div class="div9">div9</div>
  </div>
</div>























    
    
  );
};

export default Problems;
