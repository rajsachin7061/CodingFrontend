
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./questionBox.css";
import javaImg from "./LandingPage/imaiges/java.png";
import cppImg from "./LandingPage/imaiges/c++.png";
import javascriptImg from "./LandingPage/imaiges/javascript.png";
import cssImg from "./LandingPage/imaiges/css.png";
import pythonImg from "./LandingPage/imaiges/python.png";
import htmlImg from "./LandingPage/imaiges/html.png";

const cards = [
  {
    image: javaImg,
    name: "Java",
  },
  {
    image: cppImg,
    name: "C++",
  },
  {
    image: javascriptImg,
    name: "JavaScript",
  },
  {
    image: cssImg,
    name: "CSS",
  },
  {
    image: pythonImg,
    name: "Python",
  },
  {
    image: htmlImg,
    name: "HTML",
  },
];

function QuestionBox() {
  return (
    <div className="slide-container">
      <Swiper
        slidesPerView={4}
        spaceBetween={30}
        slidesPerGroup={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1220:{
            slidesPerView: 4,
          }
        }}
        className="slide-content"
      >
        {cards.map((card, index) => (
          <SwiperSlide key={index}>
            <div className="card">
              <div className="imaige-content">
                <div className="overlay">
                  <div className="card-imaige">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="card-img"
                    />
                  </div>
                </div>
              </div>
              
              <a href="/login" className="button">
              <div className="card-content">
                <h2 className="name">{card.name}</h2>
                  
                  <h4>300 Problems</h4>
                  </div>
                  </a>

                
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default QuestionBox;
