import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <>

      <div className="mx-auto max-w-7xl px-8 py-20">
        <h2 className="mb-10 text-2xl font-semibold">Test Products</h2>

        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border p-4 text-center"
            >
              <img
                src={product.image}
                alt={product.name}
                className="mb-4 h-48 w-full rounded object-cover"
              />

              <h3 className="font-medium">{product.name}</h3>
              <p className="mt-1 text-gray-500">₱{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ProductPage;
