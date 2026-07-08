"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import LoginView from "../components/auth/LoginView";
import { authenticate } from "../lib/api";
import { getRoleFromToken } from "../lib/auth";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setMessage("");

      const data = await authenticate(email, password);

      if (!data.access_token) {
        setMessage("Credenciales incorrectas");
        return;
      }

      localStorage.setItem("token", data.access_token);

      const role = getRoleFromToken(data.access_token);

      if (role?.toLowerCase() === "admin") {
        router.push("/admin");
      } else {
        router.push("/projects");
      }
    } catch {
      localStorage.removeItem("token");
      setMessage("Credenciales incorrectas o error de conexión");
    }
  }

  return (
    <LoginView
      showThemeToggle
      email={email}
      password={password}
      message={message}
      onEmailChange={(event) => setEmail(event.target.value)}
      onPasswordChange={(event) => setPassword(event.target.value)}
      onSubmit={handleLogin}
    />
  );
}
