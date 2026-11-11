import {useContext,useLayoutEffect,useRef} from 'react';
import type {RefObject} from 'react';
import {CatalogNativeContext,catalogEngine} from './catalog-native-context';
import type {CatalogEngine} from './catalog-native-context';

/** Mount once and destroy the exact instance created by this effect. Updates
 * stay in the preview so its own settings and playback rules remain explicit. */
export function useNativeEngine<T extends {destroy:()=>void}>(
  engine:RefObject<T|null>,
  create:()=>T,
) {
  const catalog=useContext(CatalogNativeContext),latest=useRef(catalog);latest.current=catalog;
  const initialCreate=useRef(create);
  useLayoutEffect(()=>{
    const instance=initialCreate.current();
    const managed=catalog?catalogEngine(instance,()=>latest.current):instance;
    engine.current=managed;
    catalog?.engines.current.add(managed as CatalogEngine);
    return ()=>{
      catalog?.engines.current.delete(managed as CatalogEngine);
      instance.destroy();
      engine.current=null;
    };
  },[]);
}
