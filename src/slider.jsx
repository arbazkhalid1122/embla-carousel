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
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  const goToNext = () => {
    if (startIndex < videoList.length - 1) {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          video.pause();
        }
      });
      setStartIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (startIndex > 0) {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          video.pause();
        }
      });
      setStartIndex((prev) => prev - 1);
    }
  };

  const handleVideoEnd = () => {
    goToNext();
  };

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

  const visibleVideos = videoList.slice(startIndex, startIndex + MAX_VIDEOS);

  useEffect(() => {
    if (videoRefs.current[startIndex]) {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) {
          video.pause();
        }
      });
      videoRefs.current[startIndex].play();
      videoRefs.current[startIndex].muted = isMuted;
    }
  }, [startIndex, isMuted, videoList]);

  useEffect(() => {
    if (videoList.length > 0 && videoRefs.current[0]) {
      videoRefs.current[0].play();
      videoRefs.current[0].muted = isMuted;
    }
  }, [videoList, isMuted]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={viewportRef}>
        <div className="embla__container">
          {visibleVideos.map((src, index) => (
            <div className="embla__slide" key={startIndex + index}>
              <video
                ref={(el) => {
                  const realIndex = startIndex + index;
                  if (el) {
                    videoRefs.current[realIndex] = el;
                  } else {
                    delete videoRefs.current[realIndex];
                  }
                }}
                src={src}
                controls
                muted={isMuted}
                playsInline
                preload="auto"
                onPause={() => {
                  const current = videoRefs.current[startIndex];
                  if (current && !current.muted) {
                    Object.entries(videoRefs.current).forEach(([key, vid]) => {
                      if (parseInt(key) !== startIndex && vid && !vid.paused) {
                        vid.pause();
                      }
                    });
                  }
                }}
                onEnded={index === 0 ? handleVideoEnd : undefined}
                onVolumeChange={(e) => {
                  setIsMuted(e.target.muted);
                }}
                className="video"
              />
            </div>
          ))}
          {Array(MAX_VIDEOS - visibleVideos.length).fill(null).map((_, index) => (
            <div className="embla__slide" key={startIndex + visibleVideos.length + index}>
              <div className="video placeholder" />
            </div>
          ))}
        </div>
      </div>
      <GrPrevious className="embla__button embla__button--prev" onClick={goToPrev} />
      <GrNext className="embla__button embla__button--next" onClick={goToNext} />
    </div>
  );
}