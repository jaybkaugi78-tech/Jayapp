function Contact() {
  return (
    <div>
      <section className="bg-blue-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">
          Contact Us
        </h1>
      </section>

      <section className="max-w-5xl mx-auto py-20 px-6">

        <div className="grid md:grid-cols-2 gap-10">

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Get In Touch
            </h2>

            <p className="mb-4">
              📍 Nairobi, Kenya
            </p>

            <p className="mb-4">
              📞 +254 700 000 000
            </p>

            <p>
              ✉ info@kaugiacademy.ac.ke
            </p>
          </div>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Name"
              className="w-full p-4 border rounded-lg"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 border rounded-lg"
            />

            <textarea
              rows="5"
              placeholder="Message"
              className="w-full p-4 border rounded-lg"
            ></textarea>

            <button
              className="bg-blue-900 text-white px-8 py-3 rounded-lg"
            >
              Send Message
            </button>

          </form>

        </div>

      </section>
    </div>
  );
}

export default Contact;