import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">

        <h1 className="text-2xl font-bold">
          Excellence Academy
        </h1>

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
    </nav>
  );
}

export default Navbar;