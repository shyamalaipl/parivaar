import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaGooglePlay } from "react-icons/fa";
import img1 from "../img/parivarlogo1.png";
import "./Footer.css";
import { NavLink } from "react-router-dom";
import { Download } from "lucide-react";
import { IoLogoGooglePlaystore } from "react-icons/io5";

const Footer = () => {
  const navItems = [
    { to: "/home", label: "Home" },
    { to: "/news", label: "Notice" },
    { to: "/celebration", label: "Celebration" },
    { to: "/condolences", label: "Condolences" },
    { to: "/event", label: "Event" },
    { to: "/Gallery", label: "Gallery" },
    { to: "https://matrimonialweb.netlify.app/", label: "Matrimony" },
    { to: "/Job", label: "Job" },
    { to: "/shop", label: "shop" },
  ];

  return (
    <footer className="bg-[#1A2B49] text-white py-12 mt-auto px-6 md:px-16">
  <div className="container px-6 mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      
      {/* Left Section */}
      <div>
        <div className="flex items-center gap-2">
          <img src={img1} className="w-10" alt="Parivar Logo" />
          <p className="text-lg font-semibold">Parivaar</p>
        </div>
        <p className="text-gray-400 mt-3 text-sm">
          A community platform preserving cultural identity and fostering growth through free and premium services, digital engagement, and physical events — ensuring active participation across all age groups.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-lg mb-4 text-white">Our Features</h3>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <ul className="space-y-2 text-gray-400 text-sm">
            {navItems.slice(0, 5).map((item) => (
              <NavLink key={item.to} to={item.to}>
                <li className="hover:text-white cursor-pointer">{item.label}</li>
              </NavLink>
            ))}
          </ul>
          <ul className="space-y-2 text-gray-400 text-sm">
            {navItems.slice(5).map((item) => (
              <NavLink key={item.to} to={item.to}>
                <li className="hover:text-white cursor-pointer">{item.label}</li>
              </NavLink>
            ))}
          </ul>
        </div>
      </div>

      {/* App Download */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold">Download Our App</h3>
        <a
          href="https://play.google.com/store/apps/details?id=com.arth.aark.parivaar&pli=1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#1A2B49] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
        >
          <IoLogoGooglePlaystore className="w-5 h-5" />
          Get it on Google Play
        </a>
      </div>

    </div>
  </div>
</footer>

  );
};

export default Footer;