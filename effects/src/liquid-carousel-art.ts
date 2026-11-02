// Reuse the six original MIT geometric cards already used by Orbit Reel.
// Source compositions: public/images/geometric-cards/ORIGINAL_ART.json.
import {reelItems} from './elastic-reel-art';
export const liquidCarouselImages=reelItems.slice(0,6).map(({src,title})=>({src,title}));
