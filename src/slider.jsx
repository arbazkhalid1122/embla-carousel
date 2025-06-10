//Latest code
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
    console.log("Component mounted");
    const loadVideos = async () => {
      try {
        const res = await fetch(videoJSON);
        const data = await res.json();
        setVideoList(data);
        console.log("Loaded videos:", data);
      } catch (err) {
        console.error("Failed to load videos", err);
      }
    };
    loadVideos();
    return () => {
      console.log("Component unmounted");
    };
  }, []);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
    console.log("Mute state changed:", isMuted);
  }, [isMuted]);

  const goToNext = () => {
    console.log("Navigated to next video");
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
    console.log("Navigated to previous video");
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
    console.log("Video ended, moving to next");
    goToNext();
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const onTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      console.log("Touch start:", touchStartX);
    };

    const onTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      console.log("Touch end:", touchEndX, "Diff:", diffX);

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
      const currentVideo = videoRefs.current[startIndex];
      currentVideo.muted = isMuted;
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === 'AbortError') {
            console.log('Play was interrupted by a call to pause()');
          } else {
            console.error('Error playing video:', error);
          }
        });
      }
      console.log("Playing video at index:", startIndex);
    }
  }, [startIndex, isMuted, videoList]);

  useEffect(() => {
    if (videoList.length > 0 && videoRefs.current[0]) {
      videoRefs.current[0].muted = isMuted;
      const playPromise = videoRefs.current[0].play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === 'AbortError') {
            console.log('Play was interrupted by a call to pause()');
          } else {
            console.error('Error playing video:', error);
          }
        });
      }
      console.log("First video auto-played");
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
                  console.log("Volume/mute changed on video at index:", startIndex + index, "Muted:", e.target.muted);
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

//Previous code
// import React, { useEffect, useState, useRef } from "react";
// import { GrNext, GrPrevious } from "react-icons/gr";

// const videoJSON = "/videos1.json";
// const MAX_VIDEOS = 3;

// export default function VideoSlider() {
//   const [videoList, setVideoList] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);
//   const videoRefs = useRef({});
//   const [isMuted, setIsMuted] = useState(true);
//   const viewportRef = useRef(null);

//   useEffect(() => {
//     console.log("Component mounted");
//     const loadVideos = async () => {
//       try {
//         const res = await fetch(videoJSON);
//         const data = await res.json();
//         setVideoList(data);
//         console.log("Loaded videos:", data);
//       } catch (err) {
//         console.error("Failed to load videos", err);
//       }
//     };
//     loadVideos();
//     return () => {
//       console.log("Component unmounted");
//     };
//   }, []);

//   useEffect(() => {
//     Object.values(videoRefs.current).forEach((video) => {
//       if (video) {
//         video.muted = isMuted;
//       }
//     });
//     console.log("Mute state changed:", isMuted);
//   }, [isMuted]);

//   const goToNext = () => {
//     console.log("Navigated to next video");
//     if (startIndex < videoList.length - 1) {
//       Object.values(videoRefs.current).forEach((video) => {
//         if (video) {
//           video.pause();
//         }
//       });
//       setStartIndex((prev) => prev + 1);
//     }
//   };

//   const goToPrev = () => {
//     console.log("Navigated to previous video");
//     if (startIndex > 0) {
//       Object.values(videoRefs.current).forEach((video) => {
//         if (video) {
//           video.pause();
//         }
//       });
//       setStartIndex((prev) => prev - 1);
//     }
//   };

//   const handleVideoEnd = () => {
//     console.log("Video ended, moving to next");
//     goToNext();
//   };

//   useEffect(() => {
//     const viewport = viewportRef.current;
//     if (!viewport) return;

//     let touchStartX = 0;
//     let touchEndX = 0;

//     const onTouchStart = (e) => {
//       touchStartX = e.changedTouches[0].screenX;
//       console.log("Touch start:", touchStartX);
//     };

