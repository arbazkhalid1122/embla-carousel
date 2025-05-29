import React, { useEffect, useState, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";


const TOTAL_FILES = 3; // total JSON files you have
const VIDEOS_PER_BATCH = 3;

export default function VideoSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [videos, setVideos] = useState([]); // loaded video URLs
  const [currentFile, setCurrentFile] = useState(1); // which JSON file to load next
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRefs = useRef({});

  // Fetch videos for a given file index
  const fetchVideosFile = async (fileIndex) => {
    try {
      const response = await fetch(`/videos${fileIndex}.json`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      const data = await response.json();

      setVideos((prevVideos) => [...prevVideos, ...data]);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  // Initial fetch on mount: first 3 videos from videos1.json
  useEffect(() => {
    fetchVideosFile(currentFile);
  }, []);

  // When user reaches the last video of loaded batch, fetch next batch if available
  useEffect(() => {
    if (
      selectedIndex >= videos.length - 1 && // user reached last video
      currentFile < TOTAL_FILES // more files to load
    ) {
      const nextFile = currentFile + 1;
      setCurrentFile(nextFile);
      fetchVideosFile(nextFile);
    }
  }, [selectedIndex, videos.length, currentFile]);

  // Setup Embla 'select' event listener to update selectedIndex
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect(); // initial call

    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  // Play only the active video and pause others
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, video]) => {
      const index = Number(idx);
      if (!video) return;

      if (index === selectedIndex) {
        video.play().catch(() => {
          // Autoplay might be blocked, no need to crash
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [selectedIndex]);

  // On first interaction, unmute videos
  const handleUserInteraction = () => {
    if (!userInteracted) setUserInteracted(true);
  };

  // Scroll controls
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div
      className="embla"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
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
                autoPlay
                controls
                muted={!userInteracted} // muted until user interaction
                playsInline
                loop
                className="video"
              />
            </div>
          ))}
        </div>
      </div>
 <GrPrevious className="embla__button embla__button--prev" color="black" onClick={scrollPrev}/>
        <GrNext onClick={scrollNext} className="embla__button embla__button--next" color="black" />
    </div>
  );
}
