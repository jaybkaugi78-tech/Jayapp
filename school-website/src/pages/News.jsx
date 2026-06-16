function News() {
  const news = [
    {
      title: "Science Fair 2026",
      desc: "Students showcased innovative projects."
    },
    {
      title: "National Exam Results",
      desc: "Kaugi Academy achieved a 98% pass rate."
    },
    {
      title: "Sports Championship",
      desc: "Our football team won the regional title."
    }
  ];

  return (
    <div>
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">
          News & Events
        </h1>
      </section>

      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                {item.title}
              </h2>

              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default News;