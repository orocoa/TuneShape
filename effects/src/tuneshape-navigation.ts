import {catalog} from './browse-catalog';

const descriptions:Record<string,string>={
 controls:'Buttons, menus, selections and duration controls for everyday interactions.',
 navigation:'Sidebars, reading progress and tables of contents that help people find their way.',
 containers:'Cards and folders that reveal, group and organize content.',
 text:'Text reveals, character scrambling and the word decoding wall.',
 images:'Photo reels, album rails and image previews.',
 indicators:'Progress, loading and pulsing states that show what is happening.',
 backgrounds:'ASCII waves, particle tides and watercolor motion for page backgrounds.',
};

/** English example content follows the current TuneShape directory in every interface language. */
export const tuneShapeNavigationTitle='TuneShape';
export const tuneShapeNavigation=catalog.map(({key,english})=>({id:key,label:english,body:descriptions[key]??''}));
