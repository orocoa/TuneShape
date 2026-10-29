/** Shared default copy for the glyph-wall demo and the site's cover animation. */
export const defaultGlyphPhrases=['HELLO','TUNESHAPE','EXPLORE','CREATE','IDEA','OROCOA'] as const;
export const glyphPhraseLimits={min:1,max:8,length:20} as const;

export function normalizeGlyphPhrase(value:string){
 const word=value.trim();
 if(!word||/[|\u0000-\u001f\u007f<>]/u.test(word)||Array.from(word).length>glyphPhraseLimits.length)throw Error('请输入 1–20 个字符的词语，每次添加一个。');
 return word;
}
