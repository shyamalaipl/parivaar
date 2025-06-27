import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { AiOutlineShareAlt } from "react-icons/ai";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logoImage from "../../src/img/parivarlogo1.png";

const CustomLogoLoader = () => {
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById("spin-keyframes")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "spin-keyframes";
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: "5px",
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
      }}
    >
      <img
        src={logoImage}
        alt="Rotating Logo"
        style={{
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
        }}
      />
    </div>
  );
};

export default function Product() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // New state for enlarged image
  const { id } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://parivaar.app/public/api/marketplaces",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.message == "All marketplace items fetched successfully") {
          const formattedProducts = data.data.map((item) => ({
            id: item.M_Id,
            name: item.M_Title,
            price: parseFloat(item.M_Price),
            description: item.M_Description,
            images: item.M_Image,
            sellerName: item.M_Name,
            mobile: item.M_Mobile,
            address: item.M_Address,
            category: item.M_Category,
            status: item.M_Status,
            details: [
              `Category: ${item.M_Category}`,
              `Status: ${item.M_Status}`,
              "Contact seller for more details",
            ],
            additionalInfo: [
              { label: "Seller", value: item.M_Name },
              { label: "Contact", value: item.M_Mobile },
              { label: "Address", value: item.M_Address },
            ],
          }));
          setProducts(formattedProducts);
          const foundProduct = formattedProducts.find(
            (p) => p.id == Number.parseInt(id)
          );
          setProduct(foundProduct || null);
        } else {
          throw new Error(
            "Unexpected API response: " +
              (data.message || "No message provided")
          );
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(
          err.message || "An unknown error occurred while fetching products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  const tabs = [
    {
      label: "Description",
      content: product && (
        <div>
          <p className="text-gray-600">{product.description}</p>
          <ul className="mt-4 space-y-2">
            {product.details.map((detail, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1A2B49]" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      label: "Seller Information",
      content: product && (
        <dl className="space-y-4">
          {product.additionalInfo.map((info, i) => (
            <div key={i} className="flex justify-between border-b pb-2">
              <dt className="font-medium">{info.label}</dt>
              <dd className="text-gray-600">{info.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleImageClick = (image) => {
    setEnlargedImage(image); // Set the clicked image to enlarge
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null); // Close the enlarged image view
  };

  if (loading) {
    return <CustomLogoLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto mt-20 px-4 py-8">Product not found</div>
    );
  }

  return (
    <>
      <div className="div mt-25 mb-0 container mx-auto">
        <nav
          className="flex items-center gap-2 text-sm"
          aria-label="breadcrumb"
        >
          <Link to="/home" className="text-[#1A2B49] font-bold">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/shop" className="text-[#1A2B49] font-bold">
            Marketplace
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-[#1A2B49]">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square w-full max-w-[500px] shadow-2xl overflow-hidden rounded-lg">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover object-center cursor-pointer"
                onClick={() => handleImageClick(product.images[selectedImage])}
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 aspect-square w-20 overflow-hidden rounded-lg bg-white 
                    ${
                      selectedImage == i ? "ring-2 ring-[#1A2B49]" : ""
                    } hover:ring-2 hover:ring-[#1A2B49] transition-all`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${i + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className="text-2xl font-semibold text-[#1A2B49]">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-b">
              <div className="flex space-x-8">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`pb-2 text-sm font-medium outline-none transition-colors
                      ${
                        activeTab == idx
                          ? "border-b-2 border-[#1A2B49] text-[#1A2B49]"
                          : "text-gray-600 hover:text-[#1A2B49]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4">{tabs[activeTab].content}</div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.id !== product.id && p.status == "Active")
              .map((relatedProduct) => (
                <div key={relatedProduct.id} className="flex flex-col">
                  <div className="group relative">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={relatedProduct.images[0] || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="mt-4 px-2 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-bold text-[#1A2B49]">
                            ₹{relatedProduct.price.toFixed(2)}
                          </p>
                          <button className="text-sm text-gray-500 hover:text-[#1A2B49] cursor-pointer transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Enlarged Image View */}
      {enlargedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={closeEnlargedImage}
              className="absolute top-4 right-4 text-black cursor-pointer text-3xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={enlargedImage}
              alt="Enlarged view"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onError={(e) => (e.target.src = "/placeholder.svg")}
            />
          </div>
        </div>
      )}
    </>
  );
}
