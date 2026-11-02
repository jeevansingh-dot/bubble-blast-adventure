import { Link } from "react-router-dom";
import { GAME_NAME } from "../config/gameConfig.js";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <h1>Page not found</h1>
      <p>This page does not exist in {GAME_NAME}.</p>
      <Link to="/" style={{ color: "#ffd93d" }}>
        Go to the home page
      </Link>
    </div>
  );
}