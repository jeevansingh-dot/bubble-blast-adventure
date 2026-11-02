import { useNavigate } from "react-router-dom";
import LevelSelect from "../components/LevelSelect.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { progressFromUser } from "../utils/progress.js";

export default function LevelsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <LevelSelect
      progress={progressFromUser(user)}
      onSelect={(id) => navigate(`/game/${id}`)}
    />
  );
}