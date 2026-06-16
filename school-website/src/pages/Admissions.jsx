function Admissions() {
  return (
    <div>
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">
          Admissions
        </h1>
      </section>

      <div className="max-w-4xl mx-auto py-16 px-6">

        <h2 className="text-3xl font-bold mb-8">
          Apply to Kaugi Academy
        </h2>

        <form className="space-y-6">

          <input
            type="text"
            placeholder="Student Name"
            className="w-full p-4 border rounded-lg"
          />

          <input
            type="email"
            placeholder="Parent Email"
            className="w-full p-4 border rounded-lg"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full p-4 border rounded-lg"
          />

          <textarea
            rows="5"
            placeholder="Tell us about the student"
            className="w-full p-4 border rounded-lg"
          ></textarea>

          <button
            type="submit"
            className="bg-yellow-500 px-8 py-4 rounded-lg font-semibold"
          >
            Submit Application
          </button>

        </form>

      </div>
    </div>
  );
}

export default Admissions;