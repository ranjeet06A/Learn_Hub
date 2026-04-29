import { useState } from "react";
import { changePassword } from "../utils/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleReset = () => {
    changePassword(email, newPass);
    alert("Password updated successfully");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Reset Password</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      /><br/><br/>

      <input
        placeholder="New Password"
        onChange={(e) => setNewPass(e.target.value)}
      /><br/><br/>

      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}