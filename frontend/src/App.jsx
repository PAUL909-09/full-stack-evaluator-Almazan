import Tasks from "./pages/Tasks";
import "./index.css";

function App() {
  return (
    <div className="app">
      <h1 className="text-3xl font-bold text-center my-6">
        📝 React Task Evaluator
      </h1>
      <Tasks />
    </div>
  );
}

export default App;
