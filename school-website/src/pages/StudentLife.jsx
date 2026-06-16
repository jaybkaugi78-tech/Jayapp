function StudentLife() {
  const activities = [
    "Football",
    "Basketball",
    "Volleyball",
    "Drama Club",
    "Debate Club",
    "Music Club",
    "Scouts",
    "Science Club",
  ];

  return (
    <div>
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">Student Life</h1>
        <p className="mt-4 text-xl">
          Learn, Explore, Lead and Grow
        </p>
      </section>

      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-4 gap-6">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg text-center hover:scale-105 transition"
            >
              <h3 className="font-bold text-xl text-blue-900">
                {activity}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentLife;