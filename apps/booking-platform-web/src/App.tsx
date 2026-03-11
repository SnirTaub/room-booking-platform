import { Navigate, Route, Routes } from "react-router-dom";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { SearchRoomsPage } from "./pages/SearchRoomsPage";
import { ProtectedRoute } from "./components/common/protectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/rooms" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <SearchRoomsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;