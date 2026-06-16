function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section
        className="h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="bg-black/60 p-10 rounded-xl text-center text-white max-w-4xl">

          <h1 className="text-6xl font-bold mb-6">
            Kaugi Academy
          </h1>

          <p className="text-2xl mb-4">
            Excellence • Leadership • Innovation
          </p>

          <p className="text-lg mb-8">
            Empowering students with knowledge, character,
            and skills for a successful future.
          </p>

          <div className="flex justify-center gap-4">
            <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
              Apply Now
            </button>

            <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">

          <div className="shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-4xl font-bold text-blue-900">
              2500+
            </h2>
            <p>Students</p>
          </div>

          <div className="shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-4xl font-bold text-blue-900">
              150+
            </h2>
            <p>Teachers</p>
          </div>

          <div className="shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-4xl font-bold text-blue-900">
              98%
            </h2>
            <p>Exam Success Rate</p>
          </div>

          <div className="shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-4xl font-bold text-blue-900">
              50+
            </h2>
            <p>Clubs & Activities</p>
          </div>

        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-bold mb-6 text-center">
            Welcome to Kaugi Academy
          </h2>

          <p className="text-lg text-center max-w-4xl mx-auto leading-8">
            Kaugi Academy is committed to nurturing academic excellence,
            leadership, creativity, and integrity. Our modern learning
            environment prepares students to thrive in a rapidly changing
            world while upholding strong values and discipline.
          </p>

        </div>
      </section>
    </>
  );
}

export default Home;