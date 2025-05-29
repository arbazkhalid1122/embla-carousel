import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GrNext, GrPrevious } from "react-icons/gr";

const videoFiles = ["/videos1.json", "/videos2.json", "/videos3.json"];

export default function VideoSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [videos, setVideos] = useState([]);
  const [loadedFiles, setLoadedFiles] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});

  const loadVideoFile = async (index) => {
    if (index >= videoFiles.length || loadedFiles.has(videoFiles[index])) return;

    try {
      const response = await fetch(videoFiles[index]);
      const data = await response.json();
      const newVideos = data.filter((url) => videos.indexOf(url) === -1);
      if (newVideos.length > 0) {
        setVideos((prev) => [...prev, ...newVideos]);
      }
      setLoadedFiles((prev) => new Set(prev).add(videoFiles[index]));
    } catch (err) {
      console.error("Failed to load", videoFiles[index], err);
    }
  };

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

      const currentVideo = videoRefs.current[index];
      if (currentVideo) {
        currentVideo.muted = index === 0; // Only first video muted
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay failed", err);
          });
        }
      }

      // Lazy load next video file
      if (
        index === videos.length - 1 &&
        loadedFiles.size < videoFiles.length
      ) {
        loadVideoFile(loadedFiles.size);
      }
    };

    emblaApi.on("select", onSelect);
    onSelect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onSelect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [emblaApi, videos, loadedFiles]);

  const handleVideoEnd = (index) => {
    const nextIndex = index + 1;
    if (videoRefs.current[nextIndex]) {
      emblaApi.scrollTo(nextIndex);
      const nextVideo = videoRefs.current[nextIndex];
      nextVideo.muted = nextIndex === 0; // Again, only first video muted
      nextVideo
        .play()
        .catch((err) => console.warn("Next video autoplay failed", err));
    }
  };

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  console.log(videos, 'videos');

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
                controls
                autoPlay={index === currentIndex}
                muted={index === 0} // only first video muted
                onEnded={() => handleVideoEnd(index)}
                playsInline
                className="video"
                preload="auto"
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
