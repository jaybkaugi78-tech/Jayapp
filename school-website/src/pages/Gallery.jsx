function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a",
  ];

  return (
    <div>
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">
          Gallery
        </h1>
      </section>

      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="School"
              className="rounded-xl shadow-lg hover:scale-105 transition"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Gallery;