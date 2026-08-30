import type { StaticImageData } from 'next/image';

import logo from '@/app/images/logo.jpeg';
import teamPhoto from '@/app/images/team.jpg';
import heroIllustration from '@/app/images/6076-removebg-preview.png';
import heroMobileBackground from '@/app/images/hero-mobile-background.jpg';
import jamaMasjid from '@/app/images/jama-masjid.jpg';
import jamaMasjidImam from '@/app/images/jama-masjid-imam.jpg';
import visionTeamPhoto from '@/app/images/vision-team.jpg';
import communityPortrait from '@/app/images/463887467_8629707697086798_4618002959978959318_n.jpg';
import galleryImage1 from '@/app/images/464839106_8682257008498533_3486465466583592813_n.jpg';
import galleryImage2 from '@/app/images/464932188_8682259525164948_2880270192792897547_n.jpg';
import galleryImage3 from '@/app/images/465008943_8711582208899346_3017668868894569808_n.jpg';
import galleryImage4 from '@/app/images/465033249_8711583088899258_3411127434743432223_n.jpg';
import galleryImage5 from '@/app/images/465111422_8711584035565830_7270160376087918712_n.jpg';
import galleryImage6 from '@/app/images/465410596_8711583102232590_3411805614817404564_n.jpg';
import galleryImage7 from '@/app/images/68642326_2525426067515022_2129716635311800320_n.jpg';
import galleryImage8 from '@/app/images/70501581_2525424947515134_3093331078321012736_n.jpg';
import galleryImage9 from '@/app/images/71562956_2525422100848752_3459557077020573696_n.jpg';
import galleryImage10 from '@/app/images/71763671_2525420064182289_7666564696928944128_n.jpg';

export interface SiteImage {
  src: StaticImageData;
  alt: string;
}

export const siteImages = {
  logo,
  teamPhoto,
  heroIllustration,
  heroMobileBackground,
  heroCarousel: [heroMobileBackground],
  jamaMasjid,
  visionTeamPhoto,
  jamaMasjidGallery: [
    { src: jamaMasjid, alt: 'Jama Masjid Muslim Town exterior' },
    { src: jamaMasjidImam, alt: 'Imam Sahab delivering a sermon at Jama Masjid Muslim Town' },
  ] satisfies SiteImage[],
  communityPortrait,
  campaignCards: [
    galleryImage1,
    galleryImage2,
    galleryImage3,
    galleryImage4,
    galleryImage5,
    galleryImage6,
  ],
  gallery: [
    { src: galleryImage1, alt: 'Students gathered during a community education activity' },
    { src: galleryImage2, alt: 'Supporters speaking at a local community gathering' },
    { src: galleryImage3, alt: 'Community members receiving initiative support' },
    { src: galleryImage4, alt: 'Volunteers coordinating supplies for families' },
    { src: galleryImage5, alt: 'People preparing aid packages at a community event' },
    { src: galleryImage6, alt: 'Organisers meeting with supporters outdoors' },
    { src: galleryImage7, alt: 'Students participating in an educational program' },
    { src: galleryImage8, alt: 'A group photo from a community support event' },
    { src: galleryImage9, alt: 'Young people taking part in a learning session' },
    { src: galleryImage10, alt: 'Community members gathered for an impact program' },
  ] satisfies SiteImage[],
};
