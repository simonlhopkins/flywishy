import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Visualizer from "./Components/Visualizer";
import PrivateRoutes from "./Components/PrivateRoutes";
import LoginPage from "./Components/LoginPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Visualizer />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
