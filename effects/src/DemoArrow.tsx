/** Shared size and stroke for the button demonstrations. */
export default function DemoArrow({diagonal=false}:{diagonal?:boolean}){
 return <svg className="demo-arrow" data-inherit-color="" viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true"><path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" transform={diagonal?'rotate(-45 10 10)':undefined} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
