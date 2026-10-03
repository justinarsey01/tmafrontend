import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCarouselSlides,
  type CarouselSlide,
} from "../lib/api";


/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

// Time between automatic slide changes.
const AUTOPLAY_MS = 4500;

// How long autoplay stays paused after the user touches the carousel.
const PAUSE_AFTER_TOUCH_MS = 8000;


/*
|--------------------------------------------------------------------------
| OPEN SLIDE LINK
|--------------------------------------------------------------------------
*/

function openSlideLink(link: string) {

  let url = link.trim();

  if (!url) {

    return;

  }

  if (url.startsWith("@")) {

    url = `https://t.me/${url.substring(1)}`;

  } else if (
    url.startsWith("t.me/") ||
    url.startsWith("telegram.me/")
  ) {

    url = `https://${url}`;

  }

  const webApp =
    (window as any).Telegram?.WebApp;

  if (
    webApp?.openTelegramLink &&
    /^https:\/\/(t|telegram)\.me\//.test(url)
  ) {

    webApp.openTelegramLink(url);

  } else if (webApp?.openLink) {

    webApp.openLink(url);

  } else {

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }

}


/*
|--------------------------------------------------------------------------
| HOME CAROUSEL
|--------------------------------------------------------------------------
|
| Slides are managed from the admin panel.
| Nothing is shown if there are no active slides.
|
|--------------------------------------------------------------------------
*/

export default function HomeCarousel() {

  const [
    slides,
    setSlides,
  ] = useState<CarouselSlide[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    failedImages,
    setFailedImages,
  ] = useState<Set<string>>(new Set());


  const trackRef =
    useRef<HTMLDivElement | null>(null);

  const activeIndexRef =
    useRef(0);

  const pausedUntilRef =
    useRef(0);


  /*
  |--------------------------------------------------------------------------
  | LOAD SLIDES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let cancelled = false;

    async function load() {

      try {

        const list =
          await getCarouselSlides();

        if (!cancelled) {

          setSlides(list);

        }

      } catch (error) {

        console.error(
          "Could not load carousel:",
          error
        );

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    load();

    return () => {

      cancelled = true;

    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | SCROLL HELPERS
  |--------------------------------------------------------------------------
  */

  const goTo = useCallback(
    (index: number) => {

      const track =
        trackRef.current;

      if (!track) {

        return;

      }

      track.scrollTo({
        left:
          index * track.clientWidth,
        behavior: "smooth",
      });

    },
    []
  );


  function handleScroll() {

    const track =
      trackRef.current;

    if (
      !track ||
      track.clientWidth === 0
    ) {

      return;

    }

    const index = Math.round(
      track.scrollLeft /
        track.clientWidth
    );

    activeIndexRef.current = index;

    setActiveIndex(index);

  }


  function pauseAutoplay() {

    pausedUntilRef.current =
      Date.now() +
      PAUSE_AFTER_TOUCH_MS;

  }


  /*
  |--------------------------------------------------------------------------
  | AUTOPLAY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (slides.length < 2) {

      return;

    }

    const timer =
      window.setInterval(() => {

        if (
          Date.now() <
          pausedUntilRef.current
        ) {

          return;

        }

        const next =
          (activeIndexRef.current + 1) %
          slides.length;

        goTo(next);

      }, AUTOPLAY_MS);

    return () => {

      window.clearInterval(timer);

    };

  }, [slides.length, goTo]);


  /*
  |--------------------------------------------------------------------------
  | LOADING / EMPTY
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="home-carousel">

        <style>{carouselCss}</style>

        <div className="home-carousel-skeleton" />

      </div>

    );

  }

  if (slides.length === 0) {

    return null;

  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <section
      className="home-carousel"
      aria-label="Featured"
    >

      <style>{carouselCss}</style>

      <div
        ref={trackRef}
        className="home-carousel-track"
        onScroll={handleScroll}
        onPointerDown={pauseAutoplay}
        onTouchStart={pauseAutoplay}
      >

        {slides.map((slide) => {

          const imageFailed =
            failedImages.has(slide.id);

          const clickable =
            Boolean(slide.link_url);

          return (

            <div
              key={slide.id}
              className="home-carousel-slide"
            >

              <div
                className={`home-carousel-card ${
                  clickable
                    ? "home-carousel-card-clickable"
                    : ""
                }`}
                role={
                  clickable
                    ? "button"
                    : undefined
                }
                tabIndex={
                  clickable
                    ? 0
                    : undefined
                }
                onClick={() => {

                  if (slide.link_url) {

                    openSlideLink(
                      slide.link_url
                    );

                  }

                }}
              >

                {!imageFailed && (

                  <img
                    className="home-carousel-image"
                    src={slide.image_url}
                    alt={slide.title || ""}
                    draggable={false}
                    onError={() =>
                      setFailedImages(
                        (previous) => {

                          const next =
                            new Set(previous);

                          next.add(slide.id);

                          return next;

                        }
                      )
                    }
                  />

                )}

                {(slide.title ||
                  slide.subtitle) && (

                  <div className="home-carousel-text">

                    {slide.title && (

                      <strong>
                        {slide.title}
                      </strong>

                    )}

                    {slide.subtitle && (

                      <span>
                        {slide.subtitle}
                      </span>

                    )}

                  </div>

                )}

              </div>

            </div>

          );

        })}

      </div>


      {slides.length > 1 && (

        <div className="home-carousel-dots">

          {slides.map((slide, index) => (

            <button
              key={slide.id}
              type="button"
              className={`home-carousel-dot ${
                index === activeIndex
                  ? "home-carousel-dot-active"
                  : ""
              }`}
              aria-label={`Go to slide ${
                index + 1
              }`}
              onClick={() => {

                pauseAutoplay();

                goTo(index);

              }}
            />

          ))}

        </div>

      )}

    </section>

  );

}


/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const carouselCss = `

  .home-carousel {
    width: 100%;
    margin: 0 0 16px;
  }


  .home-carousel-track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }


  .home-carousel-track::-webkit-scrollbar {
    display: none;
  }


  .home-carousel-slide {
    flex: 0 0 100%;
    min-width: 0;
    box-sizing: border-box;
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }


  .home-carousel-card {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 7;
    overflow: hidden;
    border-radius: 18px;
    background: linear-gradient(
      135deg,
      rgba(245, 184, 0, 0.35),
      rgba(245, 184, 0, 0.08)
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
  }


  .home-carousel-card-clickable {
    cursor: pointer;
  }


  .home-carousel-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    -webkit-user-drag: none;
  }


  .home-carousel-text {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 28px 14px 12px;
    color: #ffffff;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.72),
      rgba(0, 0, 0, 0)
    );
  }


  .home-carousel-text strong {
    display: block;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.3;
  }


  .home-carousel-text span {
    display: block;
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 11px;
    line-height: 1.4;
  }


  .home-carousel-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 10px;
  }


  .home-carousel-dot {
    width: 6px;
    height: 6px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    transition:
      width 0.25s ease,
      background 0.25s ease;
  }


  .home-carousel-dot-active {
    width: 18px;
    background: #f5b800;
  }


  .home-carousel-skeleton {
    width: 100%;
    aspect-ratio: 16 / 7;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.05);
    animation: homeCarouselPulse 1.4s ease-in-out infinite;
  }


  @keyframes homeCarouselPulse {

    0%, 100% {
      opacity: 0.6;
    }

    50% {
      opacity: 1;
    }

  }

`;
