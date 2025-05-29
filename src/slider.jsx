import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GrNext, GrPrevious } from "react-icons/gr";

const videoFiles = ["/videos1.json", "/videos2.json", "/videos3.json"];

export default function VideoSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [videos, setVideos] = useState([]);
  const [loadedIndex, setLoadedIndex] = useState(0); // which JSON files are loaded
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});
  const [userHasUnmuted, setUserHasUnmuted] = useState(false);

  const loadVideoFile = async (index) => {
    if (index >= videoFiles.length) return;

    try {
      const response = await fetch(videoFiles[index]);
      const data = await response.json();
      setVideos((prev) => [...prev, ...data]);
      setLoadedIndex(index + 1); // mark as loaded
    } catch (err) {
      console.error("Failed to load", videoFiles[index], err);
    }
  };

  // Initial load
  useEffect(() => {
    loadVideoFile(0);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);

      // Pause all videos
      Object.values(videoRefs.current).forEach((video) => video?.pause());

      // Play current
      const currentVideo = videoRefs.current[index];
      currentVideo?.play().catch((err) => {
        console.warn("Autoplay failed", err);
      });

      // Check if we need to load next file
      if (
        index === videos.length - 1 && // on last video
        loadedIndex < videoFiles.length // still more to load
      ) {
        loadVideoFile(loadedIndex);
      }
    };

    emblaApi.on("select", onSelect);
    onSelect(); // initial
  }, [emblaApi, videos, loadedIndex]);

  const handleVideoEnd = (index) => {
    const nextIndex = index + 1;
    if (videoRefs.current[nextIndex]) {
      emblaApi.scrollTo(nextIndex);
      videoRefs.current[nextIndex]?.play().catch((err) => {
        console.warn("Next video autoplay failed", err);
      });
    }
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {videos.map((src, index) => (
            <div className="embla__slide" key={index}>
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el;
                  else delete videoRefs.current[index];
                }}
                src={src}
                onVolumeChange={(e) => {
                  if (!e.target.muted) setUserHasUnmuted(true);
                }}
                controls
                autoPlay={index === currentIndex}
                muted={index === 0 && !userHasUnmuted}
                onEnded={() => handleVideoEnd(index)}
                playsInline
                className="video"
              />
            </div>
          ))}
        </div>
      </div>

      <GrPrevious
        className="embla__button embla__button--prev"
        onClick={scrollPrev}
        style={{
          opacity: currentIndex === 0 ? 0.5 : 1,
          pointerEvents: currentIndex === 0 ? "none" : "auto",
        }}
      />
      <GrNext
        className="embla__button embla__button--next"
        onClick={scrollNext}
        style={{
          opacity: currentIndex === videos.length - 1 ? 0.5 : 1,
          pointerEvents: currentIndex === videos.length - 1 ? "none" : "auto",
        }}
      />
    </div>
  );
}
