import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GrNext, GrPrevious } from "react-icons/gr";

const videoJSON = "/videos1.json";
const MAX_VIDEOS = 3;

export default function VideoSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [videoList, setVideoList] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const videoRefs = useRef({});

  const visibleVideos = videoList.slice(startIndex, Math.min(startIndex + MAX_VIDEOS, videoList.length));

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch(videoJSON);
        const data = await res.json();
        setVideoList(data);
      } catch (err) {
        console.error("Failed to load videos", err);
      }
    };
    loadVideos();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const selected = emblaApi.selectedScrollSnap();

      Object.values(videoRefs.current).forEach((video) => video?.pause?.());

      const currentVideo = videoRefs.current[selected];
      if (currentVideo) {
        currentVideo.muted = true;
        currentVideo
          .play()
          .catch((err) => console.warn("Autoplay failed", err));
      }
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => emblaApi?.off("select", onSelect);
  }, [emblaApi, visibleVideos]);

  const goToNext = () => {
    if (startIndex < videoList.length - 1) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };



  const handleVideoEnd = () => {
    goToNext();
  };

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {visibleVideos.map((src, index) => (
            <div className="embla__slide" key={startIndex + index}>
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el;
                  else delete videoRefs.current[index];
                }}
                src={src}
                controls
                autoPlay={true}
                muted
                playsInline
                preload="auto"
                onEnded={index === 0 ? handleVideoEnd : undefined}
                className="video"
              />
            </div>
          ))}
        </div>
      </div>
      <GrPrevious className="embla__button embla__button--prev" onClick={goToPrev} />
      <GrNext
        className="embla__button embla__button--next"
        onClick={goToNext}
      />
    </div>
  );
}
