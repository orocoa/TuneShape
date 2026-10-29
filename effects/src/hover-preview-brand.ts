// Generic demo icons, MIT. Official brand artwork is not redistributed.
const icon=(text:string)=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" rx="35" fill="white"/><text x="160" y="205" text-anchor="middle" font-family="monospace" font-size="140" fill="#222">'+text+'</text></svg>');
export const githubPreviewImage=icon('&lt;/&gt;');
export const githubStarPreviewImage=icon('★');
