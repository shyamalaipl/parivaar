// Eventhome.jsx
import Slider from "react-slick";
import { useRef } from "react";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";

const Eventhome = () => {
  const sliderRef = useRef(null);

  const nextSlide = () => {
    if (sliderRef.current) sliderRef.current.slickNext();
  };

  const prevSlide = () => {
    if (sliderRef.current) sliderRef.current.slickPrev();
  };

  const events = [
    {
      date: "Nov 20",
      title: "Anna Birthday Party",
      image: "https://demo.harutheme.com/famipress/wp-content/uploads/2024/10/event-single-7.jpg",
    },
    {
      date: "Nov 20",
      title: "Make awesome things with us",
      image: "https://demo.harutheme.com/famipress/wp-content/uploads/2024/10/event-single-8.jpg",
    },
    {
      date: "Nov 20",
      title: "Another Amazing Event",
      image: "https://demo.harutheme.com/famipress/wp-content/uploads/2024/10/event-single-9.jpg",
    },
    {
      date: "Nov 20",
      title: "Family Gathering Celebration",
      image: "https://demo.harutheme.com/famipress/wp-content/uploads/2024/10/event-single-10.jpg",
    },
  ];

  const sliderSettings = {
    // dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    adaptiveHeight: true,
    arrows: false,
    autoplaySpeed: 2000,
    autoplay: true,
  };

  return (
    <div className="bg-[#263042]  shadow   py-8 sm:py-16 px-4 sm:px-8">
      <div className="container mx-auto justify-center  flex flex-col lg:flex-row items-center gap-8">
        {/* Left Content */}
        <div className="w-full lg:w-1/3 text-center lg:text-left px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white  ">
            A Celebration of Our Shared Story
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base">
            The memories we make with our family are everything. The informality of family life is a blessed condition that allows us all to become our best while looking our worst.
          </p>
          <button className="mt-6 bg-[#1A2B49] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold shadow-md cursor-pointer hover:bg-[#448AFF] transition">
            View All Events →
          </button>
        </div>

        {/* Right Content - Slider Section */}
        <div className="relative flex items-center w-full lg:w-2/3 max-w-[800px]">
          {/* Navigation Buttons (Stacked Vertically) */}
          <div className="flex flex-col items-center gap-2 absolute -left-4 sm:-left-10 lg:left-4 z-10">
            <button
              onClick={prevSlide}
              className="text-gray-800 cursor-pointer p-2 sm:p-3 rounded-full shadow-md bg-white hover:bg-gray-200 transition"
            >
              <IoArrowUp className="text-lg" />
            </button>
            <button
              onClick={nextSlide}
              className="text-gray-800 cursor-pointer p-2 sm:p-3 rounded-full shadow-md bg-white hover:bg-gray-200 transition"
            >
              <IoArrowDown className="text-lg" />
            </button>
          </div>

          {/* Slider */}
          <div className="slider w-full">
            <Slider ref={sliderRef} {...sliderSettings} className="w-full">
              {events.map((event, index) => (
                <div key={index} className="px-2">
                  <div className="relative w-full h-[250px] sm:h-[320px] md:h-[350px] overflow-hidden rounded-lg ">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-white text-black py-1 px-3 rounded-full font-bold text-sm shadow">
                      {event.date}
                    </div>
                    {/* Title Overlay */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg">
                      <h3 className="text-sm font-semibold">{event.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventhome;