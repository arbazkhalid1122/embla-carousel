import React, { useEffect, useState, useRef } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

const videoJSON = "/videos1.json";
const MAX_VIDEOS = 3;

export default function VideoSlider() {
  const [videoList, setVideoList] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const videoRefs = useRef({});
  const [isMuted, setIsMuted] = useState(true);
  const viewportRef = useRef(null);

  let visibleVideos = videoList.slice(startIndex, startIndex + MAX_VIDEOS);
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
    // Pause all videos
    Object.values(videoRefs.current).forEach((video) => video?.pause?.());

    // Play the first visible video
    const currentVideo = videoRefs.current[startIndex];
    if (currentVideo) {
      currentVideo.muted = isMuted;
      currentVideo.play()
    }
  }, [startIndex]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = isMuted;
    });
  }, [isMuted]);

  const goToNext = () => {
    console.log("Navigating to next video");
    if (startIndex < videoList.length - 1) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    console.log("Navigating to previous video");
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  const handleVideoEnd = () => {
    goToNext();
  };

  // ✅ Swipe detection
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const onTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const onTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;

      if (Math.abs(diffX) > 50) {
        if (diffX < 0) goToNext(); // swipe left
        else goToPrev(); // swipe right
      }
    };

    viewport.addEventListener("touchstart", onTouchStart);
    viewport.addEventListener("touchend", onTouchEnd);

    return () => {
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchend", onTouchEnd);
    };
  }, [startIndex, videoList.length]);




  return (
    <div className="embla">
      <div className="embla__viewport" ref={viewportRef}>
        <div className="embla__container">
          {visibleVideos.map((src, index) => (
            <div className="embla__slide" key={startIndex + index}>
              {src ? (
                <video
                  ref={(el) => {
                    const realIndex = startIndex + index;
                    if (el) {
                      videoRefs.current[realIndex] = el;
                      el.onvolumechange = () => setIsMuted(el.muted);
                    } else {
                      delete videoRefs.current[realIndex];
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
