import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import dinner from "../img/dinner.jpg";
import family from "../img/family 2.jpg";
import mairrage from "../img/mairrage.jpg";
import parents from "../img/parents.png";
import p2 from "../img/p2.jpg";

const MySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const images = [
    { src: family, alt: "Family Gathering" },
    { src: dinner, alt: "Dinner Event" },
    { src: mairrage, alt: "Marriage Ceremony" },
    { src: parents, alt: "Parents Together" },
    { src: "https://img.freepik.com/free-photo/young-family-with-children-autumn-park_1303-25421.jpg?t=st=1742621354~exp=1742624954~hmac=e41721c8c6992ccdb9b88be24a784455cb0f8cc66fe913bdd3923d433b45ed4f&w=996", alt: "Parents Together" },

    { src: 'https://img.freepik.com/free-photo/happy-family-with-dog-moving-new-home_23-2149749175.jpg?t=st=1742618694~exp=1742622294~hmac=ebbf0673b7610d8786a5db7de24ec2c571a91d5ae5a7e0cfb9ee84ba6fc7b89c&w=900', alt: "Happy Parents" },
    { src: 'https://img.freepik.com/free-photo/young-family-with-their-sons-home-having-fun_1303-20999.jpg?t=st=1742618045~exp=1742621645~hmac=16f51d6158f72f827876595e2e14fd2a068c5dea4c568e51ab729ab0fbcdd89d&w=996', alt: "Happy Parents" },

  ];

  return (
    <div className="w-full object-fit mx-auto relative overflow-hidden"> {/* Added pt-16 for padding-top */}
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-t "></div>
            <img
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              className=" w-full h-64 sm:h-80 md:h-96 lg:h-screen border-white"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MySlider;