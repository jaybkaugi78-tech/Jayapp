import { useEffect, useState } from "react";

function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed bottom-6 right-6 bg-blue-900 text-white px-4 py-3 rounded-full shadow-lg"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default DarkModeToggle;