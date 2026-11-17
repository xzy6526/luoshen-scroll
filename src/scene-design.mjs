// Palettes follow each supplied painting and the corresponding passage, not average RGB.
export const sceneDesigns = [
  {name:'暮金入境',base:'#283d3a',light:'#7c8069',ink:'#f2ead5',accent:'#d6bc87',muted:'#c3c9b8',layout:'journey',duration:1.15,reveal:'horizon',note:'夕阳、水面与归途',pan:true},
  {name:'山关烟青',base:'#394942',light:'#89866f',ink:'#f3ead7',accent:'#dcc59c',muted:'#c5cbbb',layout:'landscape',duration:1.25,reveal:'horizon',note:'山关与暮霭',pan:true},
  {name:'洛川苇色',base:'#d0d1ba',light:'#f0e6c9',ink:'#34463d',accent:'#5b5433',muted:'#4b5948',layout:'verse',duration:1.1,reveal:'silk',note:'停驻水畔的静候'},
  {name:'初见绢金',base:'#e5dcc7',light:'#f5eddc',ink:'#384139',accent:'#72583a',muted:'#62614f',layout:'encounter',duration:1.65,reveal:'sighting',note:'神女初见，暖金与惊艳'},
  {name:'采芝烟绿',base:'#d7dbc8',light:'#eeead8',ink:'#33463c',accent:'#5b6340',muted:'#52614d',layout:'intimate',duration:1.2,reveal:'silk',note:'灵芝、青石与临流',detail:{x:64,y:77,title:'临流采芝 · 画中细赏'}},
  {name:'赠佩暮霞',base:'#ddcfc0',light:'#f0e1cb',ink:'#4b4039',accent:'#774c3d',muted:'#625348',layout:'intimate',duration:1.45,reveal:'silk',note:'玉佩与含蓄的心意',detail:{x:47.7,y:58,title:'赠佩通辞 · 玉佩细赏'}},
  {name:'游江石绿',base:'#c9d1bc',light:'#e5e4cc',ink:'#344d42',accent:'#4b5b44',muted:'#465842',layout:'landscape',duration:1.0,reveal:'horizon',note:'群灵游赏，舒展而轻盈',pan:true},
  {name:'凌波水青',base:'#c9d6d2',light:'#e8e9d9',ink:'#284b49',accent:'#3e5b60',muted:'#3f5b59',layout:'encounter',duration:1.35,reveal:'silk',note:'足下水纹与轻盈姿态'},
  {name:'云会青灰',base:'#ccd1d0',light:'#e8e1cd',ink:'#304548',accent:'#49595b',muted:'#455a59',layout:'landscape',duration:1.25,reveal:'horizon',note:'神祇、云气与将别',pan:true},
  {name:'别辞远蓝',base:'#485c60',light:'#a6b3af',ink:'#f4eee0',accent:'#e3d4b9',muted:'#cbd3c8',layout:'farewell',duration:1.7,reveal:'mist',note:'云车渐远与完整别辞'},
  {name:'泛舟冷烟',base:'#344d52',light:'#819c9c',ink:'#f1e9d7',accent:'#dbc6a1',muted:'#c2cfca',layout:'journey',duration:1.55,reveal:'mist',note:'薄雾、河舟与追寻',pan:true},
  {name:'月夜墨蓝',base:'#263a40',light:'#717a77',ink:'#f0e8d5',accent:'#d5bd8d',muted:'#c1c9bf',layout:'reflection',duration:1.8,reveal:'mist',note:'烛火、月色与长夜'},
  {name:'晨雾苍青',base:'#bcc7c4',light:'#e2e0cb',ink:'#334e4b',accent:'#49573f',muted:'#3e5751',layout:'verse',duration:1.4,reveal:'horizon',note:'将明的天色与归程',pan:true},
  {name:'烟波绢灰',base:'#deddd1',light:'#f1e9d9',ink:'#45534b',accent:'#635a43',muted:'#535f54',layout:'reflection',duration:1.9,reveal:'mist',note:'远影属于回望，留下余韵'},
];

export function sceneTheme(id=0) {
  const scene=sceneDesigns[Math.max(0,id-1)];
  return {'--paper':scene.base,'--env-base':scene.base,'--env-light':scene.light,'--ink':scene.ink,'--gold':scene.accent,'--green':scene.accent,'--muted':scene.muted,'--line':`${scene.muted}48`,'--fog-color':scene.light,'--light-strength':scene.ink.startsWith('#f')?'.18':'.3','--arrival-time':`${scene.duration}s`};
}
