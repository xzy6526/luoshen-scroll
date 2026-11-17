// Complete scroll edition; source paragraphs and paintings remain in content.mjs.
export const demoScenes=[
  {id:1,atlas:0,layout:'departure',elements:['cloud'],base:'#e3e9d9',ink:'#33483f',accent:'#78623f',sky:'#fff0d2',light:'76% 20%',duration:1.8,meaning:'归途从一声自述开始。车马与暮色，尚不知前方将有怎样的相逢。'},
  {id:2,atlas:0,layout:'side',base:'#e3e9d9',ink:'#33483f',accent:'#78623f',sky:'#f4edda',light:'18% 8%',duration:1.5,meaning:'山关渐远，洛水将近。暮色中的归途，尚未预知一场相逢。',hotspots:[{x:.31,y:.65,label:'暮途车驾',quote:'日既西倾，车殆马烦。'}]},
  {id:3,atlas:2,layout:'riverside',elements:['willow','water'],base:'#e6ece0',ink:'#3a5145',accent:'#6d7357',sky:'#f5f6dc',light:'20% 15%',duration:1.6,meaning:'停车、饲马、徘徊、望川。叙事在这些缓慢的动作里停驻，视线开始转向洛水。',beats:[{label:'税驾',phrase:'税驾乎蘅皋'},{label:'秣驷',phrase:'秣驷乎芝田'},{label:'容与',phrase:'容与乎阳林'},{label:'望川',phrase:'流眄乎洛川'}]},
  {id:4,atlas:1,layout:'annotated',elements:['willow'],passages:['岩畔初见','曹植问','御者答','观其形','观其容','观其饰'],base:'#f0e6d0',ink:'#4d4435',accent:'#82633d',sky:'#fff5dc',light:'68% 12%',duration:1.8,meaning:'视线从岩畔的一瞥，转向御者的问答，再停留于神女的仪态。',hotspots:[{x:.67,y:.45,label:'神女仪态',quote:'翩若惊鸿，婉若游龙。'},{x:.2,y:.65,label:'御者与行旅',quote:'迺援御者而告之曰'}]},
  {id:5,atlas:2,layout:'herbal',elements:['willow','water'],base:'#e9eddd',ink:'#3f5140',accent:'#78805b',sky:'#fff4d8',light:'65% 18%',duration:1.7,meaning:'从自由嬉游到水边采芝，神女的动作使静画有了轻盈的节奏。沿原文的动词读，便能看见视线如何移动。',beats:[{label:'遨嬉',phrase:'以遨以嬉'},{label:'皓腕',phrase:'攘皓腕'},{label:'玄芝',phrase:'采湍濑之玄芝'}]},
  {id:6,atlas:1,layout:'letters',elements:['water'],passages:['心悦','赠佩通辞','神女回应','犹疑自持'],base:'#eee7d9',ink:'#4b4c3b',accent:'#81734e',sky:'#fff5dc',light:'50% 20%',duration:1.8,meaning:'玉佩把心意交付出去，也牵出信任与疑虑。回应之后仍有自持，这一停顿保留了情感的复杂。'},
  {id:7,atlas:2,layout:'ensemble',elements:['willow','water','cloud'],passages:['洛灵徘徊','众灵同游','延伫长慕'],base:'#dfeae2',ink:'#345247',accent:'#647b63',sky:'#f5f1d9',light:'23% 10%',duration:1.8,meaning:'众灵的热闹并未消解洛神的孤独。三段由徘徊、同游到长久等待，情绪逐渐沉入静处。'},
  {id:8,atlas:2,layout:'verse',elements:['willow','water'],base:'#e0ece5',ink:'#36514a',accent:'#5a7162',sky:'#f9f7e7',light:'30% 10%',duration:1.45,meaning:'轻盈的步履与欲言未言的神情，在水光之间相互映照。',hotspots:[{x:.69,y:.72,label:'罗袜与微波',quote:'凌波微步，罗袜生尘。'},{x:.66,y:.32,label:'回眸流盼',quote:'转眄流精，光润玉颜。'}]},
  {id:9,atlas:1,layout:'chorus',elements:['water','cloud'],passages:['收风静波','鸣鼓清歌','云驾将行'],base:'#e6eadd',ink:'#435443',accent:'#7d7851',sky:'#fff5d3',light:'60% 12%',duration:1.65,meaning:'风停、水静，鼓与歌次第响起。三组短句如同三次应和，为即将远去的云驾让出道路。'},
  {id:10,atlas:4,layout:'farewell',elements:['cloud'],passages:['云车启行','回眸徐言','洛神别辞','神影消隐'],base:'#e2e7e8',ink:'#3c5156',accent:'#7e775d',sky:'#f7f1df',light:'70% 20%',duration:2,meaning:'云车先行，别辞随后。长段的倾诉应当完整停留，直至最后一句神影消隐，画面才真正走向离别。'},
  {id:11,atlas:2,layout:'upstream',elements:['water'],base:'#dce9e4',ink:'#365249',accent:'#647967',sky:'#f5f3e0',light:'15% 20%',duration:1.75,meaning:'人已经离去，心神却仍留在原处。轻舟逆水，追寻的方向与归途相反，思念也随江流延长。'},
  {id:12,atlas:3,layout:'night',elements:['moon'],base:'#dce5ec',ink:'#354b5a',accent:'#756c53',sky:'#f2f4f2',light:'76% 14%',duration:1.7,meaning:'月色无言，长夜未尽。此处的留白，留给无法安眠的心绪。',hotspots:[{x:.38,y:.59,label:'舟中烛光',quote:'夜耿耿而不寐'}]},
  {id:13,atlas:4,layout:'dawn',elements:['dawn','cloud'],base:'#f0ecdf',ink:'#535744',accent:'#8b7957',sky:'#fff0c9',light:'15% 16%',duration:1.8,meaning:'天明之后，归途重新开始。简短的一句命令，把长夜的留恋收进了即将出发的车驾。'},
  {id:14,atlas:4,layout:'ending',base:'#ecebe0',ink:'#48554a',accent:'#786e51',sky:'#fff9e9',light:'66% 10%',duration:1.9,meaning:'卷尽，情未尽。烟波中的远影，留在回望里。',hotspots:[{x:.62,y:.45,label:'烟波远影',quote:'怅盘桓而不能去。'}]},
];
export const sceneFor=id=>demoScenes.find(s=>s.id===id);
export const sampleIds=demoScenes.map(s=>s.id);
export const atlasPosition=index=>`${index%3*50}% ${Math.floor(index/3)*100}%`;
