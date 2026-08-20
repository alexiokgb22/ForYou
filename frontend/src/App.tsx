import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./pages/LoginScreen";
import Dashboard from "./pages/Dashboard";
import CollectionDetail from "./pages/CollectionDetail";
import LetterReader from "./pages/LetterReader";
import WriteLetter from "./pages/WriteLetter";
import "./styles/variables.css";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/collections/:token" element={<CollectionDetail />} />
        <Route path="/collections/:token/letters/:id" element={<LetterReader />} />
        <Route path="/write/:token" element={<WriteLetter />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
