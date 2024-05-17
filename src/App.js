import logo from "./logo.svg";
import "./App.css";
import Login from "./pages/login";
import Dashboard from "./pages/dashobard";
import Task from './pages/task';
import Chat from "./pages/chat/chat";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
function App() {
  return (
    <div className="App">
       <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/task" element={<Task />}></Route>
          <Route path="/chat" element={<Chat />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
