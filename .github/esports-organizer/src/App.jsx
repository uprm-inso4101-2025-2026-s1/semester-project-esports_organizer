import { useNavigate } from "react-router-dom";
import Button from "./components/shared/Button";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <div>Hello World! </div>
      <Button
        text={"User Authentication Pages"}
        onClick={() => navigate("/signup")}
      />
    </>
  );
}

export default App;
