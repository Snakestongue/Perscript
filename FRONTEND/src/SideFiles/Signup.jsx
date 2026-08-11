import Header from "../components/Header.js"
import Nav from "../components/Nav.js"
import Footer from "../components/Footer.js"
import { useState } from "react"

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  let [loading, setLoading] = useState(false)
  async function handleSignup() {
    const newUsername = username.trim()
    const newMail = email.trim()
    const newPass = password.trim()
    if (!newUsername || !newMail || !newPass || !agreed) {
      alert("Please fill out all fields and accept the terms!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_LOCAL + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          email: newMail,
          password: newPass,
          checkbox: agreed,
        }),
      });
      const data = await response.json();
      if (response.ok){
        localStorage.setItem("userName", data.user.user);
        window.location.href = "/tut";
      } else {
        alert(data.message);
      }
    }catch (error) {
      alert("Internal Server Error");
    }
    setLoading(false);
  }
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSignup();
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#13191f] rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-[#fff] mb-6">Create an account
          </h1>

          <label className="block text-[#fff] font-medium mb-2">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(i) => setUsername(i.target.value)}
            onKeyDown={handleKeyDown}
            className="
            w-full px-4 
            border border-gray-300 
            rounded-lg py-3 mb-5
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 text-[#fff]"
          />
          <label className="block text-[#fff] font-medium mb-2">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(i) => setEmail(i.target.value)}
            onKeyDown={handleKeyDown}
            className="
              w-full px-4 
              border border-gray-300 
              rounded-lg py-3 mb-5
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-500 text-[#fff]"
            />

          <label className="block text-[#fff] font-medium mb-2">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(i) => setPassword(i.target.value)}
            onKeyDown={handleKeyDown}
             className="
              w-full px-4 
              border border-gray-300 
              rounded-lg py-3 mb-5
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-500 text-[#fff]"
            />

          <label className="flex items-center gap-2 text-[#fff] mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(i) => setAgreed(i.target.checked)}
            />I agree to the terms and conditions
          </label>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="
            w-full bg-blue-600 
            text-white
            font-semibold hover:bg-blue-700 
            transition duration-200
            disabled:opacity-50 
            disabled:cursor-not-allowed 
            py-3 rounded-lg"
          >{loading ? "Signing up..." : "Sign up"}
          </button>

          <p className="text-center text-[#fff] mt-5">Already have an account?{" "}
            <a
              href="/login"
              className="text-[#fff] font-medium hover:underline"
            >Log in.
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;