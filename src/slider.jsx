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
  const [isMuted, setIsMuted] = useState(true);

  let visibleVideos = videoList.slice(startIndex, startIndex + MAX_VIDEOS);

  // Always ensure 3 items
  if (visibleVideos.length < MAX_VIDEOS) {
    const padCount = MAX_VIDEOS - visibleVideos.length;
    visibleVideos = [...visibleVideos, ...Array(padCount).fill(null)];
  }

  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log("Fetching video list from", videoJSON);
        const res = await fetch(videoJSON);
        const data = await res.json();
        console.log("Video list loaded:", data);
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
      console.log("Embla selected slide index:", selected);

      Object.values(videoRefs.current).forEach((video) => {
        console.log("Pausing video");
        video?.pause?.();
      });

      const currentVideo = videoRefs.current[selected];
      if (currentVideo) {
        console.log("Playing video at index:", selected);
        currentVideo.muted = isMuted;
        currentVideo
          .play()
          .catch((err) => console.warn("Autoplay failed", err));
      }
    };

    console.log("Setting up Embla onSelect event");
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi?.off("select", onSelect);
    };
  }, [emblaApi, visibleVideos]);

  const goToNext = () => {
    console.log("Navigating to next video");
    if (startIndex < videoList.length - 1) {
      setStartIndex((prev) => {
        const next = prev + 1;
        console.log("Updated start index:", next);
        return next;
      });
    } else {
      console.log("Already at the last video");
    }
  };

  const goToPrev = () => {
    console.log("Navigating to previous video");
    if (startIndex > 0) {
      setStartIndex((prev) => {
        const next = prev - 1;
        console.log("Updated start index:", next);
        return next;
      });
    } else {
      console.log("Already at the first video");
    }
  };

  const handleVideoEnd = () => {
    console.log("Video ended, moving to next");
    goToNext();
  };

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {visibleVideos.map((src, index) => (
            <div className="embla__slide" key={startIndex + index}>
              {src ? (
                <video
                  ref={(el) => {
                    if (el) {
                      console.log("Setting ref for video index:", index);
                      videoRefs.current[index] = el;
                      if (index === 0) {
                        el.addEventListener("volumechange", () => {
                          if (!el.muted) {
                            console.log("First video unmuted by user, unmuting all videos");
                            setIsMuted(false);
                          }
                        });
                      }
                    } else {
                      delete videoRefs.current[index];
                    }
                  }}
                  src={src}
                  controls
                  autoPlay
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onEnded={index === 0 ? handleVideoEnd : undefined}
                  className="video"
                />
              ) : (
                <div className="video placeholder" />
              )}
            </div>
          ))}

        </div>
      </div>
      <GrPrevious className="embla__button embla__button--prev" onClick={goToPrev} />
      <GrNext className="embla__button embla__button--next" onClick={goToNext} />
    </div>
  );
}