//     const onTouchEnd = (e) => {
//       touchEndX = e.changedTouches[0].screenX;
//       const diffX = touchEndX - touchStartX;
//       console.log("Touch end:", touchEndX, "Diff:", diffX);

//       if (Math.abs(diffX) > 50) {
//         if (diffX < 0) goToNext(); // swipe left
//         else goToPrev(); // swipe right
//       }
//     };

//     viewport.addEventListener("touchstart", onTouchStart);
//     viewport.addEventListener("touchend", onTouchEnd);

//     return () => {
//       viewport.removeEventListener("touchstart", onTouchStart);
//       viewport.removeEventListener("touchend", onTouchEnd);
//     };
//   }, [startIndex, videoList.length]);

//   const visibleVideos = videoList.slice(startIndex, startIndex + MAX_VIDEOS);

//   useEffect(() => {
//     if (videoRefs.current[startIndex]) {
//       Object.values(videoRefs.current).forEach((video) => {
//         if (video) {
//           video.pause();
//         }
//       });
//       const currentVideo = videoRefs.current[startIndex];
//       currentVideo.muted = isMuted;
//       const playPromise = currentVideo.play();
//       if (playPromise !== undefined) {
//         playPromise.catch((error) => {
//           if (error.name === 'AbortError') {
//             console.log('Play was interrupted by a call to pause()');
//           } else {
//             console.error('Error playing video:', error);
//           }
//         });
//       }
//       console.log("Playing video at index:", startIndex);
//     }
//   }, [startIndex, isMuted, videoList]);

//   useEffect(() => {
//     if (videoList.length > 0 && videoRefs.current[0]) {
//       videoRefs.current[0].muted = isMuted;
//       const playPromise = videoRefs.current[0].play();
//       if (playPromise !== undefined) {
//         playPromise.catch((error) => {
//           if (error.name === 'AbortError') {
//             console.log('Play was interrupted by a call to pause()');
//           } else {
//             console.error('Error playing video:', error);
//           }
//         });
//       }
//       console.log("First video auto-played");
//     }
//   }, [videoList, isMuted]);

//   return (
//     <div className="embla">
//       <div className="embla__viewport" ref={viewportRef}>
//         <div className="embla__container">
//           {visibleVideos.map((src, index) => (
//             <div className="embla__slide" key={startIndex + index}>
//               <video
//                 ref={(el) => {
//                   const realIndex = startIndex + index;
//                   if (el) {
//                     videoRefs.current[realIndex] = el;
//                   } else {
//                     delete videoRefs.current[realIndex];
//                   }
//                 }}
//                 src={src}
//                 controls
//                 muted={isMuted}
//                 playsInline
//                 preload="auto"
//                 onPause={() => {
//                   const current = videoRefs.current[startIndex];
//                   if (current && !current.muted) {
//                     Object.entries(videoRefs.current).forEach(([key, vid]) => {
//                       if (parseInt(key) !== startIndex && vid && !vid.paused) {
//                         vid.pause();
//                       }
//                     });
//                   }
//                 }}
//                 onEnded={index === 0 ? handleVideoEnd : undefined}
//                 onVolumeChange={(e) => {
//                   setIsMuted(e.target.muted);
//                   console.log("Volume/mute changed on video at index:", startIndex + index, "Muted:", e.target.muted);
//                 }}
//                 className="video"
//               />
//             </div>
//           ))}
//           {Array(MAX_VIDEOS - visibleVideos.length).fill(null).map((_, index) => (
//             <div className="embla__slide" key={startIndex + visibleVideos.length + index}>
//               <div className="video placeholder" />
//             </div>
//           ))}
//         </div>
//       </div>
//       <GrPrevious className="embla__button embla__button--prev" onClick={goToPrev} />
//       <GrNext className="embla__button embla__button--next" onClick={goToNext} />
//     </div>
//   );
// }