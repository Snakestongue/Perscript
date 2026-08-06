import { Link } from "react-router-dom";
import { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import Header from "../components/Header.js";
import Nav from "../components/Nav.js";
import Footer from "../components/Footer.js";
function Sug() {
  useEffect(() => {
    document.title = "FRC Programming Practice | Add a Suggestion";
  }, []);
  const [currentSug, setSug] = useState("")
  const [category, setCategory] = useState("Feature");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async() =>{ 
    if (!currentSug.trim()){
      alert("Please fill out textbox!")
      return;
    }
    if (rating == 0) {
      alert("Please rate the website!");
      return;
    }
    setLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_LINK, {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestReq: currentSug,
          rating,
          category
        }),
      });
      // console.log(res.status);
      // console.log(res.ok);

      const data = await res.json();
      if (res.ok){
        alert("Suggestion submitted!");
        setSug(""); 
      }else{
        // console.log("Error " +data.message)
        alert("Error! Try again later!")
      }
    }catch (error){
      alert("Error! Try again later.");
      console.log(error)
    }finally{
      setLoading(false);
    }
  };
  return (
    <div >
      <Header />
      <Nav />
      <div className="flex justify-center px-4 py-8 mt-6">
      <div className="w-full max-w-2xl rounded-xl p-6 shadow-lg bg-[#10141d] border border-[#7aadff31]">

        <h2 className="mb-2 text-3xl font-bold flex flex-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>Suggestions</h2>

        <p className="mb-6 text-gray-500">
          Found a bug or have an idea? I'd love to hear it!
        </p>

        <label className="mb-2 block font-semibold py-3">Category</label>

        <select
          className="mb-6 w-full rounded-lg border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Feature</option>
          <option>Bug</option>
          <option>UI/UX</option>
          <option>Performance</option>
          <option>Other</option>
        </select>
        <label className="mb-2 block font-semibold">Your suggestion</label>

        <textarea
          className="mb-2 h-40 w-full rounded-lg border p-3 resize-none"
          value={currentSug}
          onChange={(e) => setSug(e.target.value)}
          placeholder="Tell me what you'd like to improve..."
          maxLength={500}
        />
        <p className="mb-6 text-right text-sm text-gray-500">{currentSug.length}/500</p>
        <label className="mb-2 block font-semibold">Rate the website</label>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className="text-4xl transition hover:scale-125"
            >
              <span className={s <= rating ? "text-yellow-400" : "text-gray-300"}>★</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !currentSug.trim()}
          className="
          w-full rounded-lg bg-[#7AADFF] 
          py-3 font-semibold text-white 
          transition hover:bg-[#5194ff] hover:cursor-pointer
          disabled:cursor-not-allowed 
          disabled:bg-gray-400">
          {loading ? "Submitting..." : "Submit Suggestion"}
        </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Sug;