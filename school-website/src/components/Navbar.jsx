import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
 <img
    src="/logo.png"
    alt="Kaugi Academy"
    className="h-12 w-12"
  />
        <h1 className="text-3xl font-bold text-yellow-400">
          Kaugi Academy
        </h1>

        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <div className="hidden md:flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/academics">Academics</Link>
          <Link to="/admissions">Admissions</Link>
          <Link to="/student-life">Student Life</Link>
          <Link to="/news">News</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-blue-950 flex flex-col p-4 gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/academics">Academics</Link>
          <Link to="/admissions">Admissions</Link>
          <Link to="/student-life">Student Life</Link>
          <Link to="/news">News</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;