import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { AiOutlineShareAlt } from "react-icons/ai";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
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
  const [activeProducts, setActiveProducts] = useState([]);
  const [inactiveProducts, setInactiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const { id } = useParams();

  const categories = [
    "Electronics",
    "Furniture",
    "Clothes",
    "Footwear",
    "Books",
    "Vehicles",
    "Real Estate",
    "Toys",
    "Sports",
    "Fitness",
    "Handicrafts",
    "Others",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.U_Id) {
          throw new Error("User not logged in");
        }

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
          const userProducts = data.data.filter(
            (item) => item.U_Id == storedUser.U_Id
          );
          const formattedProducts = userProducts.map((item) => ({
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
            u_id: item.U_Id,
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
          setActiveProducts(
            formattedProducts.filter((p) => p.status == "Active")
          );
          setInactiveProducts(
            formattedProducts.filter((p) => p.status == "Inactive")
          );
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

  const handleMarkAsSold = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };

      const response = await fetch(
        `https://parivaar.app/public/api/marketplaces/${productId}`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({ M_Status: "Inactive" }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Product Marked as Sold!",
          text: "The product status has been updated to Inactive.",
          confirmButtonText: "OK",
        });

        setProducts((prev) =>
          prev.map((p) =>
            p.id == productId ? { ...p, status: "Inactive" } : p
          )
        );
        setActiveProducts((prev) => prev.filter((p) => p.id !== productId));
        setInactiveProducts((prev) => [
          ...prev,
          { ...products.find((p) => p.id == productId), status: "Inactive" },
        ]);
      } else {
        const errorMessage =
          result.message || "Failed to update product status";
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errorMessage,
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error marking as sold:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditProduct({
      id: product.id,
      M_Title: product.name,
      M_Description: product.description || "",
      M_Price: product.price,
      M_Category: product.category,
      M_Address: product.address,
      M_Images: [],
      existingImages: product.images,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const oversizedFiles = files.filter((file) => file.size > 2 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: "One or more images exceed 2MB limit. Please upload smaller files.",
        confirmButtonText: "OK",
      });
      return;
    }

    setEditProduct((prev) => ({ ...prev, M_Images: files }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formDataToSend = new FormData();
      formDataToSend.append("M_Title", editProduct.M_Title);
      formDataToSend.append("M_Description", editProduct.M_Description);
      formDataToSend.append("M_Price", editProduct.M_Price);
      formDataToSend.append("M_Category", editProduct.M_Category);
      formDataToSend.append("M_Address", editProduct.M_Address);
      editProduct.M_Images.forEach((image, index) => {
        formDataToSend.append(`M_Image[]`, image);
      });

      const response = await fetch(
        `https://parivaar.app/public/api/marketplaces/${editProduct.id}`,
        {
          method: "PUT",
          headers: headers,
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Product Updated!",
          text: "Your product has been successfully updated.",
          confirmButtonText: "OK",
        });

        setProducts((prev) =>
          prev.map((p) =>
            p.id == editProduct.id
              ? {
                  ...p,
                  name: editProduct.M_Title,
                  description: editProduct.M_Description,
                  price: parseFloat(editProduct.M_Price),
                  category: editProduct.M_Category,
                  address: editProduct.M_Address,
                  images: editProduct.M_Images.length > 0 ? [] : p.images, // Update images if new ones uploaded
                  details: [
                    `Category: ${editProduct.M_Category}`,
                    `Status: ${p.status}`,
                    "Contact seller for more details",
                  ],
                  additionalInfo: [
                    { label: "Seller", value: p.sellerName },
                    { label: "Contact", value: p.mobile },
                    { label: "Address", value: editProduct.M_Address },
                  ],
                }
              : p
          )
        );

        setActiveProducts((prev) =>
          prev.map((p) =>
            p.id == editProduct.id
              ? {
                  ...p,
                  name: editProduct.M_Title,
                  description: editProduct.M_Description,
                  price: parseFloat(editProduct.M_Price),
                  category: editProduct.M_Category,
                  address: editProduct.M_Address,
                  images: editProduct.M_Images.length > 0 ? [] : p.images,
                }
              : p
          )
        );

        setInactiveProducts((prev) =>
          prev.map((p) =>
            p.id == editProduct.id
              ? {
                  ...p,
                  name: editProduct.M_Title,
                  description: editProduct.M_Description,
                  price: parseFloat(editProduct.M_Price),
                  category: editProduct.M_Category,
                  address: editProduct.M_Address,
                  images: editProduct.M_Images.length > 0 ? [] : p.images,
                }
              : p
          )
        );

        if (product && product.id == editProduct.id) {
          setProduct((prev) => ({
            ...prev,
            name: editProduct.M_Title,
            description: editProduct.M_Description,
            price: parseFloat(editProduct.M_Price),
            category: editProduct.M_Category,
            address: editProduct.M_Address,
            images: editProduct.M_Images.length > 0 ? [] : prev.images,
          }));
        }

        setEditProduct(null);
      } else {
        const errorMessage = result.message || "Failed to update product";
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: errorMessage,
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

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
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const handleImageClick = (image) => {
    setEnlargedImage(image);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
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

  return (
    <>
      <div className="container mx-auto mt-20 mb-0">
        <nav
          className="flex items-center gap-3 mt-8 text-sm font-medium bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200"
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
          <span className="text-[#1A2B49]">
            {product?.name || "Your Products"}
          </span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        {product && (
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="space-y-4">
              <div className="aspect-square w-full max-w-[500px] shadow-2xl overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover object-center cursor-pointer"
                  onClick={() =>
                    handleImageClick(product.images[selectedImage])
                  }
                  onError={(e) => (e.target.src = "/placeholder.svg")}
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
                      onError={(e) => (e.target.src = "/placeholder.svg")}
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

              <div className="flex gap-4">
                {product.status == "Active" && (
                  <>
                    <button
                      onClick={() => handleMarkAsSold(product.id)}
                      className="bg-[#1A2B49] text-white py-2 px-4 rounded-lg hover:bg-[#2a3b59]"
                    >
                      Mark as Sold
                    </button>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                      Edit Product
                    </button>
                  </>
                )}
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
        )}

        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Active Listings
          </h2>
          {activeProducts.length == 0 ? (
            <p className="text-center text-gray-600">
              No active listings found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <Link to={`/product/${p.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.images[0] || "/placeholder.svg"}
                        alt={p.name}
                        className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-lg font-bold text-[#1A2B49] mt-1">
                      ₹{p.price.toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleMarkAsSold(p.id)}
                        className="flex-1 bg-[#1A2B49] text-white py-2 rounded-lg hover:bg-[#2a3b59]"
                      >
                        Mark as Sold
                      </button>
                      <button
                        onClick={() => handleEditClick(p)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Sold/Inactive Listings
          </h2>
          {inactiveProducts.length == 0 ? (
            <p className="text-center text-gray-600">
              No sold or inactive listings found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <Link to={`/product/${p.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.images[0] || "/placeholder.svg"}
                        alt={p.name}
                        className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-lg font-bold text-[#1A2B49] mt-1">
                      ₹{p.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 mt-3"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      
      </div>

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

      {editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleEditSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label
                  htmlFor="M_Title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="M_Title"
                  name="M_Title"
                  value={editProduct.M_Title}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="M_Description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="M_Description"
                  name="M_Description"
                  rows={4}
                  value={editProduct.M_Description}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="M_Price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="M_Price"
                    name="M_Price"
                    value={editProduct.M_Price}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="M_Category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="M_Category"
                    name="M_Category"
                    value={editProduct.M_Category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="M_Address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="M_Address"
                  name="M_Address"
                  value={editProduct.M_Address}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="M_Images"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Images
                </label>
                <input
                  id="M_Images"
                  type="file"
                  name="M_Images"
                  onChange={handleEditImageUpload}
                  className="w-full px-4 py-2"
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  multiple
                />
                {editProduct.existingImages.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {editProduct.existingImages.map((image, i) => (
                      <img
                        key={i}
                        src={image}
                        alt={`Existing ${i + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => (e.target.src = "/placeholder.svg")}
                      />
                    ))}
                  </div>
                )}
                {editProduct.M_Images.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {editProduct.M_Images.length} new image(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#1A2B49] text-white py-2 rounded-lg hover:bg-[#2a3b59]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
