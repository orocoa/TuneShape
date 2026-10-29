import {useSyncExternalStore} from 'react';

const query='(prefers-reduced-motion: reduce)';
const read=()=>typeof window!=='undefined'&&window.matchMedia(query).matches;
function subscribe(listener:()=>void){
 const media=window.matchMedia(query);
 media.addEventListener('change',listener);
 return()=>media.removeEventListener('change',listener);
}
// The installed Motion hook reads this preference once at mount. Subscribe so
// already-running loaders also settle when the system preference changes.
export function usePrefersReducedMotion(){return useSyncExternalStore(subscribe,read,()=>false)}
