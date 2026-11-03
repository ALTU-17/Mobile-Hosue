"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const posters = [
  {
    src: "/images/counter-01.webp",
    alt: "Mobile House counter poster: all brands, one counter, with three phones on a brass background",
    title: "All brands. One counter.",
    meta: "Counter note 01",
  },
  {
    src: "/images/counter-02.webp",
    alt: "Mobile House poster with the MH monogram and the promises: sealed, GST bill, exchange and finance",
    title: "The MH standard.",
    meta: "Counter note 02",
  },
  {
    src: "/images/counter-03.webp",
    alt: "Mobile House receipt poster listing sealed box, GST bill, warranty, exchange and finance",
    title: "What leaves with you.",
    meta: "Counter note 03",
  },
];

const vertexShader = `
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;

void main() {
  vTextureCoord = aTextureCoord;
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform sampler2D uSampler0;
uniform float uTime;
uniform vec2 uMouse;
uniform float uStrength;

varying vec2 vTextureCoord;

void main() {
  vec2 uv = vTextureCoord;
  float wave = sin(uv.y * 7.0 + uTime * 0.75) * 0.0035;
  float wave2 = cos(uv.x * 5.0 + uTime * 0.55) * 0.0026;
  uv.x += (wave + (uMouse.x - 0.5) * 0.016) * uStrength;
  uv.y += (wave2 + (uMouse.y - 0.5) * 0.008) * uStrength;
  vec4 color = texture2D(uSampler0, uv);
  gl_FragColor = color;
}
`;

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function ShopWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reduceMotion || !hasWebGL()) return;
    if (window.innerWidth <= 900 || !window.matchMedia("(pointer: fine)").matches) return;

    let disposed = false;
    let failed = false;
    let curtains: { dispose: () => void } | null = null;
    let frameId = 0;
    let failTimer = 0;
    let onPointerMove: ((event: PointerEvent) => void) | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        import("curtainsjs")
          .then(({ Curtains, Plane }) => {
            if (disposed) return;

            const instance = new Curtains({
              container,
              pixelRatio: Math.min(window.devicePixelRatio, 1.75),
              watchScroll: true,
              production: true,
            });

            const media = Array.from(
              container.querySelectorAll<HTMLElement>(".wall-card__media"),
            );
            const planes = media.map(
              (element) =>
                new Plane(instance, element, {
                  widthSegments: 18,
                  heightSegments: 18,
                  uniforms: {
                    uTime: { name: "uTime", type: "1f", value: 0 },
                    uMouse: { name: "uMouse", type: "2f", value: [0.5, 0.5] },
                    uStrength: { name: "uStrength", type: "1f", value: 0.8 },
                  },
                  vertexShader,
                  fragmentShader,
                }),
            );

            const fail = () => {
              if (disposed || failed) return;
              failed = true;
              window.clearTimeout(failTimer);
              container.classList.remove("is-curtains", "is-curtains-ready");
              if (onPointerMove) {
                container.removeEventListener("pointermove", onPointerMove);
                onPointerMove = null;
              }
              try {
                instance.dispose();
              } catch {
                // The static posters are already back in place.
              }
              if (curtains === instance) curtains = null;
            };

            instance.onError(fail);

            let pending = planes.length;
            planes.forEach((plane) => {
              plane.onError(fail);
              plane.onReady(() => {
                if (disposed || failed) return;
                pending -= 1;
                if (pending > 0) return;

                window.clearTimeout(failTimer);
                container.classList.add("is-curtains");
                frameId = window.requestAnimationFrame(() => {
                  container.classList.add("is-curtains-ready");
                });
              });
            });

            onPointerMove = (event: PointerEvent) => {
              const rect = container.getBoundingClientRect();
              const x = (event.clientX - rect.left) / rect.width;
              const y = 1 - (event.clientY - rect.top) / rect.height;
              planes.forEach((plane) => {
                plane.uniforms.uMouse.value = [x, y];
              });
            };

            instance.onRender(() => {
              const time = (planes[0]?.uniforms.uTime.value as number) ?? 0;
              planes.forEach((plane) => {
                plane.uniforms.uTime.value = time + 0.008;
              });
            });

            container.querySelector("canvas")?.setAttribute("aria-hidden", "true");
            container.addEventListener("pointermove", onPointerMove, { passive: true });
            curtains = instance;
            failTimer = window.setTimeout(fail, 6000);
          })
          .catch(() => {
            container.classList.remove("is-curtains");
          });
      },
      { rootMargin: "240px" },
    );

    observer.observe(container);

    return () => {
      disposed = true;
      observer.disconnect();
      window.clearTimeout(failTimer);
      if (frameId) window.cancelAnimationFrame(frameId);
      if (onPointerMove) {
        container.removeEventListener("pointermove", onPointerMove);
        onPointerMove = null;
      }
      container.classList.remove("is-curtains", "is-curtains-ready");
      curtains?.dispose();
    };
  }, [reduceMotion]);

  return (
    <div className="shop-wall">
      <div className="shop-wall__head">
        <h2>The counter, in print.</h2>
        <p>
          Three notes from the shop wall — the brands, the promises, and the receipt that leaves
          with every phone. Posters are artwork; real counter photographs slot into the same grid.
        </p>
      </div>

      <div className="shop-wall__grid" ref={containerRef}>
        {posters.map((poster) => (
          <figure className="wall-card" key={poster.src}>
            <div className="wall-card__media">
              <img
                src={poster.src}
                alt={poster.alt}
                width={1200}
                height={1500}
                loading="lazy"
              />
            </div>
            <figcaption className="wall-card__caption">
              <span>{poster.title}</span>
              <span>{poster.meta}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
