import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GrNext, GrPrevious } from "react-icons/gr";

export default function VideoSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef({});
  const [userHasUnmuted, setUserHasUnmuted] = useState(false);

  // Fetch all videos once
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos1.json");
        const data = await response.json();
        setVideos(data);
        console.log("Fetched videos:", data);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, []);

  // Re-init Embla and play current video
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);
      console.log("Slide selected:", index);

      // Pause all
      Object.entries(videoRefs.current).forEach(([key, video]) => {
        if (video) {
          video.pause();
          console.log(`Paused video at index: ${key}`);
        }
      });

      // Play current video
      const currentVideo = videoRefs.current[index];
      if (currentVideo) {
        currentVideo.play().then(() => {
          console.log(`Playing video at index: ${index}`);
        }).catch((err) => {
          console.warn(`Autoplay blocked for video at index ${index}`, err);
        });
      }
    };

    emblaApi.on("select", onSelect);
    onSelect(); // Initial
  }, [emblaApi]);

  const handleVideoEnd = (index) => {
    const nextIndex = index + 1;
    console.log(`Video at index ${index} ended.`);

    if (videoRefs.current[nextIndex]) {
      console.log(`Scrolling to and attempting to play next video at index ${nextIndex}`);
      emblaApi.scrollTo(nextIndex);
      videoRefs.current[nextIndex].play().then(() => {
        console.log(`Playing next video at index: ${nextIndex}`);
      }).catch((err) => {
        console.warn(`Autoplay blocked for next video at index ${nextIndex}`, err);
      });
    } else {
      console.log(`Next video at index ${nextIndex} not loaded yet.`);
    }
  };

  const scrollPrev = () => {
    console.log("Scroll Prev clicked");
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    console.log("Scroll Next clicked");
    emblaApi?.scrollNext();
  };

  const shouldLoad = (index) => {
    const should = index >= currentIndex - 1 && index <= currentIndex + 2;
    if (!should) {
      console.log(`Video at index ${index} not loaded yet`);
    }
    return should;
  };

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {videos.map((src, index) => (
            <div className="embla__slide" key={index}>
              {shouldLoad(index) ? (
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[index] = el;
                      console.log(`Video element mounted at index: ${index}`);
                    } else {
                      delete videoRefs.current[index];
                      console.log(`Video element unmounted at index: ${index}`);
                    }
                  }}
                  src={src}
                  onVolumeChange={(e) => {
                    if (!e.target.muted) {
                      setUserHasUnmuted(true);
                      console.log("User unmuted — enabling sound for upcoming videos");
                    }
                  }}
                  controls
                  autoPlay={index === currentIndex}
                  muted={index === 0 && !userHasUnmuted}
                  onEnded={() => handleVideoEnd(index)}
                  playsInline
                  className="video"
                />
              ) : (
                <div className="video-placeholder">Loading...</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <GrPrevious
        className="embla__button embla__button--prev"
        color="black"
        onClick={scrollPrev}
        style={{ opacity: currentIndex === 0 ? 0.5 : 1, pointerEvents: currentIndex === 0 ? "none" : "auto" }}
      />

      <GrNext
        className="embla__button embla__button--next"
        color="black"
        onClick={scrollNext}
        style={{
          opacity: currentIndex === videos.length - 1 ? 0.5 : 1,
          pointerEvents: currentIndex === videos.length - 1 ? "none" : "auto",
        }}
      />
    </div>
  );
}
