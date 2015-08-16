
import {factor} from "./factor";
import SolverModel from "./solver";
// <term>   ::= <factor> [ ('*'|'/') <factor> ]*
const term = function(solver){
  if (solver.isError){
    return solver;
  }

  solver = factor(solver);

  while (true) {
    let tmp = solver.pointSubstr(1);
    let exprSolver = SolverModel.createEmpty()
      .setView(solver.view)
      .setRefIds(solver.refIds)
      .setText(solver.addPointer().pointSubstr());
    if(tmp === "*"){
      solver = solver.addPointer();
      exprSolver = factor(exprSolver);
      if((exprSolver.isError) || (isNaN(exprSolver.value))){
        return solver.setIsError(true);
      }

      solver = solver
        .setValue(solver.value * exprSolver.value)
        .setRefIds(exprSolver.refIds)
        .setIsError(solver.isError || exprSolver.isError)
        .setPointer(solver.pointer + exprSolver.pointer);
      continue;
    }
    else if(tmp === "/"){
      solver = solver.addPointer();
      exprSolver = factor(exprSolver);
      if((exprSolver.isError) || (isNaN(exprSolver.value))){
        return solver.setIsError(true);
      }
      solver = solver
        .setValue(solver.value / exprSolver.value)
        .setRefIds(exprSolver.refIds)
        .setIsError(solver.isError || exprSolver.isError)
        .setPointer(solver.pointer + exprSolver.pointer);
      continue;
    }
    else{
      return solver;
    }
  }
}

export{
  term
};
