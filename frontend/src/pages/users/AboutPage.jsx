function AboutPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">About Petal Express</h1>

      <p className="text-gray-600 max-w-xl">
        Petal Express is your trusted flower delivery service. We provide
        fresh, handcrafted bouquets for every occasion. This is a simple
        MVP About Page for now.
      </p>

      <div className="mt-6">
        <img
          src="https://images.unsplash.com/photo-1526045478516-99145907023c"
          alt="flowers"
          className="w-full max-w-md rounded-lg shadow"
        />
      </div>
    </div>
  );
}

export default AboutPage;
