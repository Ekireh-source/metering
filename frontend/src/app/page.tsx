"use client"
// import { HeroHighlight } from "@/components/anim/hero-highlight";
import Image from "next/image";
// import { cn } from "@/lib/utils";
// import { motion } from "framer-motion";
// import dynamic from "next/dynamic";
// import { FlipWords } from "@/components/anim/flip-words";
// import { Spotlight } from "@/components/anim/spot-light";
// import { Button } from "@/components/anim/moving-border";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import Link from "next/link";

import Features from "@/components/common/features";
import Partners from "@/components/common/partners";
import Stats from "@/components/common/stats";
import PublicFooter from "@/components/common/public-footer";
import PublicHeader from "@/components/common/public-header";

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

import destination from "@/assets/images/home/destination.jpg"
import travel_couple from "@/assets/images/home/travel-couple.jpg"
import shopping from "@/assets/images/home/shopping.jpg"
import sci from "@/assets/images/home/sci.jpg"
import planes from "@/assets/images/home/planes.jpg"





export default function Home() {


  const [emblaRef] = useEmblaCarousel({ loop: false }, [Autoplay()])


 
 
  


  return (
    <>
    <PublicHeader />
    <div className="embla" ref={emblaRef}>
      <div className="embla__container h-52 sm:h-[600px]">
        <div className="embla__slide h-full">
        <Image width={400} height={400} src={sci} alt="Phone refill" className="w-full object-cover h-full" />
        </div>
        <div className="embla__slide h-full">
        <Image width={400} height={400} src={shopping} alt="Save on shopping across multiple stores" className="w-full object-cover h-full" />
        </div>
        <div className="embla__slide h-full">
        <Image width={400} height={400} src={travel_couple} alt="Enjoy quality time with family" className="w-full object-cover" />
        </div>
        <div className="embla__slide h-full">
          <Image width={400} height={400} src={destination} alt="Favourite destinations" className="w-full object-cover" />
          </div>
        <div className="embla__slide h-full">
          <Image width={400} height={400} src={planes} alt="Planes" className="w-full object-cover" />
          </div>
      </div>
    </div>

    <Features />

    {/* <Partners />

       
    <Stats /> */}

     <PublicFooter />
    </>
  );
}

