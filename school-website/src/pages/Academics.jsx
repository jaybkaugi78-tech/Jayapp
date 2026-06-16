function Academics() {
  const departments = [
    {
      title: "Sciences",
      desc: "Modern laboratories and practical learning in Physics, Chemistry and Biology."
    },
    {
      title: "Mathematics",
      desc: "Strong analytical and problem-solving skills through advanced mathematics."
    },
    {
      title: "Languages",
      desc: "English, Kiswahili and communication skills for global success."
    },
    {
      title: "Humanities",
      desc: "History, Geography, CRE and Social Studies programs."
    },
    {
      title: "Technology",
      desc: "Computer studies, coding and digital literacy programs."
    },
    {
      title: "Arts & Creativity",
      desc: "Music, Art, Drama and creative development opportunities."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Academics
        </h1>

        <p className="text-xl">
          Excellence in Learning and Innovation
        </p>
      </section>

      {/* Departments */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Academic Departments
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                {dept.title}
              </h3>

              <p className="text-gray-600">
                {dept.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Academics;