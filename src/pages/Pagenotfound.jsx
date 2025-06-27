import Header from "../componet/Header"
import Footer from "../componet/Footer"

const Pagenotfound = () => {
  return (
    <div className="min-h-screen flex flex-col">
   
      <main className="flex-1 flex flex-col items-center justify-center text-center p-5">
        <h1 className="text-8xl md:text-9xl text-red-500 font-bold mb-4">404</h1>
        <h2 className="text-3xl md:text-4xl text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Oops! It seems we've wandered off the path. The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors duration-300"
        >
          Back to Home
        </a>
      </main>
     
    </div>
  )
}

export default Pagenotfound