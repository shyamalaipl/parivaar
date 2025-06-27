import { useCart } from "../contex/cartContext"

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()

  return (
    <div className="min-h-screen bg-gray-100 mt-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-md">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      {item.additionalInfo[0].value}, {item.additionalInfo[1].value}
                    </p>
                    <select
                      className="border p-1 rounded-md bg-white shadow-sm"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-lg">€ {(item.price * item.quantity).toFixed(2)}</p>
                  <button className="text-black text-xl" onClick={() => removeFromCart(item.id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <div className="mb-4">
            <p className="text-gray-700 font-medium text-lg">Jessica Taylor</p>
            <p className="text-gray-500 text-sm">Neubaugasse 30, 1070 Vienna, Austria</p>
          </div>
          <div className="border-t pt-4 mb-4">
            <p className="text-gray-700 font-medium text-lg">Payment Method</p>
            <p className="text-gray-500 text-sm">**** **** **** 5017</p>
          </div>
          <div className="border-t pt-4 mb-4">
            <p className="text-gray-700 font-medium text-lg">Discount Code</p>
            <div className="flex gap-2 mt-2">
              <input type="text" placeholder="Your code here" className="border p-2 w-full rounded-md shadow-sm" />
              <button className="bg-[#1A2B49] text-white px-4 py-2 rounded-md font-medium">APPLY</button>
            </div>
          </div>
          <div className="border-t pt-4 mb-4 text-gray-700 text-lg">
            <p>
              Subtotal ({cart.length} items):{" "}
              <span className="float-right font-semibold">€ {cartTotal.toFixed(2)}</span>
            </p>
            <p>
              Shipping costs: <span className="float-right text-green-500 font-semibold">FREE!</span>
            </p>
            <p className="font-semibold text-xl">
              Total: <span className="float-right">€ {cartTotal.toFixed(2)}</span>
            </p>
          </div>
          <button className="w-full bg-[#1A2B49] text-white py-3 rounded-md font-semibold text-lg shadow-md hover:bg-[#7c7d7f] transition">
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart

