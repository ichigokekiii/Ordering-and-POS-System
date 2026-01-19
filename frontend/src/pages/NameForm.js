import { useState } from "react";
import api from "../services/api";

function NameForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/names", { name });
      setMessage(res.data.message);
      setName("");
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Enter your name</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default NameForm;
