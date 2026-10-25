export const flagWishes = [['우리바람','2791-2861'],['만사형통','2791-2867'],['무병장수','2791-2869'],['취업성공','2791-2873'],['백년해로','2796-2894'],['무사졸업','2791-2863'],['부귀영화','2791-2881'],['운수대통','2791-2883'],['시험합격','2791-2885'],['연애성공','2796-2898']];
export function savedFlagWish() {return flagWishes.find(([name]) => name === sessionStorage.getItem('uribaram-flag-wish')) || flagWishes[0];}
