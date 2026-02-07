"use client";

import { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Orbitron } from "next/font/google";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Maximize2, X, Star } from "lucide-react";
import Image from "next/image";

// Fonts
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

// Use robust images that are likely to load
const galleryImages = [
  "/gallery/IMG-20250217-WA0045.jpg",
  "/gallery/IMG-20250218-WA0041.jpg",
  "/gallery/IMG-20250218-WA0045.jpg",
  "/gallery/IMG-20250219-WA0038.jpg",
  "/gallery/IMG-20250219-WA0083.jpg",
  "/gallery/IMG-20250222-WA0032.jpg",
  "/gallery/IMG-20250222-WA0042.jpg",
  "/flowing_time/IMG-20250215-WA0071.jpg",
  "/flowing_time/IMG-20250215-WA0090.jpg",
  "/flowing_time/IMG-20250215-WA0094.jpg",
  "/flowing_time/IMG-20250217-WA0001.jpg",
  "/flowing_time/IMG-20250219-WA0159.jpg",
  "/flowing_time/IMG-20250219-WA0217.jpg",
];

// Helper to shuffle/distribute images
const distributeImages = (images: string[], columns: number) => {
  const cols: string[][] = Array.from({ length: columns }, () => []);
  images.forEach((img, i) => {
    cols[i % columns].push(img);
  });
  return cols;
};

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Parallax Transforms for 3 columns
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]); // Faster middle column
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const columns = distributeImages([...galleryImages, ...galleryImages], 3); // Double data for length

  return (
    <main
      ref={containerRef}
      className={`min-h-screen bg-black text-white relative font-sans ${orbitron.variable} overflow-x-hidden`}
    >
      <Navbar />

      {/* --- Marquee Top --- */}
      <div className="fixed top-20 left-0 w-full bg-[#FF003C] z-10 overflow-hidden py-1 rotate-1 shadow-[0_0_20px_#FF003C] mt-6">
        <motion.div
          className="flex whitespace-nowrap gap-8"
          animate={{ x: "-100%" }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {Array(10)
            .fill("MEMOIRS OF THE PAST * ROBO RUMBLE * 2025 * ")
            .map((text, i) => (
              <span
                key={i}
                className="text-black font-black italic tracking-widest text-sm md:text-base font-['Orbitron']"
              >
                {text}
              </span>
            ))}
        </motion.div>
      </div>

      <div className="pt-40 px-4 md:px-8 max-w-[1600px] mx-auto relative cursor-crosshair">
        {/* --- Big Fixed Title --- */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none mix-blend-exclusion text-center w-full">
          <h1 className="text-[15vw] leading-[0.8] font-black font-['Orbitron'] tracking-tighter text-white opacity-20">
            ROBO
          </h1>
          <h1 className="text-[15vw] leading-[0.8] font-black font-['Orbitron'] tracking-tighter text-white opacity-20">
            RUMBLE
          </h1>
        </div>

        {/* --- Parallax Columns --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-1 min-h-[150vh] pb-40">
          {/* Column 1 */}
          <motion.div style={{ y: y1 }} className="flex flex-col gap-12 mt-0">
            {columns[0].map((src, i) => (
              <GalleryItem
                key={i}
                src={src}
                index={i}
                onClick={() => setSelectedImage(src)}
              />
            ))}
          </motion.div>

          {/* Column 2 (Offset start) */}
          <motion.div
            style={{ y: y2 }}
            className="flex flex-col gap-12 mt-24 md:mt-60"
          >
            {columns[1].map((src, i) => (
              <GalleryItem
                key={i}
                src={src}
                index={i}
                onClick={() => setSelectedImage(src)}
              />
            ))}
          </motion.div>

          {/* Column 3 */}
          <motion.div
            style={{ y: y3 }}
            className="flex flex-col gap-12 mt-12 md:mt-20"
          >
            {columns[2].map((src, i) => (
              <GalleryItem
                key={i}
                src={src}
                index={i}
                onClick={() => setSelectedImage(src)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* --- Lightbox --- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white hover:text-[#FF003C] transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={48} />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full h-full max-w-5xl max-h-[80vh] border-2 border-white/10 shadow-[0_0_50px_rgba(255,0,60,0.3)] bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Gallery Fullscreen"
                fill
                className="object-contain"
              />
            </motion.div>

            <div className="absolute bottom-8 left-8 text-white font-mono text-sm tracking-widest text-[#00F0FF]">
              // VIEWING_ARCHIVE_DATA
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

const GalleryItem = ({
  src,
  index,
  onClick,
}: {
  src: string;
  index: number;
  onClick: () => void;
}) => {
  // Random rotation for "scattered" feel
  const rotation = index % 2 === 0 ? 2 : -2;

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
      style={{ rotate: rotation }}
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden border-4 border-white transform transition-all duration-300 group-hover:border-[#00F0FF] group-hover:shadow-[0_0_30px_#00F0FF]">
        <Image
          src={src}
          alt="Gallery Item"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Overlay Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="text-white w-12 h-12 drop-shadow-[0_0_10px_black]" />
        </div>
      </div>

      {/* Sticker/Decoration (Optional - on some items) */}
      {index % 4 === 0 && (
        <div className="absolute -top-4 -right-4 text-[#FF003C] animate-pulse">
          <Star fill="currentColor" size={40} />
        </div>
      )}
    </motion.div>
  );
};
