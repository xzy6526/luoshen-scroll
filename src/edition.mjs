const query = new URLSearchParams(location.search);
export const edition = query.get('edition') || (query.has('demo')?'story':'scroll');
export const storyEdition = !['classic', 'gallery','scroll'].includes(edition);
export const v2Edition = storyEdition && edition !== 'study';
export const demoFromSearch = () => {
  const value=new URLSearchParams(location.search).get('demo');
  return ['narrative','album','dream'].includes(value)?value:'narrative';
};
export const initialDemo = demoFromSearch();
export const sceneLayouts = ['journey','landscape','verse','encounter','intimate','intimate','landscape','encounter','landscape','farewell','journey','reflection','verse','reflection'];
export const demoNames = [['narrative','入画叙事'],['album','绢本诗册'],['dream','云境展陈']];
