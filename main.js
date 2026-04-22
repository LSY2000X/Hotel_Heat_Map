let dataMode=null; // 'C'=国内版 'T'=国际版
const ENABLE_EVT_USER_UPLOAD=false; // 仅隐藏入口，保留全部用户维度逻辑代码
function setDataMode(m){
  dataMode=dataMode===m?null:m;
  ['C','T'].forEach(x=>{const b=el('mode'+x+'Btn');if(b){b.className='mode-btn'+(dataMode===x?' mode-active-'+x:'');}});
  _updateModeBadge();
}
function _updateModeBadge(){
  const b=el('modeBadge');if(!b)return;
  if(!dataMode){b.classList.add('hidden');return;}
  const isC=dataMode==='C';
  b.textContent=isC?'🇨🇳 C · 国内版':'🌏 T · 国际版';
  b.style.background=isC?'rgba(0,122,255,0.12)':'rgba(22,163,74,0.12)';
  b.style.color=isC?'#007aff':'#16a34a';
  b.classList.remove('hidden');
}
function _getModeContext(){
  if(dataMode==='T') return {
    platformDesc:"国际OTA平台（如Booking.com/Expedia等），数据来自在中国境内无法正常下载使用的应用，因此用户几乎全为入境上海的外国旅客（欧美、日韩、东南亚游客及国际商务人士）。",
    userProfile:"外国入境游客或国际商务访客。对国内本土经济连锁（如家/汉庭/全季/锦江之星）品牌认知极低，高度依赖国际品牌认知（Sofitel/InterContinental/Hyatt/Marriott/Hilton等）；决策时优先考虑地标/景区临近性（外滩、豫园、浦东、迪士尼、虹桥/浦东机场），对英文服务及国际化配套有隐性需求。",
    q2:"分析国际品牌酒店与国内本土酒店的结构占比是否符合外国旅客偏好。是否存在境外旅客熟悉的国际品牌供给缺口？是否有高星级供给不足的情况？",
    q3:"重点关注：本土连锁品牌CTR低是否因为外国旅客不认识该品牌（品牌不可见），而非产品力差——需区分这两类原因。国际品牌酒店是否存在定价陷阱（高点击低转化）？",
    q5:"考虑：对国际认知品牌酒店加权、在外滩/豫园/迪士尼等景区周边优先保障高星级/国际品牌供给、对具有英文服务标签的酒店给予曝光加成、评估是否需要引入更多国际连锁品牌填补供给缺口。"
  };
  return {
    platformDesc:"国内OTA平台（如携程/美团/飞猪等），用户以中国本土旅客为主（商务出行、国内休闲游客、节假日探亲、短途周边游等）。",
    userProfile:"中国本土旅客，熟悉国内酒店品牌（如家/汉庭/全季/锦江之星等经济连锁）以及携程挂牌体系（白金/钻石挂牌代表服务质量背书）。价格敏感度因商圈和出行目的差异显著，节假日需求波动较大。",
    q2:"分析星级组合与挂牌覆盖率是否与该商圈的国内旅客需求档次匹配（如商务区是否缺乏4星以上选择，旅游区经济型酒店是否过剩）。挂牌酒店占比是否合理？",
    q3:"关注高CTR低CR的定价陷阱（吸引点击但价格/评分拦截转化）；识别挂牌酒店与非挂牌酒店的转化率差异；评分差的酒店即使曝光高也难以转化。",
    q5:"考虑：利用挂牌机制加权（白金/钻石优先）、对高GMV/曝光酒店适当放量、对连续低CR酒店降权或限流、针对节假日高峰预判区域热门需求提前调整供给权重。"
  };
}
const SH_BBOX={minLon:120.8,maxLon:122.0,minLat:30.5,maxLat:31.9};
const IMP="曝光",CLK="点击",ORD="订单",STAR="星级",LIST="挂牌",GMV="订单额";
const SD="供需情况",SDGMV="供需·GMV",SDCLK="供需·点击";
const METRIC_UNIT={"曝光":"次","点击":"次","订单":"单","供需情况":"(log₂)","供需·GMV":"(log₂)","供需·点击":"(log₂)","供需":"万分点","星级":"星","挂牌":"","极好酒店":"元/次","极差酒店":"元/次"};
// 对比聚合使用的是英文字段键（imp/clk/ord），不能直接用中文展示名
const DIFF_METRIC_FIELD={曝光:"imp",点击:"clk",订单:"ord"};
const DIFF_MODE_LABEL={relative:"相对变化",absolute:"绝对变化"};
const DIFF_MAG_THRESHOLDS_REL=[10,20,30,40,50];
const DIFF_BIN_COLORS=["#08306b","#08519c","#2171b5","#4292c6","#c9ddff","#ffd1d1","#fc9272","#fb6a4a","#de2d26","#a50f15"];
const AVG_METRICS=new Set(["星级","挂牌","极好酒店","极差酒店"]);
const PALETTE_STOPS=["#ddeeff","#b3d4ff","#80b4ff","#4d8ffa","#2563eb","#1d4bbf","#f97316","#c2410c"];
const STAR_COLORS={0:"#d1d5db",1:"#d1d5db",2:"#d1d5db",3:"#fca5a5",4:"#ef4444",5:"#991b1b"};
const LIST_COLORS={0:"#d1d5db",5:"#fca5a5",6:"#991b1b"};
const TS_HEAT_SRC='ts-heat-src',TS_HEAT_LYR='ts-heat-lyr';
const TS_SD_SRC='ts-sd-src',TS_SD_FILL='ts-sd-fill',TS_SD_LINE='ts-sd-line';
const SUPPLY_DEMAND_PALETTE=["#1e3a8a","#1d4ed8","#3b82f6","#93c5fd","#22c55e","#22c55e","#fca5a5","#f87171","#ef4444","#991b1b","#d1d5db"];
function buildPaletteFrom(stops,n){if(n<=1)return[stops[0]];return Array.from({length:n},(_,i)=>{const t=i/(n-1),pos=t*(stops.length-1),lo=Math.floor(pos),hi=Math.min(lo+1,stops.length-1);return lerpColor(stops[lo],stops[hi],pos-lo);});}
function buildPalette(n){return buildPaletteFrom(PALETTE_STOPS,n);}
function lerpColor(a,b,t){const[ar,ag,ab]=hexP(a),[br,bg,bb]=hexP(b);return`#${toHex(Math.round(ar+(br-ar)*t))}${toHex(Math.round(ag+(bg-ag)*t))}${toHex(Math.round(ab+(bb-ab)*t))}`;}
function hexP(hex){const h=hex.replace("#","");return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function toHex(n){return n.toString(16).padStart(2,"0");}
function safeNum(v){if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;}
function quantileVal(sorted,q){if(!sorted.length)return 0;const pos=(sorted.length-1)*q,lo=Math.floor(pos);return sorted[lo]+(pos-lo)*((sorted[Math.min(lo+1,sorted.length-1)])-sorted[lo]);}
function computeThresholds(values,binCount,method){const sorted=[...values].sort((a,b)=>a-b);if(!sorted.length)return[];const min=sorted[0],max=sorted[sorted.length-1];return Array.from({length:binCount-1},(_,i)=>method==="linear"?min+(max-min)*(i+1)/binCount:quantileVal(sorted,(i+1)/binCount));}
function assignBin(v,thresholds,binCount){let bin=0;for(const t of thresholds){if(v>t)bin++;}return Math.min(bin,binCount-1);}
function fmt(v){if(v==null)return"—";return v>=10000?(v/10000).toFixed(1)+"w":v>=1000?(v/1000).toFixed(1)+"k":Math.round(v).toString();}
function el(id){return document.getElementById(id);}
function applyEventUploadFeatureFlags(){
  if(ENABLE_EVT_USER_UPLOAD)return;
  ["evtUserLabel","evtUserFile","evtUploadOr","evtFilterPanel"].forEach(id=>{
    const node=el(id);
    if(node)node.classList.add("hidden");
  });
}
const SIDEBAR_STATE_KEY="sidebarCollapsed";
function setSidebarCollapsed(collapsed){
  const wrap=document.querySelector(".wrap");
  const btn=el("sidebarToggleBtn");
  if(!wrap||!btn)return;
  wrap.classList.toggle("sidebar-collapsed",collapsed);
  btn.setAttribute("aria-expanded",String(!collapsed));
  btn.title=collapsed?"展开侧边栏":"收起侧边栏";
  const icon=el("sidebarToggleIcon");
  if(icon){
    icon.innerHTML=collapsed
      ?'<polyline points="9 18 15 12 9 6"></polyline>'
      :'<polyline points="15 18 9 12 15 6"></polyline>';
  }
  const _m=globalThis.__heatmapMap;
  if(_m&&typeof _m.resize==="function"){setTimeout(()=>_m.resize(),230);}
}
let sidebarCollapsed=localStorage.getItem(SIDEBAR_STATE_KEY)==="1";
setSidebarCollapsed(sidebarCollapsed);
el("sidebarToggleBtn").addEventListener("click",()=>{
  sidebarCollapsed=!sidebarCollapsed;
  localStorage.setItem(SIDEBAR_STATE_KEY,sidebarCollapsed?"1":"0");
  setSidebarCollapsed(sidebarCollapsed);
});
function showError(msg){el("msgError").textContent=msg;el("msgError").classList.remove("hidden");}
function clearError(){el("msgError").classList.add("hidden");}
function showLoading(v){el("msgLoading").classList.toggle("hidden",!v);}
let cachedRows=null,cachedTotalRows=0;
let mainRows=null,mainTotalRows=0;
let compareRows=null,compareTotalRows=0,compareFileName="";
let activeDatasetType="main";
let evtViewMode="main"; // main | compare | diff
let lastDiffTmp=null;
function _applyDataset(rows,totalRows,type){
  cachedRows=rows;
  cachedTotalRows=totalRows;
  activeDatasetType=type;
}
function _syncDatasetStats(){
  if(!cachedRows||!cachedRows.length){
    el("statRows").textContent="—";
    el("statValid").textContent="—";
    return;
  }
  el("statRows").textContent=(cachedTotalRows||0).toLocaleString();
  el("statValid").textContent=cachedRows.length.toLocaleString();
}
function _refreshCompareUI(){
  const hasMain=Boolean(mainRows&&mainRows.length);
  const hasCompare=Boolean(compareRows&&compareRows.length);
  if(!hasMain)evtViewMode="main";
  else if((evtViewMode==="compare"||evtViewMode==="diff")&&!hasCompare)evtViewMode="main";
  const upLabel=el("evtHotelLabel");
  const upText=el("evtHotelLabelText");
  const mainChk=el("evtViewMainChk");
  const compareChk=el("evtViewCompareChk");
  const diffChk=el("evtViewDiffChk");
  const mainText=el("evtViewMainText");
  const compareText=el("evtViewCompareText");
  const diffText=el("evtViewDiffText");
  if(upLabel)upLabel.classList.toggle("evt-upload-locked",!hasMain);
  if(upText){
    if(!hasMain)upText.textContent="请先在「1 · 上传数据」上传主文件";
    else if(hasCompare)upText.textContent=`✓ 对比数据：${compareFileName||("已上传（"+compareRows.length+" 家）")}`;
    else upText.textContent="上传对比数据（同主上传格式）";
  }
  if(upLabel)upLabel.classList.toggle("evt-file-loaded",hasCompare);
  if(mainChk){
    mainChk.disabled=!hasMain;
    mainChk.checked=evtViewMode==="main";
  }
  if(compareChk){
    compareChk.disabled=!hasCompare;
    compareChk.checked=evtViewMode==="compare";
  }
  if(diffChk){
    diffChk.disabled=!hasCompare;
    diffChk.checked=evtViewMode==="diff";
  }
  if(mainText)mainText.textContent="显示主数据";
  if(compareText){
    compareText.textContent=!hasCompare
      ?"显示对比数据（未上传）"
      :`显示对比数据（${compareFileName||"已上传"}）`;
  }
  if(diffText)diffText.textContent=hasCompare?"显示两组数据对比情况":"显示两组数据对比情况（需先上传对比数据）";
}
function switchActiveDataset(type,{rerender=true,clearDiag=true}={}){
  if(type==="compare"){
    if(!compareRows||!compareRows.length)return false;
    _applyDataset(compareRows,compareTotalRows,"compare");
  }else{
    if(!mainRows||!mainRows.length)return false;
    _applyDataset(mainRows,mainTotalRows,"main");
  }
  _syncDatasetStats();
  if(clearDiag)clearAllDiagLayers();
  if(rerender)aggregateAndRender();
  _refreshCompareUI();
  return true;
}
function setEvtViewMode(mode){
  const hasMain=Boolean(mainRows&&mainRows.length);
  const hasCompare=Boolean(compareRows&&compareRows.length);
  if(mode==="main"){
    if(!hasMain)return false;
    evtViewMode="main";
    const ok=switchActiveDataset("main");
    _refreshCompareUI();
    return ok;
  }
  if(mode==="compare"){
    if(!hasCompare)return false;
    evtViewMode="compare";
    const ok=switchActiveDataset("compare");
    _refreshCompareUI();
    return ok;
  }
  if(mode==="diff"){
    if(!hasCompare)return false;
    evtViewMode="diff";
    activeDatasetType="diff";
    const ok=renderDiffComparison();
    if(!ok)return false;
    _refreshCompareUI();
    return true;
  }
  return false;
}
function _aggregateRowsByCell(rows,resolution){
  const agg=new Map();
  for(let i=0;i<rows.length;i++){
    const r=rows[i];
    const cell=h3Cell(r.lat,r.lon,resolution);
    const cur=agg.get(cell)||{imp:0,clk:0,ord:0,count:0,indices:[]};
    cur.imp+=r[IMP]||0;
    cur.clk+=r[CLK]||0;
    cur.ord+=r[ORD]||0;
    cur.count+=1;
    cur.indices.push(i);
    agg.set(cell,cur);
  }
  return agg;
}
function _buildAbsThresholdsForMode(values,mode){
  if(mode==="relative")return [...DIFF_MAG_THRESHOLDS_REL];
  const absVals=values.map(v=>Math.abs(v)).filter(v=>Number.isFinite(v)&&v>0).sort((a,b)=>a-b);
  if(!absVals.length)return [1,2,5,10,20];
  const t1=quantileVal(absVals,0.35)||absVals[0];
  const eps=Math.max(t1*0.001,1e-9);
  const t2=Math.max(quantileVal(absVals,0.55),t1+eps);
  const t3=Math.max(quantileVal(absVals,0.72),t2+eps);
  const t4=Math.max(quantileVal(absVals,0.86),t3+eps);
  const t5=Math.max(quantileVal(absVals,0.95),t4+eps);
  return [t1,t2,t3,t4,t5];
}
function _assignDiffBin(v,absThresholds){
  const av=Math.abs(v);
  let magLevel=4; // 4=最浅，0=最深
  if(av>absThresholds[4])magLevel=0;
  else if(av>absThresholds[3])magLevel=1;
  else if(av>absThresholds[2])magLevel=2;
  else if(av>absThresholds[1])magLevel=3;
  else magLevel=4;
  // 负值/零 -> 蓝色(0-4), 正值 -> 红色(5-9)
  return v<=0?magLevel:5+(4-magLevel);
}
function renderDiffLegend(absThresholds,mode,metric){
  const box=el("legendBox");
  box.innerHTML="";
  const isAbsNonSD=mode!=="relative"&&metric!=="供需";
  const fmtAbsVal=v=>isAbsNonSD?Number(v).toFixed(3):fmt(v);
  const absUnit="pp";
  const hdr=document.createElement("div");
  hdr.style.cssText="grid-column:1/-1;display:flex;justify-content:space-between;font-size:11px;font-weight:600;margin-bottom:6px;gap:4px;";
  hdr.innerHTML='<span style="flex:1;text-align:center;background:rgba(29,78,216,0.1);color:#1d4ed8;border-radius:6px;padding:2px 0;">对比下降（蓝）</span><span style="flex:1;text-align:center;background:rgba(220,38,38,0.1);color:#dc2626;border-radius:6px;padding:2px 0;">对比上升（红）</span>';
  box.appendChild(hdr);
  for(let i=0;i<DIFF_BIN_COLORS.length;i++){
    const sw=document.createElement("div");
    sw.className="swatch";
    sw.style.background=DIFF_BIN_COLORS[i];
    const lab=document.createElement("div");
    lab.className="swatch-lab";
    if(i===0){
      lab.textContent=mode==="relative"?`< -${absThresholds[4].toFixed(1)}%`:`< -${fmtAbsVal(absThresholds[4])} ${absUnit}`;
    }else if(i===4){
      lab.textContent=mode==="relative"?`- ${absThresholds[0].toFixed(1)}% ~ 0%（浅蓝）`:`- ${fmtAbsVal(absThresholds[0])} ~ 0（浅蓝）`;
    }else if(i===5){
      lab.textContent=mode==="relative"?`0% ~ +${absThresholds[0].toFixed(1)}%（浅红）`:`0 ~ +${fmtAbsVal(absThresholds[0])}（浅红）`;
    }else if(i===9){
      lab.textContent=mode==="relative"?`> +${absThresholds[4].toFixed(1)}%`:`> +${fmtAbsVal(absThresholds[4])} ${absUnit}`;
    }else{
      if(i<=4){
        const lo=i===1?absThresholds[3]:i===2?absThresholds[2]:i===3?absThresholds[1]:absThresholds[0];
        const hi=i===1?absThresholds[4]:i===2?absThresholds[3]:i===3?absThresholds[2]:absThresholds[1];
        lab.textContent=mode==="relative"
          ?`-${hi.toFixed(1)}% ~ -${lo.toFixed(1)}%`
          :`-${fmtAbsVal(hi)} ~ -${fmtAbsVal(lo)} ${absUnit}`;
      }else{
        const lo=i===6?absThresholds[0]:i===7?absThresholds[1]:i===8?absThresholds[2]:absThresholds[3];
        const hi=i===6?absThresholds[1]:i===7?absThresholds[2]:i===8?absThresholds[3]:absThresholds[4];
        lab.textContent=mode==="relative"
          ?`+${lo.toFixed(1)}% ~ +${hi.toFixed(1)}%`
          :`+${fmtAbsVal(lo)} ~ +${fmtAbsVal(hi)} ${absUnit}`;
      }
    }
    box.appendChild(sw);
    box.appendChild(lab);
  }
}
function renderDiffComparison(){
  if(!mainRows||!mainRows.length||!compareRows||!compareRows.length)return false;
  _hideTsLayers();
  const resolution=Number(el("resSelect").value);
  const metric=el("evtDiffMetricSelect").value;
  const diffMode=el("evtDiffModeSelect").value;
  const minImp=Math.max(1,Number(el("poorMinImpInput").value)||200);
  const metricField=DIFF_METRIC_FIELD[metric]||IMP;
  const mainAgg=_aggregateRowsByCell(mainRows,resolution);
  const compareAgg=_aggregateRowsByCell(compareRows,resolution);
  const cells=[...mainAgg.entries()].filter(([,v])=>(v.imp||0)>=minImp).map(([k])=>k);
  if(!cells.length){
    const emptyAbs=_buildAbsThresholdsForMode([],diffMode);
    onMapReady(()=>{updateHeatLayer({type:"FeatureCollection",features:[]},DIFF_BIN_COLORS,10);renderDiffLegend(emptyAbs,diffMode,metric);});
    el("statCellsLabel").textContent="可比格子数";
    el("statCells").textContent="0";
    el("statSumLabel").textContent="上升 / 下降 / 平稳";
    el("statSum").textContent="0 / 0 / 0";
    el("evtInfo").textContent=`当前主数据无格子满足曝光门槛（≥${minImp}），请在“显示设置”降低格子最低曝光。`;
    el("evtInfo").classList.remove("hidden");
    return true;
  }
  const isSD=metric==="供需";
  let globalRatio,totalMainAll=0,totalCompAll=0;
  if(isSD){
    const tmi=cells.reduce((s,c)=>s+((mainAgg.get(c)?.imp)||0),0),tmo=cells.reduce((s,c)=>s+((mainAgg.get(c)?.ord)||0),0);
    const tci=cells.reduce((s,c)=>s+((compareAgg.get(c)?.imp)||0),0),tco=cells.reduce((s,c)=>s+((compareAgg.get(c)?.ord)||0),0);
    const gcrM=tmi>0?tmo/tmi:0,gcrC=tci>0?tco/tci:0;
    globalRatio=gcrM>0?gcrC/gcrM:1;
  }else{
    // 用全城所有格子的总量（而非过滤后的格子），以便正确计算份额
    totalMainAll=[...mainAgg.values()].reduce((s,v)=>s+(v[metricField]||0),0);
    totalCompAll=[...compareAgg.values()].reduce((s,v)=>s+(v[metricField]||0),0);
    globalRatio=totalMainAll>0?(totalCompAll/totalMainAll):1;
  }
  const tmp=[];
  cells.forEach((cell)=>{
    const a=mainAgg.get(cell)||{imp:0,clk:0,ord:0,count:0,indices:[]};
    const b=compareAgg.get(cell)||{imp:0,clk:0,ord:0,count:0,indices:[]};
    let delta;
    if(isSD){
      const crM=a.imp>0?a.ord/a.imp:0,crC=b.imp>0?b.ord/b.imp:0;
      delta=diffMode==="relative"
        ?(crM>0?((crC-crM*globalRatio)/(crM*globalRatio)*100):(crC>0?100:0))
        :((crC-crM)*10000);
    }else{
      const base=a[metricField]||0,comp=b[metricField]||0;
      const mShare=totalMainAll>0?base/totalMainAll:0;
      const cShare=totalCompAll>0?comp/totalCompAll:0;
      delta=diffMode==="relative"
        ?(mShare>0?((cShare-mShare)/mShare*100):(cShare>0?100:0))
        :((cShare-mShare)*100);  // 单位：百分点(pp)
    }
    tmp.push({cell,a,b,delta});
  });
  lastDiffTmp=tmp;
  const absThresholds=_buildAbsThresholdsForMode(tmp.map(x=>x.delta),diffMode);
  const features=tmp.map(({cell,a,b,delta})=>{
    const d=Number.isFinite(delta)?delta:0;
    const bin=_assignDiffBin(d,absThresholds);
    return{
      type:"Feature",
      properties:{
        h3:cell,metric:`对比-${metric}`,diffMode,bin,value:d,
        preVal:isSD?(a.imp>0?a.ord/a.imp:0):(totalMainAll>0?(a[metricField]||0)/totalMainAll:0),postVal:isSD?(b.imp>0?b.ord/b.imp:0):(totalCompAll>0?(b[metricField]||0)/totalCompAll:0),
        preImp:a.imp||0,postImp:b.imp||0,preCount:a.count||0,postCount:b.count||0,
        mainIndices:JSON.stringify(a.indices||[]),compareIndices:JSON.stringify(b.indices||[])
      },
      geometry:{type:"Polygon",coordinates:[h3Boundary(cell)]}
    };
  });
  showLayer(SCATTER_LAYER,false);
  showLayer(FILL,true);
  showLayer(LINE,true);
  onMapReady(()=>{updateHeatLayer({type:"FeatureCollection",features},DIFF_BIN_COLORS,10);renderDiffLegend(absThresholds,diffMode,metric);});
  const rise=features.filter(f=>Number(f.properties.bin)>=5&&Number(f.properties.bin)<=9).length;
  const fall=features.filter(f=>Number(f.properties.bin)>=0&&Number(f.properties.bin)<=4).length;
  const flat=0;
  el("statCellsLabel").textContent="可比格子数";
  el("statCells").textContent=features.length.toLocaleString();
  el("statSumLabel").textContent="上升 / 下降 / 平稳";
  el("statSum").textContent=`${rise} / ${fall} / ${flat}`;
  const ratioTxt=Number.isFinite(globalRatio)?`，全城${isSD?"CR":"总量"}倍率=${globalRatio.toFixed(3)}x`:"";
  el("evtInfo").textContent=`对比模式：${DIFF_MODE_LABEL[diffMode]}（对比-主），指标=${metric}${isSD?"（CR变化：蓝=过曝趋势，红=欠曝趋势）":""}，仅展示主数据曝光≥${minImp}的格子${diffMode==="relative"?ratioTxt:""}。`;
  el("evtInfo").classList.remove("hidden");
  return true;
}
function h3Cell(lat,lon,res){if(typeof h3.latLngToCell==="function")return h3.latLngToCell(lat,lon,res);if(typeof h3.geoToH3==="function")return h3.geoToH3(lat,lon,res);throw new Error("h3-js缺少latLngToCell/geoToH3");}
function h3Boundary(idx){let verts;if(typeof h3.cellToBoundary==="function"){try{verts=h3.cellToBoundary(idx);}catch{verts=h3.cellToBoundary(idx,false);}}else if(typeof h3.h3ToGeoBoundary==="function"){verts=h3.h3ToGeoBoundary(idx,false);}else throw new Error("h3-js缺少cellToBoundary");const first=verts[0];const isLatLng=Math.abs(first[0])<=90&&!(first[0]>110);const ring=isLatLng?verts.map(([la,lo])=>[lo,la]):verts.map(([lo,la])=>[lo,la]);ring.push([...ring[0]]);return ring;}function showHotelModal(hotels,title,hexCtx){
  // hexCtx optional: {type:'poor'|'good', props: featureProperties}
  const aiBtn=el("hotelModalAIBtn");
  if(hexCtx&&aiBtn){aiBtn.classList.remove("hidden");aiBtn.onclick=()=>runHexAIAnalysis({...hexCtx,hotels});}
  else if(aiBtn){aiBtn.classList.add("hidden");aiBtn.onclick=null;}
  el("hotelModalTitle").textContent=title;
  const blkImp=hotels.reduce((s,h)=>s+h[IMP],0),blkClk=hotels.reduce((s,h)=>s+h[CLK],0),blkOrd=hotels.reduce((s,h)=>s+h[ORD],0),blkGmv=hotels.reduce((s,h)=>s+(h[GMV]??0),0);
  const blkCTR=blkImp>0?blkClk/blkImp:null,blkCR=blkImp>0?blkOrd/blkImp:null;
  const cityImp=cachedRows?cachedRows.reduce((s,r)=>s+r[IMP],0):0,cityClk=cachedRows?cachedRows.reduce((s,r)=>s+r[CLK],0):0,cityOrd=cachedRows?cachedRows.reduce((s,r)=>s+r[ORD],0):0;
  const cityCTR=cityImp>0?cityClk/cityImp:null,cityCR=cityImp>0?cityOrd/cityImp:null;
  const pct=v=>v==null?"—":(v*100).toFixed(2)+"%";
  const fmtDelta=(blk,city)=>{if(blk==null||city==null||city===0)return"";const d=((blk-city)/city*100).toFixed(1),sign=d>0?"+":"",color=d>0?"#16a34a":d<0?"#dc2626":"#6b7280";return`<span style="font-size:10px;color:${color};margin-left:3px;">${sign}${d}%</span>`;};
  const summaryItems=[
    {label:"区块酒店数",value:`${hotels.length} 家`,sub:""},
    {label:"区块曝光",value:fmt(blkImp),sub:""},
    {label:"区块 CTR",value:pct(blkCTR),sub:`全城 ${pct(cityCTR)}${fmtDelta(blkCTR,cityCTR)}`},
    {label:"区块 CR",value:pct(blkCR),sub:`全城 ${pct(cityCR)}${fmtDelta(blkCR,cityCR)}`},
    {label:"区块总订单额",value:blkGmv>0?"¥"+fmt(blkGmv):"—",sub:""}
  ];
  el("hotelModalSummary").style.cssText="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:12px 16px 0;";
  el("hotelModalSummary").innerHTML=summaryItems.map(item=>`<div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);border-radius:10px;padding:8px 10px;"><div style="font-size:10.5px;color:rgba(0,0,0,0.45);margin-bottom:2px;">${item.label}</div><div style="font-size:15px;font-weight:700;letter-spacing:-0.3px;">${item.value}</div>${item.sub?`<div style="font-size:10.5px;color:rgba(0,0,0,0.4);margin-top:1px;">${item.sub}</div>`:""}</div>`).join("");
  const COLS=[
    {label:"#",key:null,numeric:true},
    {label:"ID",key:h=>h.id,numeric:false},
    {label:"酒店名称",key:h=>h.name||"",numeric:false},
    {label:"曝光",key:h=>h[IMP],numeric:true},
    {label:"点击",key:h=>h[CLK],numeric:true},
    {label:"订单",key:h=>h[ORD],numeric:true},
    {label:"CTR",key:h=>h[IMP]>0?h[CLK]/h[IMP]:0,numeric:true},
    {label:"CR",key:h=>h[IMP]>0?h[ORD]/h[IMP]:0,numeric:true},
    {label:"星级",key:h=>h[STAR],numeric:true},
    {label:"挂牌",key:h=>h[LIST],numeric:true},
    {label:"总订单额",key:h=>h[GMV]??0,numeric:true},
  ];
  let sortColIdx=3,sortDir=-1;
  function renderHead(){
    const tr=el("hotelModalHead").querySelector("tr");tr.innerHTML="";
    COLS.forEach((col,ci)=>{
      const th=document.createElement("th");
      if(col.key){
        th.className="sortable"+(ci===sortColIdx?(sortDir===-1?" sort-desc":" sort-asc"):"");
        th.innerHTML=`${col.label}<span class="sort-icon">${ci===sortColIdx?(sortDir===-1?"↓":"↑"):"↕"}</span>`;
        th.addEventListener("click",()=>{if(sortColIdx===ci)sortDir*=-1;else{sortColIdx=ci;sortDir=col.label==="ID"||col.label==="酒店名称"?1:-1;}renderHead();renderRows();});
      }else{th.textContent=col.label;}
      tr.appendChild(th);
    });
  }
  function renderRows(){
    const col=COLS[sortColIdx],data=[...hotels].sort((a,b)=>{const va=col.key(a),vb=col.key(b);if(typeof va==="string")return sortDir*va.localeCompare(vb,"zh");return sortDir*(vb-va)*-1;});
    const tbody=el("hotelModalBody");tbody.innerHTML="";
    data.forEach((h,idx)=>{
      const ctr=h[IMP]>0?h[CLK]/h[IMP]:null,cr=h[IMP]>0?h[ORD]/h[IMP]:null,tr=document.createElement("tr");
      tr.innerHTML=`<td style="color:rgba(0,0,0,0.35)">${idx+1}</td><td title="${h.id}" style="font-size:11px;color:rgba(0,0,0,0.45)">${h.id}</td><td title="${h.name||'—'}">${h.name||"—"}</td><td>${Math.round(h[IMP]).toLocaleString()}</td><td>${Math.round(h[CLK]).toLocaleString()}</td><td>${Math.round(h[ORD]).toLocaleString()}</td><td>${pct(ctr)}</td><td>${pct(cr)}</td><td>${h[STAR]}</td><td>${h[LIST]}</td><td>${h[GMV]?"¥"+Math.round(h[GMV]).toLocaleString():"—"}</td>`;
      tbody.appendChild(tr);
    });
  }
  renderHead();renderRows();el("hotelModal").classList.remove("hidden");
}
function closeHotelModal(){el("hotelModal").classList.add("hidden");}
function showDiffHotelModal(mainHotels,compareHotels,diffProps){
  const aiBtn=el("hotelModalAIBtn");
  if(aiBtn){aiBtn.classList.add("hidden");aiBtn.onclick=null;}
  const metric=String(diffProps.metric||"").replace("对比-","");
  const diffMode=diffProps.diffMode||"relative";
  const diffVal=Number(diffProps.value);
  const sign=diffVal>0?"+":"";
  const _isSdModal=metric==="供需";
  const diffLabel=Number.isFinite(diffVal)?(diffMode==="relative"?`${sign}${diffVal.toFixed(1)}%`:(_isSdModal?`${sign}${(diffVal/100).toFixed(2)} pp`:`${sign}${diffVal.toFixed(4)} pp`)):"-";
  const color=diffVal>0?"#dc2626":diffVal<0?"#1d4ed8":"#6b7280";
  el("hotelModalTitle").textContent=`对比区块 · ${metric}`;
  let activeTab=mainHotels.length>0?"main":"compare";
  function pct(v){return v==null?"—":(v*100).toFixed(2)+"%";}
  const mImp=mainHotels.reduce((s,h)=>s+h[IMP],0),mClk=mainHotels.reduce((s,h)=>s+h[CLK],0),mOrd=mainHotels.reduce((s,h)=>s+h[ORD],0);
  const cImp=compareHotels.reduce((s,h)=>s+h[IMP],0),cClk=compareHotels.reduce((s,h)=>s+h[CLK],0),cOrd=compareHotels.reduce((s,h)=>s+h[ORD],0);
  const mCTR=mImp>0?mClk/mImp:null,mCR=mImp>0?mOrd/mImp:null;
  const cCTR=cImp>0?cClk/cImp:null,cCR=cImp>0?cOrd/cImp:null;
  const COLS=[{label:"#",key:null},{label:"ID",key:h=>h.id},{label:"酒店名称",key:h=>h.name||""},{label:"曝光",key:h=>h[IMP],numeric:true},{label:"点击",key:h=>h[CLK],numeric:true},{label:"订单",key:h=>h[ORD],numeric:true},{label:"CTR",key:h=>h[IMP]>0?h[CLK]/h[IMP]:0,numeric:true},{label:"CR",key:h=>h[IMP]>0?h[ORD]/h[IMP]:0,numeric:true},{label:"星级",key:h=>h[STAR],numeric:true},{label:"挂牌",key:h=>h[LIST],numeric:true},{label:"总订单额",key:h=>h[GMV]??0,numeric:true}];
  let sortColIdx=3,sortDir=-1;
  function renderSummary(){
    const sm=el("hotelModalSummary");
    sm.style.cssText="display:block;padding:12px 16px 0;";
    sm.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid rgba(0,0,0,0.07);"><div style="display:flex;gap:6px;"><button id="_dtMain" style="padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;background:${activeTab==="main"?"#007aff":"rgba(0,0,0,0.06)"};color:${activeTab==="main"?"#fff":"rgba(0,0,0,0.5)"};">主数据（${mainHotels.length} 家）</button><button id="_dtComp" style="padding:5px 12px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;background:${activeTab==="compare"?"#0d9488":"rgba(0,0,0,0.06)"};color:${activeTab==="compare"?"#fff":"rgba(0,0,0,0.5)"};">对比数据（${compareHotels.length} 家）</button></div><span style="font-size:13px;font-weight:700;color:${color};">${metric} ${diffLabel}</span></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:2px;"><div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);border-radius:10px;padding:8px 10px;"><div style="font-size:10.5px;color:rgba(0,0,0,0.45);margin-bottom:4px;">曝光</div><div style="font-size:12px;"><span style="color:#007aff;font-weight:600;font-size:10px;margin-right:3px;">主</span>${Math.round(mImp).toLocaleString()}</div><div style="font-size:12px;margin-top:2px;"><span style="color:#0d9488;font-weight:600;font-size:10px;margin-right:3px;">比</span>${Math.round(cImp).toLocaleString()}</div></div><div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);border-radius:10px;padding:8px 10px;"><div style="font-size:10.5px;color:rgba(0,0,0,0.45);margin-bottom:4px;">CTR</div><div style="font-size:12px;"><span style="color:#007aff;font-weight:600;font-size:10px;margin-right:3px;">主</span>${pct(mCTR)}</div><div style="font-size:12px;margin-top:2px;"><span style="color:#0d9488;font-weight:600;font-size:10px;margin-right:3px;">比</span>${pct(cCTR)}</div></div><div style="background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.07);border-radius:10px;padding:8px 10px;"><div style="font-size:10.5px;color:rgba(0,0,0,0.45);margin-bottom:4px;">CR</div><div style="font-size:12px;"><span style="color:#007aff;font-weight:600;font-size:10px;margin-right:3px;">主</span>${pct(mCR)}</div><div style="font-size:12px;margin-top:2px;"><span style="color:#0d9488;font-weight:600;font-size:10px;margin-right:3px;">比</span>${pct(cCR)}</div></div></div>`;
    el("_dtMain").addEventListener("click",()=>{activeTab="main";renderSummary();renderRows();});
    el("_dtComp").addEventListener("click",()=>{activeTab="compare";renderSummary();renderRows();});
  }
  function renderHead(){
    const tr=el("hotelModalHead").querySelector("tr");tr.innerHTML="";
    COLS.forEach((col,ci)=>{
      const th=document.createElement("th");
      if(col.key){
        th.className="sortable"+(ci===sortColIdx?(sortDir===-1?" sort-desc":" sort-asc"):"");
        th.innerHTML=`${col.label}<span class="sort-icon">${ci===sortColIdx?(sortDir===-1?"↓":"↑"):"↕"}</span>`;
        th.addEventListener("click",()=>{if(sortColIdx===ci)sortDir*=-1;else{sortColIdx=ci;sortDir=(col.label==="ID"||col.label==="酒店名称")?1:-1;}renderHead();renderRows();});
      }else{th.textContent=col.label;}
      tr.appendChild(th);
    });
  }
  function renderRows(){
    const hotels=activeTab==="main"?mainHotels:compareHotels;
    const col=COLS[sortColIdx],data=[...hotels].sort((a,b)=>{const va=col.key(a),vb=col.key(b);if(typeof va==="string")return sortDir*va.localeCompare(vb,"zh");return sortDir*(vb-va)*-1;});
    const tbody=el("hotelModalBody");tbody.innerHTML="";
    data.forEach((h,idx)=>{
      const ctr=h[IMP]>0?h[CLK]/h[IMP]:null,cr=h[IMP]>0?h[ORD]/h[IMP]:null,tr=document.createElement("tr");
      tr.innerHTML=`<td style="color:rgba(0,0,0,0.35)">${idx+1}</td><td title="${h.id}" style="font-size:11px;color:rgba(0,0,0,0.45)">${h.id}</td><td title="${h.name||'—'}">${h.name||"—"}</td><td>${Math.round(h[IMP]).toLocaleString()}</td><td>${Math.round(h[CLK]).toLocaleString()}</td><td>${Math.round(h[ORD]).toLocaleString()}</td><td>${pct(ctr)}</td><td>${pct(cr)}</td><td>${h[STAR]}</td><td>${h[LIST]}</td><td>${h[GMV]?"¥"+Math.round(h[GMV]).toLocaleString():"—"}</td>`;
      tbody.appendChild(tr);
    });
  }
  renderSummary();renderHead();renderRows();
  el("hotelModal").classList.remove("hidden");
}
function _haversineKm(lon1,lat1,lon2,lat2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.asin(Math.sqrt(a));
}
function _showEvtMsg(msg){
  const el2=el("evtInfo");if(!el2)return;
  el2.textContent=msg;el2.classList.remove("hidden");
  clearTimeout(el2._t);el2._t=setTimeout(()=>el2.classList.add("hidden"),4000);
}
function showUnderexposedModal(){
  if(!mainRows?.length||!compareRows?.length){_showEvtMsg("请先上传主数据和对比数据。");return;}
  const metric=el("evtDiffMetricSelect").value;
  const diffMode=el("evtDiffModeSelect").value;
  const isSD=metric==="供需";
  const deltaUnit=diffMode==="relative"?"%":"pp";
  const minImp=Math.max(1,Number(el("poorMinImpInput").value)||200);
  // 按酒店ID建立对比数据索引
  const compareMap=new Map();
  compareRows.forEach(r=>{if(r.id!=null)compareMap.set(String(r.id),r);});
  // 计算全城归一化系数（与格子视图保持一致）
  let globalRatio=1,totalMainAll=0,totalCompAll=0;
  const METRIC_F={曝光:IMP,点击:CLK,订单:ORD};
  const mf=METRIC_F[metric]||IMP;
  // 对比期全城曝光/订单总量（用于判断对比期自身是否欠曝）
  const totalCompImp=compareRows.reduce((s,r)=>s+(r[IMP]||0),0);
  const totalCompOrd=compareRows.reduce((s,r)=>s+(r[ORD]||0),0);
  if(isSD){
    const tmi=mainRows.reduce((s,r)=>s+(r[IMP]||0),0);
    const tmo=mainRows.reduce((s,r)=>s+(r[ORD]||0),0);
    const gcrM=tmi>0?tmo/tmi:0,gcrC=totalCompImp>0?totalCompOrd/totalCompImp:0;
    globalRatio=gcrM>0?gcrC/gcrM:1;
  }else{
    totalMainAll=mainRows.reduce((s,r)=>s+(r[mf]||0),0);
    totalCompAll=compareRows.reduce((s,r)=>s+(r[mf]||0),0);
    globalRatio=totalMainAll>0?(totalCompAll/totalMainAll):1;
  }
  // 逐酒店计算 delta（只算主数据曝光 >= minImp 且在对比数据中存在的酒店）
  const hotels=[];
  mainRows.forEach(h=>{
    if((h[IMP]||0)<minImp)return;
    if(h.id==null)return;
    const c=compareMap.get(String(h.id));
    if(!c)return;
    let delta;
    if(isSD){
      const crM=h[IMP]>0?h[ORD]/h[IMP]:0;
      const crC=c[IMP]>0?c[ORD]/c[IMP]:0;
      delta=diffMode==="relative"
        ?(crM>0?((crC-crM*globalRatio)/(crM*globalRatio)*100):(crC>0?100:0))
        :((crC-crM)*10000);
    }else{
      const mShare=totalMainAll>0?(h[mf]||0)/totalMainAll:0;
      const cShare=totalCompAll>0?(c[mf]||0)/totalCompAll:0;
      delta=diffMode==="relative"
        ?(mShare>0?((cShare-mShare)/mShare*100):(cShare>0?100:0))
        :(cShare-mShare)*100;
    }
    // 对比期该酒店曝光占比 vs 订单占比
    const cImpShare=totalCompImp>0?(c[IMP]||0)/totalCompImp:0;
    const cOrdShare=totalCompOrd>0?(c[ORD]||0)/totalCompOrd:0;
    if(Number.isFinite(delta)&&delta>0)
      hotels.push({...h,_hotelDelta:delta,_c:c,_cImpShare:cImpShare,_cOrdShare:cOrdShare});
  });
  if(!hotels.length){_showEvtMsg("当前没有欠曝光酒店（主数据曝光份额低于对比数据）。");return;}
  // 按 delta 降序（欠曝最严重在前）
  hotels.sort((a,b)=>b._hotelDelta-a._hotelDelta);
  // 对比期仍欠曝过滤：曝光占比 <= 订单占比（需求还有余量）
  const stillUnderexp=hotels.filter(h=>h._cImpShare<=h._cOrdShare);
  if(!stillUnderexp.length){_showEvtMsg("没有酒店同时满足：流量暴涨 且 对比期仍供不应求。");return;}
  // 5km 过滤
  const nearbyOnly=el("evtUnderexpNearby")?.checked;
  let filtered=stillUnderexp;
  if(nearbyOnly){
    if(_eventJumpStarLon==null||_eventJumpStarLat==null){_showEvtMsg("请先设置活动跳转点，再勾选 5km 过滤。");return;}
    filtered=stillUnderexp.filter(h=>h.lon!=null&&h.lat!=null&&_haversineKm(h.lon,h.lat,_eventJumpStarLon,_eventJumpStarLat)<=5);
    if(!filtered.length){_showEvtMsg("活动点 5km 内没有符合条件的酒店。");return;}
  }
  // 生成 CSV
  function pct2(v){return v==null?"":(v*100).toFixed(2)+"%";}
  function pct4(v){return v==null?"":(v*100).toFixed(4)+"%";}
  const header=["酒店ID","酒店名称","曝光","点击","订单","CTR","CR","星级","挂牌","总订单额",`流量变化(${deltaUnit})`,`对比期曝光占比`,`对比期订单占比`];
  const rows=filtered.map(h=>{
    const ctr=h[IMP]>0?h[CLK]/h[IMP]:null;
    const cr=h[IMP]>0?h[ORD]/h[IMP]:null;
    const dVal=(isSD&&diffMode==="absolute")?h._hotelDelta/100:h._hotelDelta;
    const dStr=Number.isFinite(dVal)?`${dVal>0?"+":""}${dVal.toFixed(2)}${deltaUnit}`:"";
    return [
      h.id, h.name||"",
      Math.round(h[IMP]), Math.round(h[CLK]), Math.round(h[ORD]),
      pct2(ctr), pct2(cr),
      h[STAR], h[LIST],
      h[GMV]?Math.round(h[GMV]):"",
      dStr,
      pct4(h._cImpShare), pct4(h._cOrdShare)
    ].map(v=>String(v??'').includes(',')?`"${v}"`:v).join(',');
  });
  const csv='\uFEFF'+[header.join(','),...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`欠曝光酒店_${nearbyOnly?"5km内_":""}酒店维度_${filtered.length}家.csv`;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
}
function renderDiscreteLegend(metric){
  const box=el("legendBox");box.innerHTML="";
  const items=metric==="星级"?[["#d1d5db","0–2 星"],["#fca5a5","3 星"],["#ef4444","4 星"],["#991b1b","5 星"]]:[["#d1d5db","0（未挂牌）"],["#fca5a5","5（白金）"],["#991b1b","6（钻石）"]];
  for(const[color,label]of items){const sw=document.createElement("div");sw.className="swatch";sw.style.background=color;const lab=document.createElement("div");lab.className="swatch-lab";lab.textContent=label;box.appendChild(sw);box.appendChild(lab);}
}
function renderLegend(thresholds,palette,metricName){
  const box=el("legendBox");box.innerHTML="";
  const n=palette.length,isSD=metricName==="供需情况",isSDCLK_leg=metricName===SDCLK,unit=METRIC_UNIT[metricName]??"";
  if(isSD||isSDCLK_leg){
    const hdr=document.createElement("div");
    hdr.style.cssText="grid-column:1/-1;display:flex;justify-content:space-between;font-size:11px;font-weight:600;margin-bottom:6px;gap:4px;";
    hdr.innerHTML=`<span style="flex:4;text-align:center;background:rgba(29,78,216,0.1);color:#1d4ed8;border-radius:6px;padding:2px 0;">← 过曝</span><span style="flex:2;text-align:center;background:rgba(22,163,74,0.1);color:#16a34a;border-radius:6px;padding:2px 0;">均衡</span><span style="flex:4;text-align:center;background:rgba(153,27,27,0.1);color:#991b1b;border-radius:6px;padding:2px 0;">欠曝 →</span>`;
    box.appendChild(hdr);
  }
  for(let i=0;i<n;i++){
    const sw=document.createElement("div");sw.className="swatch";sw.style.background=palette[i];
    const lab=document.createElement("div");lab.className="swatch-lab";
    if(isSD||metricName==="供需·GMV"||isSDCLK_leg){
      const isG=metricName==="供需·GMV",isCLK=isSDCLK_leg,fL=v=>(v==null||isNaN(v))?"—":Number(v).toFixed(2);
      if(i===0)lab.textContent=isG?"无GMV（曝光多）":isCLK?"极过曝（0点击）":"极过曝（0订单）";
      else if(i===9)lab.textContent=isCLK?"极欠曝（无曝光有点击）":"极欠曝（0曝光）";
      else if(i===10)lab.textContent="数据不足（曝光极少）";
      else{const t=thresholds;if(i===1)lab.textContent=`≤ ${fL(t[0])}`;else if(i===8)lab.textContent=`> ${fL(t[t.length-1])}`;else lab.textContent=`${fL(t[i-2])} – ${fL(t[i-1])}`;}
    }else if(AVG_METRICS.has(metricName)){
      const fA=v=>v==null?"—":Number(v).toFixed(2);
      if(i===0)lab.textContent=thresholds.length?`≤ ${fA(thresholds[0])} ${unit}`:"—";
      else if(i===n-1)lab.textContent=`> ${fA(thresholds[n-2])} ${unit}`;
      else lab.textContent=`${fA(thresholds[i-1])} – ${fA(thresholds[i])} ${unit}`;
    }else{
      if(i===0)lab.textContent=thresholds.length?`≤ ${fmt(thresholds[0])} ${unit}`:"—";
      else if(i===n-1)lab.textContent=`> ${fmt(thresholds[n-2])} ${unit}`;
      else lab.textContent=`${fmt(thresholds[i-1])} – ${fmt(thresholds[i])} ${unit}`;
    }
    box.appendChild(sw);box.appendChild(lab);
  }
}const SRC="heat-src",FILL="heat-fill",LINE="heat-line",SCATTER_SRC="scatter-src",SCATTER_LAYER="scatter-circle";
function showLayer(id,visible){if(map.getLayer(id))map.setLayoutProperty(id,"visibility",visible?"visible":"none");}
function buildBaseStyle(source,tdKey,mtKey){
  let tiles,attribution,tileSize=256;
  if(source==="amap_road"){tiles=["https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}","https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}","https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}","https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"];attribution="© 高德地图";}
  else if(source==="amap_sat"){tiles=["https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}","https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}","https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}","https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"];attribution="© 高德地图（卫星）";}
  else if(source==="tianditu"&&tdKey){tiles=[`https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdKey}`,`https://t1.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdKey}`];attribution="© 天地图";}
  else if(source==="maptiler"&&mtKey){tiles=[`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mtKey}`];attribution="© MapTiler © OpenStreetMap contributors";tileSize=256;}
  else if(source==="carto"){tiles=["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png","https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png","https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"];attribution="© CARTO © OpenStreetMap contributors";}
  else{tiles=["https://tile.openstreetmap.org/{z}/{x}/{y}.png"];attribution="© OpenStreetMap contributors";}
  return{version:8,sources:{amap:{type:"raster",tiles,tileSize,attribution}},layers:[{id:"amap",type:"raster",source:"amap"}]};
}
const _savedSource=localStorage.getItem("mapSource")||"amap_road";
const _savedTdKey=localStorage.getItem("tdKey")||"";
const _savedMtKey=localStorage.getItem("maptilerKey")||"";
document.getElementById("mapSourceSelect").value=_savedSource;
if(_savedTdKey)document.getElementById("tdKeyInput").value=_savedTdKey;
if(_savedMtKey)document.getElementById("maptilerKeyInput").value=_savedMtKey;
if(_savedSource==="tianditu")document.getElementById("tdKeyWrap").style.display="block";
if(_savedSource==="maptiler")document.getElementById("maptilerKeyWrap").style.display="block";
const _savedMinImp=localStorage.getItem("minImpPerCell");
if(_savedMinImp!==null&&_savedMinImp!=="")document.getElementById("poorMinImpInput").value=_savedMinImp;
const map=new maplibregl.Map({container:"map",style:buildBaseStyle(_savedSource,_savedTdKey,_savedMtKey),center:[121.4737,31.2304],zoom:10.6});
globalThis.__heatmapMap=map;
map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
function onMapReady(cb){if(map.isStyleLoaded()){cb();}else{const retry=()=>{if(map.isStyleLoaded())cb();else map.once("styledata",retry);};map.once("styledata",retry);}}
const popup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:8,maxWidth:"240px"});
const poorPopup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:8,maxWidth:"300px"});
const goodPopup=new maplibregl.Popup({closeButton:false,closeOnClick:false,offset:8,maxWidth:"300px"});
let hoverBound=false,clickBound=false;
const EVT_CIRCLE5_SRC="evt-circle-5-src",EVT_CIRCLE5_FILL="evt-circle-5-fill",EVT_CIRCLE5_LINE="evt-circle-5-line";
const EVT_CIRCLE9_SRC="evt-circle-9-src",EVT_CIRCLE9_FILL="evt-circle-9-fill",EVT_CIRCLE9_LINE="evt-circle-9-line";
const EVT2_CIRCLE5_SRC="evt2-circle-5-src",EVT2_CIRCLE5_FILL="evt2-circle-5-fill",EVT2_CIRCLE5_LINE="evt2-circle-5-line";
const EVT2_CIRCLE9_SRC="evt2-circle-9-src",EVT2_CIRCLE9_FILL="evt2-circle-9-fill",EVT2_CIRCLE9_LINE="evt2-circle-9-line";
const POOR_SRC="poor-src",POOR_FILL="poor-fill",POOR_LINE="poor-line";
const GOOD_SRC="good-src",GOOD_FILL="good-fill",GOOD_LINE="good-line";
let poorHoverBound=false,poorLayerActive=false;
let goodHoverBound=false,goodLayerActive=false;
let lastPoorCnt=0,lastGoodCnt=0;
const HL_SRC="evt-hl-src",HL_FILL="evt-hl-fill",HL_LINE="evt-hl-line";
const LH_SRC="evt-lh-src",LH_FILL="evt-lh-fill",LH_LINE="evt-lh-line";
let hlLayerActive=false,lhLayerActive=false,hlHoverBound=false,lhHoverBound=false;
let lastHlCnt=0,lastLhCnt=0;
function updateHeatLayer(geojson,palette,binCount){
  if(!map.getSource(SRC)){
    map.addSource(SRC,{type:"geojson",data:geojson});
    const fm=["match",["get","bin"]],lm=["match",["get","bin"]];
    for(let i=0;i<binCount;i++){fm.push(i,palette[i]);lm.push(i,palette[Math.min(i+1,binCount-1)]);}
    fm.push(palette[0]);lm.push(palette[0]);
    map.addLayer({id:FILL,type:"fill",source:SRC,paint:{"fill-color":fm,"fill-opacity":0.72}});
    map.addLayer({id:LINE,type:"line",source:SRC,paint:{"line-color":lm,"line-width":0.9,"line-opacity":0.85}});
    if(!hoverBound){
      map.on("mousemove",FILL,(e)=>{
        if(!e.features?.length)return;
        if(map.getLayer(POOR_FILL)&&map.getLayoutProperty(POOR_FILL,"visibility")==="visible"&&map.queryRenderedFeatures(e.point,{layers:[POOR_FILL]}).length)return;
        const p=e.features[0].properties;map.getCanvas().style.cursor="pointer";
        let html;
        if(String(p.metric||"").startsWith("对比-")){
          const m=String(p.metric).replace("对比-","");
          const isRel=p.diffMode==="relative";
          const delta=Number(p.value);
          const sign=delta>0?"+":"";
          const _isSdM=m==="供需";
          const deltaText=!Number.isFinite(delta)?"—":(isRel?`${sign}${delta.toFixed(2)}%`:(_isSdM?`${sign}${(delta/100).toFixed(2)} pp`:`${sign}${delta.toFixed(4)} pp`));
          const color=delta>10?"#dc2626":delta<-10?"#1d4ed8":"#6b7280";
          const fmtCR=(v)=>(Number(v)*100).toFixed(3)+"%";
          const fmtShare=(v)=>`${(Number(v)*100).toFixed(4)}%`;
          const preStr=_isSdM?fmtCR(p.preVal):fmtShare(p.preVal);
          const postStr=_isSdM?fmtCR(p.postVal):fmtShare(p.postVal);
          html=`<div style="font-weight:700;font-size:14px;margin-bottom:6px;color:${color};">${p.metric}：${deltaText}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;"><span>${_isSdM?"主CR":"主占比"}：${preStr}</span><span>${_isSdM?"对比CR":"对比占比"}：${postStr}</span><span>主曝光：${Math.round(p.preImp).toLocaleString()}</span><span>对比曝光：${Math.round(p.postImp).toLocaleString()}</span><span>主酒店数：${p.preCount} 家</span><span>对比酒店数：${p.postCount} 家</span></div><div style="color:rgba(0,0,0,0.3);font-size:10.5px;margin-top:5px;">${p.h3}</div>`;
        }else if(p.metric===SD||p.metric===SDGMV||p.metric===SDCLK){
          const isG=p.metric===SDGMV,isCLK=p.metric===SDCLK,score=p.value,isLD=p.bin===10;
          const label=isLD?"数据不足":score>0.1?"欠曝":score<-0.1?"过曝":"均衡";
          const lc=isLD?"#6b7280":score>0.1?"#dc2626":score<-0.1?"#1d4ed8":"#16a34a";
          const ratio=p.impShare>0?(p.valShare/p.impShare):null;
          const ldSuffix=isG?"（无GMV数据）":isCLK?"（期望点击 < 1）":"（期望订单 < 1）";
          const valLabel=isG?"GMV":isCLK?"点击":"订单";
          html=`<div style="font-weight:700;font-size:14px;margin-bottom:6px;color:${lc};">${label}${isLD?ldSuffix:"（log₂ "+score.toFixed(2)+"）"}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;">${!isLD?`<span>${valLabel}/曝光占比：${ratio!==null?ratio.toFixed(3)+"x":"—"}</span>`:""}<span>曝光：${Math.round(p.imp).toLocaleString()} 次</span><span>点击：${Math.round(p.clk).toLocaleString()} 次</span><span>订单：${Math.round(p.ord).toLocaleString()} 单</span>${isG?`<span>GMV：¥${Math.round(p.gmv).toLocaleString()}</span>`:""}<span style="margin-top:2px;">酒店数：${p.count} 家</span></div><div style="color:rgba(0,0,0,0.3);font-size:10.5px;margin-top:5px;">${p.h3}</div>`;
        }else if(p.metric==="星级"||p.metric==="挂牌"){
          const unit=METRIC_UNIT[p.metric]??"",label=p.metric==="星级"?"平均星级":"平均挂牌";
          html=`<div style="font-weight:700;font-size:14px;margin-bottom:6px;">${label}：${Number(p.value).toFixed(2)} ${unit}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;"><span>平均星级：${Number(p.avgStar).toFixed(2)} 星</span><span>平均挂牌：${Number(p.avgList).toFixed(2)}</span><span style="margin-top:2px;">曝光：${Math.round(p.imp).toLocaleString()}</span><span>订单：${Math.round(p.ord).toLocaleString()}</span><span style="margin-top:2px;">酒店数：${p.count} 家</span></div><div style="color:rgba(0,0,0,0.3);font-size:10.5px;margin-top:5px;">${p.h3}</div>`;
        }else{
          const unit=METRIC_UNIT[p.metric]??"";
          html=`<div style="font-weight:700;font-size:14px;margin-bottom:6px;">${p.metric}：${Math.round(p.value).toLocaleString()} ${unit}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;"><span>曝光：${Math.round(p.imp).toLocaleString()}</span><span>点击：${Math.round(p.clk).toLocaleString()}</span><span>订单：${Math.round(p.ord).toLocaleString()}</span><span style="margin-top:2px;">酒店数：${p.count} 家</span></div><div style="color:rgba(0,0,0,0.3);font-size:10.5px;margin-top:5px;">${p.h3}</div>`;
        }
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
      });
      map.on("mouseleave",FILL,()=>{map.getCanvas().style.cursor="";popup.remove();});
      hoverBound=true;
    }
    if(!clickBound){
      map.on("click",FILL,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;if(String(p.metric||"").startsWith("对比-")){const mIdx=JSON.parse(p.mainIndices||"[]"),cIdx=JSON.parse(p.compareIndices||"[]");const mH=mIdx.map(i=>mainRows[i]).filter(Boolean),cH=cIdx.map(i=>compareRows[i]).filter(Boolean);if(mH.length||cH.length)showDiffHotelModal(mH,cH,p);}else{const indices=JSON.parse(p.hotelIndices||"[]");const hotels=indices.map(i=>cachedRows[i]).filter(Boolean);if(hotels.length)showHotelModal(hotels,`区块详情（${hotels.length} 家酒店）`);}});
      clickBound=true;
    }
  }else{
    map.getSource(SRC).setData(geojson);
    const fm=["match",["get","bin"]],lm=["match",["get","bin"]];
    for(let i=0;i<binCount;i++){fm.push(i,palette[i]);lm.push(i,palette[Math.min(i+1,binCount-1)]);}
    fm.push(palette[0]);lm.push(palette[0]);
    map.setPaintProperty(FILL,"fill-color",fm);map.setPaintProperty(LINE,"line-color",lm);
  }
}function updateScatterLayer(geojson,colorExpr,radius=2.5){
  if(!map.getSource(SCATTER_SRC)){
    map.addSource(SCATTER_SRC,{type:"geojson",data:geojson});
    map.addLayer({id:SCATTER_LAYER,type:"circle",source:SCATTER_SRC,paint:{"circle-radius":radius,"circle-color":colorExpr,"circle-opacity":0.85,"circle-stroke-width":0.5,"circle-stroke-color":"rgba(0,0,0,0.18)"}});
    map.on("mousemove",SCATTER_LAYER,(e)=>{
      if(!e.features?.length)return;
      const p=e.features[0].properties;map.getCanvas().style.cursor="pointer";
      let html;
      if(p.metric==="极好酒店"||p.metric==="极差酒店"){
        const catLabel=p.metric==="极好酒店"?"🔵 极好酒店":"🔴 极差酒店",catColor=p.metric==="极好酒店"?"#2563eb":"#dc2626";
        const threshLabel=p.metric==="极好酒店"?"P95 阈值":"P5 阈值";
        html=`<div style="font-weight:700;font-size:14px;margin-bottom:5px;color:${catColor};">${catLabel}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;"><span>单次曝光GMV：¥${Number(p.gmvPerImp).toFixed(4)}</span><span>${threshLabel}：¥${Number(p.threshold).toFixed(4)}</span><span style="margin-top:2px;">曝光：${Math.round(p.imp).toLocaleString()}</span><span>订单：${Math.round(p.ord).toLocaleString()}</span><span>GMV：¥${Math.round(p.gmv).toLocaleString()}</span></div><div style="color:rgba(0,0,0,0.45);font-size:11.5px;font-weight:600;margin-top:4px;">${p.hotelName||"—"}</div><div style="color:rgba(0,0,0,0.3);font-size:10px;margin-top:2px;">ID: ${p.id}</div>`;
      }else{
        const unit=METRIC_UNIT[p.metric]??"";
        html=`<div style="font-weight:700;font-size:14px;margin-bottom:5px;">${p.metric}：${p.value} ${unit}</div><div style="color:rgba(0,0,0,0.55);font-size:12px;display:flex;flex-direction:column;gap:3px;"><span>星级：${p.star}</span><span>挂牌：${p.list}</span><span style="margin-top:2px;">曝光：${Math.round(p.imp).toLocaleString()}</span><span>订单：${Math.round(p.ord).toLocaleString()}</span></div><div style="color:rgba(0,0,0,0.3);font-size:10.5px;margin-top:5px;">ID: ${p.id}</div>`;
      }
      popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
    map.on("mouseleave",SCATTER_LAYER,()=>{map.getCanvas().style.cursor="";popup.remove();});
    map.on("click",SCATTER_LAYER,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;const hotel=cachedRows[p.rowIdx];if(hotel)showHotelModal([hotel],`${hotel.name||hotel.id}`);});
  }else{
    map.getSource(SCATTER_SRC).setData(geojson);
    map.setPaintProperty(SCATTER_LAYER,"circle-color",colorExpr);
    map.setPaintProperty(SCATTER_LAYER,"circle-radius",radius);
  }
}
// ---- 区块诊断（好/差） ----
function _getDiagData(){
  const resolution=Number(el("resSelect").value);
  const minImp=Math.max(1,Number(el("poorMinImpInput").value)||200);
  const agg=new Map();
  for(let i=0;i<cachedRows.length;i++){
    const row=cachedRows[i],cell=h3Cell(row.lat,row.lon,resolution);
    const cur=agg.get(cell)||{imp:0,clk:0,ord:0,gmv:0,count:0,indices:[]};
    cur.imp+=row[IMP];cur.clk+=row[CLK];cur.ord+=row[ORD];cur.gmv+=row[GMV]??0;cur.count+=1;cur.indices.push(i);
    agg.set(cell,cur);
  }
  const eligible=[...agg.entries()].filter(([,v])=>v.imp>=minImp);
  if(!eligible.length)return{eligible,minImp,p25ctr:0,p75ctr:0,p25gmv:null,p75gmv:null,p25supply:0,p75supply:0,ctrs:[],gmvRates:[],supplyRatios:[],hasGmv:false};
  const ctrs=eligible.map(([,v])=>v.clk/v.imp);
  const gmvRates=eligible.map(([,v])=>v.gmv>0?v.gmv/v.imp:null);
  const gmvV=gmvRates.filter(x=>x!==null);
  const supplyRatios=eligible.map(([,v])=>v.count/(v.ord+0.5));
  const sc=[...ctrs].sort((a,b)=>a-b),sg=[...gmvV].sort((a,b)=>a-b),ss=[...supplyRatios].sort((a,b)=>a-b);
  return{eligible,minImp,ctrs,gmvRates,supplyRatios,hasGmv:gmvV.length>0,
    p25ctr:quantileVal(sc,0.25),p75ctr:quantileVal(sc,0.75),
    p25gmv:gmvV.length?quantileVal(sg,0.25):null,p75gmv:gmvV.length?quantileVal(sg,0.75):null,
    p25supply:quantileVal(ss,0.25),p75supply:quantileVal(ss,0.75)};
}
function _updateDiagStat(){
  const parts=[];
  if(poorLayerActive)parts.push(`<span class="diag-pill diag-pill-poor">⚠️ 差 ${lastPoorCnt} 个</span>`);
  if(goodLayerActive)parts.push(`<span class="diag-pill diag-pill-good">✅ 好 ${lastGoodCnt} 个</span>`);
  el("diagCountStat").innerHTML=parts.join(`<span class="diag-sep">·</span>`);
  const any=poorLayerActive||goodLayerActive;
  el("diagClearBtn").disabled=!any;
  if(el("diagAIBtn"))el("diagAIBtn").disabled=!any;
}
function _diagRestoreIfDone(){if(!poorLayerActive&&!goodLayerActive&&cachedRows)aggregateAndRender();}
function _mkDiagRow(hit,label,actualStr,threshStr,naText,hint,hitColor,passColor){
  if(naText!=null)return`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;color:rgba(0,0,0,0.32);"><span style="font-weight:700;flex-shrink:0;color:#9ca3af;">–</span><span><span class="poor-rule-chip poor-rule-na">${label}</span> ${naText}</span></div>`;
  const dimStyle=!hit?"color:rgba(0,0,0,0.38);":"";
  const chipBg=hit?`rgba(${hitColor=="#dc2626"?"220,38,38":"22,163,74"},0.1)`:"rgba(0,0,0,0.06)";
  const chipColor=hit?hitColor:"rgba(0,0,0,0.4)";
  return`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;${dimStyle}">`
    +`<span style="font-weight:700;flex-shrink:0;color:${hit?hitColor:"#9ca3af"};">${hit?(hitColor=="#dc2626"?"✗":"✓"):"✗"}</span>`
    +`<span><span class="poor-rule-chip" style="background:${chipBg};color:${chipColor};">${label}</span> <strong>${actualStr}</strong>`
    +`<span style="color:#9ca3af;font-size:10.5px;margin-left:3px;">${hit?"（P阈值 "+threshStr+"）":"≥ 阈值"}</span>`
    +(hit&&hint?`<div style="font-size:10.5px;color:${hitColor=="#dc2626"?"#b45309":"#15803d"};margin-top:1px;margin-left:2px;">↳ ${hint}</div>`:"")
    +`</span></div>`;
}
function detectPoorHexagons(){
  if(!cachedRows||!cachedRows.length){showError("请先上传数据");return;}
  clearError();
  const d=_getDiagData();
  if(!d.eligible.length){el("diagCountStat").innerHTML=`<span style="color:var(--danger);">无曝光达标格子，请降低阈值</span>`;return;}
  const features=[];
  d.eligible.forEach(([idx,v],i)=>{
    const ctr=d.ctrs[i],gmvPerImp=d.gmvRates[i],supplyRatio=d.supplyRatios[i];
    const hitCTR=ctr<d.p25ctr,hitGMV=d.p25gmv!==null&&gmvPerImp!==null&&gmvPerImp<d.p25gmv,hitSupply=supplyRatio>d.p75supply;
    const hitCount=(hitCTR?1:0)+(hitGMV?1:0)+(hitSupply?1:0);
    if(hitCount>=2)features.push({type:"Feature",properties:{h3:idx,imp:v.imp,clk:v.clk,ord:v.ord,gmv:v.gmv,count:v.count,ctr,gmvPerImp:gmvPerImp??-1,supplyRatio,hitCTR,hitGMV,hitSupply,hitCount,hasGMV:v.gmv>0,threshCTR:d.p25ctr,threshGMV:d.p25gmv??-1,threshSupply:d.p75supply,hotelIndices:JSON.stringify(v.indices)},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}});
  });
  lastPoorCnt=features.length;poorLayerActive=lastPoorCnt>0;_updateDiagStat();
  if(!lastPoorCnt){clearPoorLayer();_diagRestoreIfDone();return;}
  onMapReady(()=>updatePoorLayer({type:"FeatureCollection",features}));
}
function detectGoodHexagons(){
  if(!cachedRows||!cachedRows.length){showError("请先上传数据");return;}
  clearError();
  const d=_getDiagData();
  if(!d.eligible.length){el("diagCountStat").innerHTML=`<span style="color:var(--danger);">无曝光达标格子，请降低阈值</span>`;return;}
  const features=[];
  d.eligible.forEach(([idx,v],i)=>{
    const ctr=d.ctrs[i],gmvPerImp=d.gmvRates[i],supplyRatio=d.supplyRatios[i];
    const hitCTR=ctr>d.p75ctr,hitGMV=d.p75gmv!==null&&gmvPerImp!==null&&gmvPerImp>d.p75gmv,hitSupply=supplyRatio<d.p25supply;
    const hitCount=(hitCTR?1:0)+(hitGMV?1:0)+(hitSupply?1:0);
    if(hitCount>=2)features.push({type:"Feature",properties:{h3:idx,imp:v.imp,clk:v.clk,ord:v.ord,gmv:v.gmv,count:v.count,ctr,gmvPerImp:gmvPerImp??-1,supplyRatio,hitCTR,hitGMV,hitSupply,hitCount,hasGMV:v.gmv>0,threshCTR:d.p75ctr,threshGMV:d.p75gmv??-1,threshSupply:d.p25supply,hotelIndices:JSON.stringify(v.indices)},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}});
  });
  lastGoodCnt=features.length;goodLayerActive=lastGoodCnt>0;_updateDiagStat();
  if(!lastGoodCnt){clearGoodLayer();_diagRestoreIfDone();return;}
  onMapReady(()=>updateGoodLayer({type:"FeatureCollection",features}));
}
function _applyPoorLayerStyle(isNew,geojson){
  const fc=["match",["get","hitCount"],3,"#dc2626","#f97316"],lc=["match",["get","hitCount"],3,"#b91c1c","#ea580c"];
  if(isNew){map.addLayer({id:POOR_FILL,type:"fill",source:POOR_SRC,paint:{"fill-color":fc,"fill-opacity":0.55}});map.addLayer({id:POOR_LINE,type:"line",source:POOR_SRC,paint:{"line-color":lc,"line-width":1.5,"line-opacity":0.9}});}
  else{map.setPaintProperty(POOR_FILL,"fill-color",fc);map.setPaintProperty(POOR_LINE,"line-color",lc);}
}
function _applyGoodLayerStyle(isNew){
  const fc=["match",["get","hitCount"],3,"#15803d","#4ade80"],lc=["match",["get","hitCount"],3,"#14532d","#16a34a"];
  if(isNew){map.addLayer({id:GOOD_FILL,type:"fill",source:GOOD_SRC,paint:{"fill-color":fc,"fill-opacity":0.55}});map.addLayer({id:GOOD_LINE,type:"line",source:GOOD_SRC,paint:{"line-color":lc,"line-width":1.5,"line-opacity":0.9}});}
  else{map.setPaintProperty(GOOD_FILL,"fill-color",fc);map.setPaintProperty(GOOD_LINE,"line-color",lc);}
}
function updatePoorLayer(geojson){
  showLayer(FILL,false);showLayer(LINE,false);showLayer(SCATTER_LAYER,false);
  if(!map.getSource(POOR_SRC)){map.addSource(POOR_SRC,{type:"geojson",data:geojson});_applyPoorLayerStyle(true);}
  else{map.getSource(POOR_SRC).setData(geojson);_applyPoorLayerStyle(false);}
  if(!poorHoverBound){
    map.on("mousemove",POOR_FILL,(e)=>{
      if(!e.features?.length)return;
      goodPopup.remove();map.getCanvas().style.cursor="pointer";
      const p=e.features[0].properties,pct=v=>(v*100).toFixed(2)+"%",fR=v=>v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);
      const rowCTR=_mkDiagRow(p.hitCTR,"① CTR",pct(p.ctr),pct(p.threshCTR),null,p.hitCTR?"推荐酒店不够吸引人，检查内容质量与价格竞争力":null,"#dc2626","#16a34a");
      const rowGMV=(p.hasGMV&&Number(p.threshGMV)>0)?_mkDiagRow(p.hitGMV,"② GMV/曝光","¥"+fR(Number(p.gmvPerImp)),"¥"+fR(Number(p.threshGMV)),null,p.hitGMV?"单次展示变现效率低，流量资源浪费":null,"#dc2626","#16a34a"):_mkDiagRow(false,"② GMV/曝光","","","J列无数据，跳过",null,"#dc2626","#16a34a");
      const rowSupply=_mkDiagRow(p.hitSupply,"③ 酒店/订单",fR(Number(p.supplyRatio))+"家/单",fR(Number(p.threshSupply))+"家/单",null,p.hitSupply?"供给严重过剩，排序难以筛选优质酒店":null,"#dc2626","#16a34a");
      const hc=Number(p.hitCount)===3?"#dc2626":"#d97706";
      poorPopup.setLngLat(e.lngLat).setHTML(`<div style="font-weight:700;font-size:14px;color:${hc};margin-bottom:8px;">⚠️ 差区块 · 命中 ${p.hitCount}/3 条</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:9px;">${rowCTR}${rowGMV}${rowSupply}</div><div style="border-top:1px solid rgba(0,0,0,0.08);padding-top:7px;font-size:12px;color:rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:2px;"><span>曝光 <strong>${Math.round(p.imp).toLocaleString()}</strong> 次 · 点击 <strong>${Math.round(p.clk).toLocaleString()}</strong> 次</span><span>订单 <strong>${Math.round(p.ord).toLocaleString()}</strong> 单 · 酒店 <strong>${p.count}</strong> 家</span></div><div style="color:rgba(0,0,0,0.25);font-size:10px;margin-top:5px;">${p.h3}</div>`).addTo(map);
    });
    map.on("mouseleave",POOR_FILL,()=>{map.getCanvas().style.cursor="";poorPopup.remove();});
    map.on("click",POOR_FILL,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;const hotels=JSON.parse(p.hotelIndices||"[]").map(i=>cachedRows[i]).filter(Boolean);if(hotels.length)showHotelModal(hotels,`差区块详情（${hotels.length} 家酒店）`,{type:'poor',props:p});});
    poorHoverBound=true;
  }
  if(map.getLayer(POOR_FILL))map.setLayoutProperty(POOR_FILL,"visibility","visible");
  if(map.getLayer(POOR_LINE))map.setLayoutProperty(POOR_LINE,"visibility","visible");
}
function updateGoodLayer(geojson){
  showLayer(FILL,false);showLayer(LINE,false);showLayer(SCATTER_LAYER,false);
  if(!map.getSource(GOOD_SRC)){map.addSource(GOOD_SRC,{type:"geojson",data:geojson});_applyGoodLayerStyle(true);}
  else{map.getSource(GOOD_SRC).setData(geojson);_applyGoodLayerStyle(false);}
  if(!goodHoverBound){
    map.on("mousemove",GOOD_FILL,(e)=>{
      if(!e.features?.length)return;
      poorPopup.remove();map.getCanvas().style.cursor="pointer";
      const p=e.features[0].properties,pct=v=>(v*100).toFixed(2)+"%",fR=v=>v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);
      const rowCTR=_mkDiagRow(p.hitCTR,"① CTR",pct(p.ctr),pct(p.threshCTR),null,"排序命中用户需求，可作为内容优化参考","#16a34a","#dc2626");
      const rowGMV=(p.hasGMV&&Number(p.threshGMV)>0)?_mkDiagRow(p.hitGMV,"② GMV/曝光","¥"+fR(Number(p.gmvPerImp)),"¥"+fR(Number(p.threshGMV)),null,"每次展示变现效率高，值得增加曝光配额","#16a34a","#dc2626"):_mkDiagRow(false,"② GMV/曝光","","","J列无数据，跳过",null,"#16a34a","#dc2626");
      const rowSupply=_mkDiagRow(p.hitSupply,"③ 酒店/订单",fR(Number(p.supplyRatio))+"家/单",fR(Number(p.threshSupply))+"家/单",null,"需求旺盛、供给精准，可适当扩大区域供给","#16a34a","#dc2626");
      const hc=Number(p.hitCount)===3?"#15803d":"#16a34a";
      goodPopup.setLngLat(e.lngLat).setHTML(`<div style="font-weight:700;font-size:14px;color:${hc};margin-bottom:8px;">✅ 好区块 · 命中 ${p.hitCount}/3 条</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:9px;">${rowCTR}${rowGMV}${rowSupply}</div><div style="border-top:1px solid rgba(0,0,0,0.08);padding-top:7px;font-size:12px;color:rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:2px;"><span>曝光 <strong>${Math.round(p.imp).toLocaleString()}</strong> 次 · 点击 <strong>${Math.round(p.clk).toLocaleString()}</strong> 次</span><span>订单 <strong>${Math.round(p.ord).toLocaleString()}</strong> 单 · 酒店 <strong>${p.count}</strong> 家</span></div><div style="color:rgba(0,0,0,0.25);font-size:10px;margin-top:5px;">${p.h3}</div>`).addTo(map);
    });
    map.on("mouseleave",GOOD_FILL,()=>{map.getCanvas().style.cursor="";goodPopup.remove();});
    map.on("click",GOOD_FILL,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;const hotels=JSON.parse(p.hotelIndices||"[]").map(i=>cachedRows[i]).filter(Boolean);if(hotels.length)showHotelModal(hotels,`好区块详情（${hotels.length} 家酒店）`,{type:'good',props:p});});
    goodHoverBound=true;
  }
  if(map.getLayer(GOOD_FILL))map.setLayoutProperty(GOOD_FILL,"visibility","visible");
  if(map.getLayer(GOOD_LINE))map.setLayoutProperty(GOOD_LINE,"visibility","visible");
}
// ---- 热点事件：转化 × 店均曝光 区块 ----
function _getConvExposureAgg(){
  const resolution=Number(el("resSelect").value);
  const minImp=Math.max(1,Number(el("poorMinImpInput").value)||200);
  const rowsImp=cachedRows.filter(r=>r[IMP]>0);
  if(!rowsImp.length)return null;
  const hotelCRs=rowsImp.map(r=>Math.min(1,r[ORD]/r[IMP])).sort((a,b)=>a-b);
  const p25=quantileVal(hotelCRs,0.25),p75=quantileVal(hotelCRs,0.75);
  const cityAvgImp=cachedRows.reduce((s,r)=>s+r[IMP],0)/cachedRows.length;
  const agg=new Map();
  for(let i=0;i<cachedRows.length;i++){
    const row=cachedRows[i],cell=h3Cell(row.lat,row.lon,resolution);
    const cur=agg.get(cell)||{imp:0,ord:0,count:0,indices:[]};
    cur.imp+=row[IMP];cur.ord+=row[ORD];cur.count+=1;cur.indices.push(i);
    agg.set(cell,cur);
  }
  return{resolution,minImp,p25,p75,cityAvgImp,agg};
}
function _updateEvtConvStat(){
  const box=el("evtConvStat");if(!box)return;
  const parts=[];
  if(hlLayerActive)parts.push(`<span class="diag-pill" style="background:rgba(13,148,136,0.13);color:#0f766e;">高转化·低 ${lastHlCnt}</span>`);
  if(lhLayerActive)parts.push(`<span class="diag-pill" style="background:rgba(194,65,12,0.13);color:#9a3412;">低转化·高 ${lastLhCnt}</span>`);
  box.innerHTML=parts.length?parts.join(`<span class="diag-sep">·</span>`):"";
  if(el("evtConvClearBtn"))el("evtConvClearBtn").disabled=!hlLayerActive&&!lhLayerActive;
}
function _evtConvRestoreIfDone(){if(!hlLayerActive&&!lhLayerActive&&cachedRows)aggregateAndRender();}
function detectHlHexagons(){
  if(!cachedRows||!cachedRows.length){showError("请先上传数据");return;}
  clearError();
  const d=_getConvExposureAgg();
  if(!d){showError("无有效曝光数据");return;}
  const{minImp,p25,p75,cityAvgImp,agg}=d;
  const features=[];
  for(const [idx,v] of agg.entries()){
    if(v.imp<minImp)continue;
    const blockCR=v.imp>0?v.ord/v.imp:0;
    const avgImpHotel=v.imp/v.count;
    if(blockCR>p75&&avgImpHotel<cityAvgImp){
      features.push({type:"Feature",properties:{kind:"hl",h3:idx,imp:v.imp,clk:0,ord:v.ord,count:v.count,blockCR,avgImpHotel,cityAvgImp,p25,p75,hotelIndices:JSON.stringify(v.indices)},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}});
    }
  }
  lastHlCnt=features.length;hlLayerActive=lastHlCnt>0;_updateEvtConvStat();
  if(!lastHlCnt){
    clearHlLayer();
    if(!lhLayerActive)_evtConvRestoreIfDone();
    if(!lhLayerActive)el("evtConvStat").innerHTML='<span style="color:var(--danger);font-size:12px;">无满足条件的格子</span>';
    else _updateEvtConvStat();
    return;
  }
  onMapReady(()=>updateHlLayer({type:"FeatureCollection",features}));
}
function detectLhHexagons(){
  if(!cachedRows||!cachedRows.length){showError("请先上传数据");return;}
  clearError();
  const d=_getConvExposureAgg();
  if(!d){showError("无有效曝光数据");return;}
  const{minImp,p25,p75,cityAvgImp,agg}=d;
  const features=[];
  for(const [idx,v] of agg.entries()){
    if(v.imp<minImp)continue;
    const blockCR=v.imp>0?v.ord/v.imp:0;
    const avgImpHotel=v.imp/v.count;
    if(blockCR<p25&&avgImpHotel>cityAvgImp){
      features.push({type:"Feature",properties:{kind:"lh",h3:idx,imp:v.imp,clk:0,ord:v.ord,count:v.count,blockCR,avgImpHotel,cityAvgImp,p25,p75,hotelIndices:JSON.stringify(v.indices)},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}});
    }
  }
  lastLhCnt=features.length;lhLayerActive=lastLhCnt>0;_updateEvtConvStat();
  if(!lastLhCnt){
    clearLhLayer();
    if(!hlLayerActive)_evtConvRestoreIfDone();
    if(!hlLayerActive)el("evtConvStat").innerHTML='<span style="color:var(--danger);font-size:12px;">无满足条件的格子</span>';
    else _updateEvtConvStat();
    return;
  }
  onMapReady(()=>updateLhLayer({type:"FeatureCollection",features}));
}
function _applyHlLayerStyle(isNew){
  const fc="#14b8a6",lc="#0f766e";
  if(isNew){map.addLayer({id:HL_FILL,type:"fill",source:HL_SRC,paint:{"fill-color":fc,"fill-opacity":0.52}});map.addLayer({id:HL_LINE,type:"line",source:HL_SRC,paint:{"line-color":lc,"line-width":1.4,"line-opacity":0.92}});}
}
function _applyLhLayerStyle(isNew){
  const fc="#fb923c",lc="#9a3412";
  if(isNew){map.addLayer({id:LH_FILL,type:"fill",source:LH_SRC,paint:{"fill-color":fc,"fill-opacity":0.52}});map.addLayer({id:LH_LINE,type:"line",source:LH_SRC,paint:{"line-color":lc,"line-width":1.4,"line-opacity":0.92}});}
}
function updateHlLayer(geojson){
  showLayer(FILL,false);showLayer(LINE,false);showLayer(SCATTER_LAYER,false);
  if(!map.getSource(HL_SRC)){map.addSource(HL_SRC,{type:"geojson",data:geojson});_applyHlLayerStyle(true);}
  else{map.getSource(HL_SRC).setData(geojson);}
  if(!hlHoverBound){
    map.on("mousemove",HL_FILL,(e)=>{
      if(!e.features?.length)return;
      goodPopup.remove();poorPopup.remove();map.getCanvas().style.cursor="pointer";
      const p=e.features[0].properties,pct=v=>(v*100).toFixed(2)+"%";
      const rowA=`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;"><span style="font-weight:700;color:#0f766e;">✓</span><span><span class="poor-rule-chip" style="background:rgba(13,148,136,0.12);color:#0f766e;">区块转化率</span> <strong>${pct(p.blockCR)}</strong> <span style="color:#9ca3af;font-size:10.5px;">&gt; P75 ${pct(p.p75)}</span></span></div>`;
      const rowB=`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;"><span style="font-weight:700;color:#0f766e;">✓</span><span><span class="poor-rule-chip" style="background:rgba(13,148,136,0.12);color:#0f766e;">区块店均曝光</span> <strong>${Math.round(p.avgImpHotel).toLocaleString()}</strong> <span style="color:#9ca3af;font-size:10.5px;">&lt; 全城 ${Math.round(p.cityAvgImp).toLocaleString()}</span></span></div>`;
      poorPopup.setLngLat(e.lngLat).setHTML(`<div style="font-weight:700;font-size:14px;color:#0d9488;margin-bottom:8px;">高转化·低曝光</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:9px;">${rowA}${rowB}</div><div style="border-top:1px solid rgba(0,0,0,0.08);padding-top:7px;font-size:12px;color:rgba(0,0,0,0.5);"><span>曝光 <strong>${Math.round(p.imp).toLocaleString()}</strong> · 订单 <strong>${Math.round(p.ord).toLocaleString()}</strong> · 酒店 <strong>${p.count}</strong> 家</span></div><div style="color:rgba(0,0,0,0.25);font-size:10px;margin-top:5px;">${p.h3}</div>`).addTo(map);
    });
    map.on("mouseleave",HL_FILL,()=>{map.getCanvas().style.cursor="";poorPopup.remove();});
    map.on("click",HL_FILL,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;const hotels=JSON.parse(p.hotelIndices||"[]").map(i=>cachedRows[i]).filter(Boolean);if(hotels.length)showHotelModal(hotels,`高转化·低曝光（${hotels.length} 家）`);});
    hlHoverBound=true;
  }
  if(map.getLayer(HL_FILL))map.setLayoutProperty(HL_FILL,"visibility","visible");
  if(map.getLayer(HL_LINE))map.setLayoutProperty(HL_LINE,"visibility","visible");
}
function updateLhLayer(geojson){
  showLayer(FILL,false);showLayer(LINE,false);showLayer(SCATTER_LAYER,false);
  if(!map.getSource(LH_SRC)){map.addSource(LH_SRC,{type:"geojson",data:geojson});_applyLhLayerStyle(true);}
  else{map.getSource(LH_SRC).setData(geojson);}
  if(!lhHoverBound){
    map.on("mousemove",LH_FILL,(e)=>{
      if(!e.features?.length)return;
      goodPopup.remove();poorPopup.remove();map.getCanvas().style.cursor="pointer";
      const p=e.features[0].properties,pct=v=>(v*100).toFixed(2)+"%";
      const rowA=`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;"><span style="font-weight:700;color:#c2410c;">✓</span><span><span class="poor-rule-chip" style="background:rgba(194,65,12,0.12);color:#c2410c;">区块转化率</span> <strong>${pct(p.blockCR)}</strong> <span style="color:#9ca3af;font-size:10.5px;">&lt; P25 ${pct(p.p25)}</span></span></div>`;
      const rowB=`<div style="display:flex;align-items:flex-start;gap:6px;font-size:12px;"><span style="font-weight:700;color:#c2410c;">✓</span><span><span class="poor-rule-chip" style="background:rgba(194,65,12,0.12);color:#c2410c;">区块店均曝光</span> <strong>${Math.round(p.avgImpHotel).toLocaleString()}</strong> <span style="color:#9ca3af;font-size:10.5px;">&gt; 全城 ${Math.round(p.cityAvgImp).toLocaleString()}</span></span></div>`;
      poorPopup.setLngLat(e.lngLat).setHTML(`<div style="font-weight:700;font-size:14px;color:#c2410c;margin-bottom:8px;">低转化·高曝光</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:9px;">${rowA}${rowB}</div><div style="border-top:1px solid rgba(0,0,0,0.08);padding-top:7px;font-size:12px;color:rgba(0,0,0,0.5);"><span>曝光 <strong>${Math.round(p.imp).toLocaleString()}</strong> · 订单 <strong>${Math.round(p.ord).toLocaleString()}</strong> · 酒店 <strong>${p.count}</strong> 家</span></div><div style="color:rgba(0,0,0,0.25);font-size:10px;margin-top:5px;">${p.h3}</div>`).addTo(map);
    });
    map.on("mouseleave",LH_FILL,()=>{map.getCanvas().style.cursor="";poorPopup.remove();});
    map.on("click",LH_FILL,(e)=>{if(!e.features?.length)return;const p=e.features[0].properties;const hotels=JSON.parse(p.hotelIndices||"[]").map(i=>cachedRows[i]).filter(Boolean);if(hotels.length)showHotelModal(hotels,`低转化·高曝光（${hotels.length} 家）`);});
    lhHoverBound=true;
  }
  if(map.getLayer(LH_FILL))map.setLayoutProperty(LH_FILL,"visibility","visible");
  if(map.getLayer(LH_LINE))map.setLayoutProperty(LH_LINE,"visibility","visible");
}
function clearHlLayer(){hlLayerActive=false;if(map.getLayer(HL_FILL))map.setLayoutProperty(HL_FILL,"visibility","none");if(map.getLayer(HL_LINE))map.setLayoutProperty(HL_LINE,"visibility","none");}
function clearLhLayer(){lhLayerActive=false;if(map.getLayer(LH_FILL))map.setLayoutProperty(LH_FILL,"visibility","none");if(map.getLayer(LH_LINE))map.setLayoutProperty(LH_LINE,"visibility","none");}
function clearEvtConvLayers(skipAggregate){
  const was=hlLayerActive||lhLayerActive;
  hlLayerActive=false;lhLayerActive=false;
  if(map.getLayer(HL_FILL))map.setLayoutProperty(HL_FILL,"visibility","none");
  if(map.getLayer(HL_LINE))map.setLayoutProperty(HL_LINE,"visibility","none");
  if(map.getLayer(LH_FILL))map.setLayoutProperty(LH_FILL,"visibility","none");
  if(map.getLayer(LH_LINE))map.setLayoutProperty(LH_LINE,"visibility","none");
  lastHlCnt=0;lastLhCnt=0;
  if(el("evtConvStat"))el("evtConvStat").innerHTML="";
  if(el("evtConvClearBtn"))el("evtConvClearBtn").disabled=true;
  poorPopup.remove();
  if(!skipAggregate&&was&&cachedRows)aggregateAndRender();
}
function clearPoorLayer(){poorLayerActive=false;if(map.getLayer(POOR_FILL))map.setLayoutProperty(POOR_FILL,"visibility","none");if(map.getLayer(POOR_LINE))map.setLayoutProperty(POOR_LINE,"visibility","none");}
function clearGoodLayer(){goodLayerActive=false;if(map.getLayer(GOOD_FILL))map.setLayoutProperty(GOOD_FILL,"visibility","none");if(map.getLayer(GOOD_LINE))map.setLayoutProperty(GOOD_LINE,"visibility","none");}
function clearAllDiagLayers(){
  const wasAny=poorLayerActive||goodLayerActive||hlLayerActive||lhLayerActive;
  clearPoorLayer();clearGoodLayer();
  clearEvtConvLayers(true);
  lastPoorCnt=0;lastGoodCnt=0;el("diagCountStat").textContent="";el("diagClearBtn").disabled=true;
  poorPopup.remove();goodPopup.remove();
  if(wasAny&&cachedRows)aggregateAndRender();
}
// ---- end 区块诊断 ----
function aggregateAndRender(){
  if(!cachedRows||!cachedRows.length)return;
  _hideTsLayers();
  const resolution=Number(el("resSelect").value),binMethod=el("binSelect").value,metric=el("metricSelect").value;
  const isSD=metric===SD,isSDGMV=metric===SDGMV,isSDCLK=metric===SDCLK,isSDType=isSD||isSDGMV||isSDCLK,isAvg=AVG_METRICS.has(metric);
  const binCount=isSDType?10:Number(el("binCountSelect").value);
  if(isAvg){
    showLayer(FILL,false);showLayer(LINE,false);
    if(metric==="极好酒店"||metric==="极差酒店"){
      const MIN_IMP=500,showGood=metric==="极好酒店";
      // 只取曝光>=200且有GMV的酒店计算百分位
      const eligible=cachedRows.filter(r=>r[IMP]>=MIN_IMP);
      const cntSkip=cachedRows.length-eligible.length;
      if(!eligible.length){showError("没有曝光>=200的酒店，无法计算百分位。");showLoading(false);return;}
      const allGmvPerImp=eligible.map(r=>(r[GMV]??0)/r[IMP]).sort((a,b)=>a-b);
      const p5=quantileVal(allGmvPerImp,0.05),p95=quantileVal(allGmvPerImp,0.95);
      const threshold=showGood?p95:p5;
      let cntMatch=0;const features=[];
      eligible.forEach((r,_)=>{
        const i=cachedRows.indexOf(r);
        const gmvPerImp=(r[GMV]??0)/r[IMP];
        const isTarget=showGood?gmvPerImp>=p95:gmvPerImp<=p5;
        if(!isTarget)return;cntMatch++;
        features.push({type:"Feature",properties:{metric,gmvPerImp,threshold,imp:r[IMP],ord:r[ORD],gmv:r[GMV]??0,star:r[STAR],list:r[LIST],id:r.id,hotelName:r.name,rowIdx:i},geometry:{type:"Point",coordinates:[r.lon,r.lat]}});
      });
      const dotColor=showGood?"#3b82f6":"#ef4444";
      const thFmt=threshold.toFixed(4);
      const doRender=()=>{
        showLayer(SCATTER_LAYER,true);
        updateScatterLayer({type:"FeatureCollection",features},dotColor,5);
        const box=el("legendBox");box.innerHTML="";
        const label=showGood?`🔵 极好酒店（P95 ≥ ¥${thFmt}）共 ${cntMatch} 家`:`🔴 极差酒店（P5 ≤ ¥${thFmt}）共 ${cntMatch} 家`;
        const sw=document.createElement("div");sw.className="swatch";sw.style.background=dotColor;
        const lb=document.createElement("div");lb.className="swatch-lab";lb.textContent=label;
        box.appendChild(sw);box.appendChild(lb);
      };
      onMapReady(doRender);
      el("statCellsLabel").textContent=showGood?"极好酒店数":"极差酒店数";
      el("statCells").textContent=cntMatch.toLocaleString();
      el("statSumLabel").textContent="曝光不足过滤";el("statSum").textContent=cntSkip.toLocaleString();
      return;
    }
    const colorMap=metric===STAR?STAR_COLORS:LIST_COLORS,colorExpr=["match",["get","value"]];
    for(const[val,color]of Object.entries(colorMap))colorExpr.push(Number(val),color);
    colorExpr.push("#d1d5db");
    const features=cachedRows.map((r,i)=>({type:"Feature",properties:{metric,value:metric===STAR?r[STAR]:r[LIST],star:r[STAR],list:r[LIST],imp:r[IMP],ord:r[ORD],id:r.id,rowIdx:i},geometry:{type:"Point",coordinates:[r.lon,r.lat]}}));
    const doRender=()=>{showLayer(SCATTER_LAYER,true);updateScatterLayer({type:"FeatureCollection",features},colorExpr,2.5);renderDiscreteLegend(metric);};
    onMapReady(doRender);
    el("statCellsLabel").textContent="散点酒店数";el("statCells").textContent=cachedRows.length.toLocaleString();
    el("statSumLabel").textContent=`平均${metric}`;
    const vals=cachedRows.map(r=>metric===STAR?r[STAR]:r[LIST]);
    el("statSum").textContent=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
    return;
  }
  showLayer(SCATTER_LAYER,false);showLayer(FILL,true);showLayer(LINE,true);
  const agg=new Map();
  for(let i=0;i<cachedRows.length;i++){
    const row=cachedRows[i],cell=h3Cell(row.lat,row.lon,resolution);
    const cur=agg.get(cell)||{imp:0,clk:0,ord:0,gmv:0,count:0,indices:[]};
    cur.imp+=row[IMP];cur.clk+=row[CLK];cur.ord+=row[ORD];cur.gmv+=row[GMV]??0;cur.count+=1;cur.indices.push(i);
    agg.set(cell,cur);
  }
  const entries=[...agg.entries()];
  const minImp=Math.max(1,Number(el("poorMinImpInput").value)||200);
  const entriesMeet=entries.filter(([,v])=>v.imp>=minImp);
  const totalImp=isSDType?cachedRows.reduce((s,r)=>s+r[IMP],0):0;
  const totalOrd=isSD?cachedRows.reduce((s,r)=>s+r[ORD],0):0;
  const totalGMV=isSDGMV?cachedRows.reduce((s,r)=>s+(r[GMV]??0),0):0;
  const totalClk=isSDCLK?cachedRows.reduce((s,r)=>s+r[CLK],0):0;
  const LOG2=Math.log(2);
  let thresholds,palette,features,values;
  if(isSDType){
    const totalVal=isSDGMV?totalGMV:isSDCLK?totalClk:totalOrd,getVal=v=>isSDGMV?v.gmv:isSDCLK?v.clk:v.ord;
    const avgGmvPer=totalImp>0?totalVal/totalImp:0,MIN_EXPECTED=isSDGMV?Math.max(avgGmvPer*20,1):1.0;
    const nonEmpty=entriesMeet.filter(([,v])=>v.imp>0||getVal(v)>0);
    if(!nonEmpty.length){
      const SD_EMPTY_BINS=11;
      const doRenderEmpty=()=>{
        updateHeatLayer({type:"FeatureCollection",features:[]},SUPPLY_DEMAND_PALETTE,SD_EMPTY_BINS);
        const box=el("legendBox");box.innerHTML="";
        const lab=document.createElement("div");lab.className="swatch-lab";lab.style.gridColumn="1/-1";lab.style.fontSize="12px";lab.style.color="var(--muted)";
        lab.textContent=`当前无格子总曝光 ≥ ${minImp} 次的区块（供需类指标），请调低「格子最低曝光」。`;
        box.appendChild(lab);
      };
      onMapReady(doRenderEmpty);
      el("statCellsLabel").textContent="H3 格子数（≥门槛）";el("statCells").textContent="0";
      el("statSumLabel").textContent="数据不足 / 过曝 / 正常";el("statSum").textContent="0 / 0 / 0";
      return;
    }
    const eOver=nonEmpty.filter(([,v])=>getVal(v)===0&&(v.imp/totalImp)*totalVal>=MIN_EXPECTED);
    const eLowData=nonEmpty.filter(([,v])=>getVal(v)===0&&(v.imp/totalImp)*totalVal<MIN_EXPECTED);
    const eUnder=nonEmpty.filter(([,v])=>v.imp===0&&getVal(v)>0);
    const eNorm=nonEmpty.filter(([,v])=>v.imp>0&&getVal(v)>0);
    const normScores=eNorm.map(([,v])=>Math.log((getVal(v)/totalVal)/(v.imp/totalImp))/LOG2);
    if(isSDGMV&&totalVal===0){showError("J列无数据，供需·GMV无法计算。");showLoading(false);return;}
    if(isSDCLK&&totalVal===0){showError("点击数据为空，供需·点击无法计算。");showLoading(false);return;}
    const INNER=8,SD_BINS=11;
    thresholds=computeThresholds(normScores,INNER,"quantile");palette=[...SUPPLY_DEMAND_PALETTE];
    const mkF=(idx,v,score,bin)=>({type:"Feature",properties:{h3:idx,metric,value:score,imp:v.imp,clk:v.clk,ord:v.ord,gmv:v.gmv,count:v.count,valShare:totalVal>0?getVal(v)/totalVal:0,impShare:totalImp>0?v.imp/totalImp:0,hotelIndices:JSON.stringify(v.indices),bin},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}});
    features=[...eOver.map(([idx,v])=>mkF(idx,v,-4,0)),...eNorm.map(([idx,v],i)=>mkF(idx,v,normScores[i],assignBin(normScores[i],thresholds,INNER)+1)),...eUnder.map(([idx,v])=>mkF(idx,v,4,9)),...eLowData.map(([idx,v])=>mkF(idx,v,0,10))];
    values=[...Array(eOver.length).fill(-4),...normScores,...Array(eUnder.length).fill(4)];
    const doRender=()=>{updateHeatLayer({type:"FeatureCollection",features},palette,SD_BINS);renderLegend(thresholds,palette,metric);};
    onMapReady(doRender);
    el("statCellsLabel").textContent="H3 格子数（≥门槛）";el("statCells").textContent=nonEmpty.length.toLocaleString();
    el("statSumLabel").textContent="数据不足 / 过曝 / 正常";
    el("statSum").textContent=`${eLowData.length} / ${eOver.length} / ${eNorm.length+eUnder.length}`;
  }else{
    if(!entriesMeet.length){
      thresholds=[];palette=buildPalette(binCount);values=[];features=[];
      const doRender=()=>{
        updateHeatLayer({type:"FeatureCollection",features},palette,binCount);
        const box=el("legendBox");box.innerHTML="";
        const lab=document.createElement("div");lab.className="swatch-lab";lab.style.gridColumn="1/-1";lab.style.fontSize="12px";lab.style.color="var(--muted)";
        lab.textContent=`当前无格子总曝光 ≥ ${minImp} 次的区块，请调低「格子最低曝光」或检查数据。`;
        box.appendChild(lab);
      };
      onMapReady(doRender);
      el("statCellsLabel").textContent="H3 格子数（≥门槛）";el("statCells").textContent="0";
      el("statSumLabel").textContent=`总${metric}量`;el("statSum").textContent="0";
    }else{
      values=entriesMeet.map(([,v])=>metric===IMP?v.imp:metric===CLK?v.clk:v.ord);
      thresholds=computeThresholds(values,binCount,binMethod);palette=buildPalette(binCount);
      features=entriesMeet.map(([idx,v],i)=>({type:"Feature",properties:{h3:idx,metric,value:values[i],imp:v.imp,clk:v.clk,ord:v.ord,count:v.count,impShare:0,ordShare:0,hotelIndices:JSON.stringify(v.indices),bin:assignBin(values[i],thresholds,binCount)},geometry:{type:"Polygon",coordinates:[h3Boundary(idx)]}}));
      const doRender=()=>{updateHeatLayer({type:"FeatureCollection",features},palette,binCount);renderLegend(thresholds,palette,metric);};
      onMapReady(doRender);
      el("statCellsLabel").textContent="H3 格子数（≥门槛）";el("statCells").textContent=entriesMeet.length.toLocaleString();
      el("statSumLabel").textContent=`总${metric}量`;
      el("statSum").textContent=Math.round(values.reduce((a,b)=>a+b,0)).toLocaleString();
    }
  }
}function processRawRows(allRows){
  if(!allRows||allRows.length<2)throw new Error("文件内容为空或仅含表头行。");
  const dataRows=allRows.slice(1),valid=[];let skipped=0;
  for(const row of dataRows){
    if(!row||row.length===0){skipped++;continue;}
    const impVal=safeNum(row[1])??0,clkVal=safeNum(row[2])??0,ordVal=safeNum(row[3])??0;
    const lonVal=safeNum(row[4]),latVal=safeNum(row[5]);
    const starVal=safeNum(row[6])??0,listVal=safeNum(row[7])??0;
    const nameVal=row[8]!=null&&row[8]!==""?String(row[8]).trim():"";
    const gmvVal=safeNum(row[9])??0;
    if(lonVal===null||latVal===null){skipped++;continue;}
    const _bb=getActiveBbox();if(lonVal<_bb.minLon||lonVal>_bb.maxLon||latVal<_bb.minLat||latVal>_bb.maxLat){skipped++;continue;}
    const entry={id:row[0]??"",name:nameVal,lat:latVal,lon:lonVal};
    entry[IMP]=impVal;entry[CLK]=clkVal;entry[ORD]=ordVal;entry[STAR]=starVal;entry[LIST]=listVal;entry[GMV]=gmvVal;
    valid.push(entry);
  }
  return{valid,dataRows,skipped};
}
function clearAllUploadedData(){
  if(!confirm("确定清除所有已上传数据？主上传与事件卡解析数据、地图热力与诊断/转化图层将一并清空，需重新上传。"))return;
  if(eventJumpStarMarker){try{eventJumpStarMarker.remove();}catch(_){}eventJumpStarMarker=null;}
  if(eventJumpStarMarker2){try{eventJumpStarMarker2.remove();}catch(_){}eventJumpStarMarker2=null;}
  _eventJumpStarLon=_eventJumpStarLat=null;
  _eventJumpStarLon2=_eventJumpStarLat2=null;
  if(typeof map!=="undefined"&&map)updateEventCircleLayers();
  cachedRows=null;cachedTotalRows=0;_rawUserRows=null;_isUserMode=false;
  mainRows=null;mainTotalRows=0;compareRows=null;compareTotalRows=0;compareFileName="";activeDatasetType="main";
  dataMode=null;_updateModeBadge();
  clearError();el("msgError").classList.add("hidden");showLoading(false);el("msgLoading").classList.add("hidden");
  el("statRows").textContent="—";el("statValid").textContent="—";el("statCells").textContent="—";el("statSum").textContent="—";
  el("statCellsLabel").textContent="H3 格子数";el("statSumLabel").textContent="总曝光量";
  el("legendBox").innerHTML="";
  el("refreshBtn").disabled=true;el("poorDetectBtn").disabled=true;el("goodDetectBtn").disabled=true;
  el("evtDetectHlBtn").disabled=true;el("evtDetectLhBtn").disabled=true;el("diagAIBtn").disabled=true;
  el("msgHint").textContent="";
  el("modeSelector").classList.add("hidden");
  el("statsPanel").classList.add("hidden");
  ["C","T"].forEach(x=>{const b=el("mode"+x+"Btn");if(b)b.className="mode-btn";});
  el("evtFilterPanel").classList.add("hidden");
  el("evtUserStat").textContent="";
  el("evtError").classList.add("hidden");el("evtInfo").classList.add("hidden");
  el("evtHotelLabel").classList.remove("evt-file-loaded");
  el("evtHotelLabelText").textContent="请先在「1 · 上传数据」上传主文件";
  el("evtUserLabel").classList.remove("evt-file-loaded");
  el("evtUserLabelText").textContent="② 用户维度表（UID·入住·离店·酒店ID·经纬度·点击·预订·商旅）";
  el("fileInput").value="";
  el("evtHotelFile").value="";
  el("evtUserFile").value="";
  evtViewMode="main";
  closeHotelModal();
  popup.remove();poorPopup.remove();goodPopup.remove();
  clearAllDiagLayers();
  _refreshCompareUI();
  onMapReady(()=>{
    if(map.getSource(SRC))map.getSource(SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(SCATTER_SRC))map.getSource(SCATTER_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(POOR_SRC))map.getSource(POOR_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(GOOD_SRC))map.getSource(GOOD_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(HL_SRC))map.getSource(HL_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(LH_SRC))map.getSource(LH_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(EVT_CIRCLE5_SRC))map.getSource(EVT_CIRCLE5_SRC).setData({type:"FeatureCollection",features:[]});
    if(map.getSource(EVT_CIRCLE9_SRC))map.getSource(EVT_CIRCLE9_SRC).setData({type:"FeatureCollection",features:[]});
    showLayer(FILL,true);showLayer(LINE,true);showLayer(SCATTER_LAYER,false);
  });
}
function parseFileWithWorker(buf){
  return new Promise((resolve,reject)=>{
    const worker=new Worker('parse-worker.js');
    worker.onmessage=function(e){worker.terminate();e.data.ok?resolve(e.data.rows):reject(new Error(e.data.error));};
    worker.onerror=function(e){worker.terminate();reject(new Error(e.message||'解析失败'));};
    worker.postMessage(buf,[buf]);
  });
}
async function handleFile(file){
  clearError();showLoading(true);cachedRows=null;
  el("statRows").textContent="—";el("statValid").textContent="—";el("statCells").textContent="—";el("statSum").textContent="—";
  el("legendBox").innerHTML="";el("refreshBtn").disabled=true;el("evtDetectHlBtn").disabled=true;el("evtDetectLhBtn").disabled=true;
  try{
    const buf=await file.arrayBuffer();
    const allRows=await parseFileWithWorker(buf);
    const{valid,dataRows,skipped}=processRawRows(allRows);
    if(!valid.length)throw new Error(`有效数据为空（共 ${dataRows.length} 行，可能均不在当前范围内）。`);
    _isUserMode=false;_rawUserRows=null;
    mainRows=valid;mainTotalRows=dataRows.length;
    _applyDataset(mainRows,mainTotalRows,"main");
    _syncDatasetStats();
    el("refreshBtn").disabled=false;el("poorDetectBtn").disabled=false;el("goodDetectBtn").disabled=false;el("evtDetectHlBtn").disabled=false;el("evtDetectLhBtn").disabled=false;
    clearAllDiagLayers();
    el("msgHint").textContent=skipped>0?`已跳过 ${skipped} 行，有效加载 ${valid.length} 家`:`成功加载 ${dataRows.length} 家酒店数据 ✓`;
    // Show mode selector; default to C if not yet selected
    el("modeSelector").classList.remove("hidden");
    el("statsPanel").classList.remove("hidden");
    if(!dataMode)setDataMode('C');
    evtViewMode="main";
    _refreshCompareUI();
    aggregateAndRender();
  }catch(err){showError(err?.message??String(err));}
  finally{showLoading(false);}
}
el("fileInput").addEventListener("change",(e)=>{const file=e.target.files?.[0];if(file){handleFile(file);e.target.value="";}});
el("clearAllDataBtn").addEventListener("click",clearAllUploadedData);
applyEventUploadFeatureFlags();
_refreshCompareUI();
(function ensureEventSectionOrder(){
  const card=el("eventCard"),upload=el("evtUploadSection"),conv=el("evtConvSection");
  if(card&&upload&&conv)card.insertBefore(upload,conv);
})();
function applyGlobalMinImpThreshold(){
  localStorage.setItem("minImpPerCell",String(Math.max(50,Number(el("poorMinImpInput").value)||200)));
  if(!cachedRows)return;
  if(evtViewMode==="diff"){renderDiffComparison();return;}
  if(poorLayerActive||goodLayerActive){if(poorLayerActive)detectPoorHexagons();if(goodLayerActive)detectGoodHexagons();}
  else if(hlLayerActive||lhLayerActive){if(hlLayerActive)detectHlHexagons();if(lhLayerActive)detectLhHexagons();}
  else aggregateAndRender();
}
el("refreshBtn").addEventListener("click",()=>{
  if(!cachedRows)return;
  if(evtViewMode==="diff"){renderDiffComparison();return;}
  if(poorLayerActive||goodLayerActive){if(poorLayerActive)detectPoorHexagons();if(goodLayerActive)detectGoodHexagons();}
  else if(hlLayerActive||lhLayerActive){if(hlLayerActive)detectHlHexagons();if(lhLayerActive)detectLhHexagons();}
  else aggregateAndRender();
});
el("poorMinImpInput").addEventListener("change",applyGlobalMinImpThreshold);
const SD_NOTES={
  "供需情况":`<strong style="font-size:12px;color:rgba(0,0,0,0.7);">供需情况说明</strong><br/><code style="font-size:11px;">score = log₂(订单占比 ÷ 曝光占比)</code><br/>score &gt; 0 表示欠曝，score &lt; 0 表示过曝，共分 10 档展示。`,
  "供需·GMV":`<strong style="font-size:12px;color:rgba(0,0,0,0.7);">供需·GMV 说明</strong><br/><code style="font-size:11px;">score = log₂(GMV占比 ÷ 曝光占比)</code><br/>解决高价酒店 CVR 天然偏低导致原供需指标失准的问题。`,
  "供需·点击":`<strong style="font-size:12px;color:rgba(0,0,0,0.7);">供需·点击 说明</strong><br/><code style="font-size:11px;">score = log₂(点击占比 ÷ 曝光占比) = log₂(该格子CTR ÷ 全城平均CTR)</code><br/>score &lt; 0（蓝）：曝光多但点击少，内容匹配度低；score &gt; 0（红）：点击效率高于均值，值得增加曝光。`,
  "极好酒店":`<strong style="font-size:12px;color:rgba(0,0,0,0.7);">🔵 极好酒店筛选说明</strong><br/><strong style="font-size:11px;">核心指标：</strong><code style="font-size:11px;">单次曝光 GMV = 总订单额 ÷ 曝光数</code><br/>避免高价酒店 CVR 低被误判。<br/><br/><strong style="font-size:11px;">判定：</strong><span style="color:#2563eb;font-weight:600;">极好酒店</span>：单次曝光 GMV ≥ <strong>全城 P95</strong>（前 5% 蓝点）<br/><br/><strong style="font-size:11px;">过滤：</strong>曝光 &lt; 500 次不参与；需 J 列数据。`,
  "极差酒店":`<strong style="font-size:12px;color:rgba(0,0,0,0.7);">🔴 极差酒店筛选说明</strong><br/><strong style="font-size:11px;">核心指标：</strong><code style="font-size:11px;">单次曝光 GMV = 总订单额 ÷ 曝光数</code><br/>避免高价酒店 CVR 低被误判。<br/><br/><strong style="font-size:11px;">判定：</strong><span style="color:#dc2626;font-weight:600;">极差酒店</span>：单次曝光 GMV ≤ <strong>全城 P5</strong>（后 5% 红点）<br/><br/><strong style="font-size:11px;">过滤：</strong>曝光 &lt; 500 次不参与；需 J 列数据。`
};
el("metricSelect").addEventListener("change",()=>{const v=el("metricSelect").value,note=SD_NOTES[v];el("sdNote").classList.toggle("hidden",!note);if(note)el("sdNoteContent").innerHTML=note;});
el("poorDetectBtn").addEventListener("click",detectPoorHexagons);
el("goodDetectBtn").addEventListener("click",detectGoodHexagons);
el("diagClearBtn").addEventListener("click",clearAllDiagLayers);
el("evtDetectHlBtn").addEventListener("click",detectHlHexagons);
el("evtDetectLhBtn").addEventListener("click",detectLhHexagons);
el("evtConvClearBtn").addEventListener("click",()=>clearEvtConvLayers());
el("hotelModalClose").addEventListener("click",closeHotelModal);
el("hotelModalBd").addEventListener("click",closeHotelModal);
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"){closeHotelModal();el("aiModal").classList.add("hidden");}});
// ---- AI Analysis ----
function _getAIKey(){return(el("aiKeyInput")?.value||"").trim();}
function showAIModal(title){
  el("aiModalTitle").textContent=title;
  el("aiModalBody").innerHTML=`<div class="ai-loading"><span class="spinner" style="width:16px;height:16px;border-width:2.5px;"></span>AI 分析中，请稍候…</div>`;
  el("aiModal").classList.remove("hidden");
}
function setAIModalContent(html){el("aiModalBody").innerHTML=html;}
function _fmtAIResponse(text){
  // Convert markdown headings/bold to HTML
  const escaped=text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return escaped
    .replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/^#\s+(.+)$/gm,'<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n\n+/g,'</p><p>')
    .replace(/\n/g,'<br/>')
    .replace(/^/,'<p>')
    .replace(/$/,'</p>');
}
async function callGPT(prompt,systemMsg){
  const key=_getAIKey();
  if(!key){alert("请先在区块诊断卡片中填写 OpenAI API Key");return null;}
  const model=(el("aiModelSelect")?.value)||"gpt-5.4";
  const resp=await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
    body:JSON.stringify({model,messages:[{role:"system",content:systemMsg},{role:"user",content:prompt}],max_tokens:1600,temperature:0.65})
  });
  if(!resp.ok){const e=await resp.text();throw new Error("OpenAI API 返回错误 "+resp.status+": "+e.slice(0,300));}
  const data=await resp.json();
  return data.choices?.[0]?.message?.content||"（无响应）";
}
async function runOverallAIAnalysis(){
  if(!cachedRows||(!poorLayerActive&&!goodLayerActive))return;
  showAIModal("🤖 AI 整体区块分析");
  try{
    const d=_getDiagData();
    const resolution=Number(el("resSelect").value);
    const resArea={7:"5",8:"2",9:"0.7"}[resolution]||"2";
    const pct=v=>(v*100).toFixed(2)+"%";
    const fR=v=>v==null?"无数据":v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);
    // collect representative hotel names from top hexagons
    function _topNames(srcId,n){
      try{const feats=map.getSource(srcId)?._data?.features||[];
        return [...feats].sort((a,b)=>b.properties.imp-a.properties.imp).slice(0,n)
          .flatMap(f=>JSON.parse(f.properties.hotelIndices||"[]").slice(0,4).map(i=>cachedRows[i]?.name).filter(Boolean))
          .filter((v,i,a)=>v&&a.indexOf(v)===i).slice(0,18);
      }catch{return[];}
    }
    const mc=_getModeContext();
    let prompt=`你是一位资深OTA（在线旅游平台）酒店流量排序策略产品经理。以下是上海酒店热力图的区块诊断结果，请给出深度分析与策略建议。\n\n【平台背景】\n- 平台类型：${mc.platformDesc}\n- 目标用户：${mc.userProfile}\n\n【诊断背景】\n- H3分辨率：${resolution}（约${resArea}km²/格）\n- 达标格子数（曝光≥${d.minImp}次）：${d.eligible.length}个\n- 全城基准阈值：P25 CTR=${pct(d.p25ctr)}，P75 CTR=${pct(d.p75ctr)}${d.hasGmv?`，P25 GMV/曝光=¥${fR(d.p25gmv)}，P75 GMV/曝光=¥${fR(d.p75gmv)}`:"（J列无GMV数据）"}，P25供需比=${fR(d.p25supply)}，P75供需比=${fR(d.p75supply)}家/单`;
    if(poorLayerActive){
      const pNames=_topNames(POOR_SRC,5);
      prompt+=`\n\n【差区块（${lastPoorCnt}个，占${(lastPoorCnt/d.eligible.length*100).toFixed(1)}%）】\n判定标准（命中≥2条）：CTR<${pct(d.p25ctr)}，GMV/曝光<¥${fR(d.p25gmv)}，酒店/订单>${fR(d.p75supply)}家/单\n代表性酒店（前5个差区块按曝光排序）：${pNames.join("、")||"（名称未填写）"}`;
    }
    if(goodLayerActive){
      const gNames=_topNames(GOOD_SRC,5);
      prompt+=`\n\n【好区块（${lastGoodCnt}个，占${(lastGoodCnt/d.eligible.length*100).toFixed(1)}%）】\n判定标准（命中≥2条）：CTR>${pct(d.p75ctr)}，GMV/曝光>¥${fR(d.p75gmv)}，酒店/订单<${fR(d.p25supply)}家/单\n代表性酒店（前5个好区块按曝光排序）：${gNames.join("、")||"（名称未填写）"}`;
    }
    prompt+=`\n\n请从以下维度给出分析（每点精炼，可落地）：\n1. 差区块的共同地理/商业特征（结合酒店名称推断位置，考虑${dataMode==='T'?'外国旅客的景区偏好与国际品牌认知':'国内旅客的出行目的与品牌熟悉度'}）\n2. 好区块的成功要素（${dataMode==='T'?'重点看国际品牌供给与景区临近性':'重点看挂牌覆盖与性价比结构'}）\n3. 排序策略具体调优建议（${mc.q5}）\n4. 下一步验证或A/B测试方向`;
    const sys=`你是${dataMode==='T'?'Booking.com/Expedia等国际OTA平台':'携程/美团国内OTA平台'}资深排序策略产品经理，擅长酒店平台流量排序策略。请结构清晰、言简意赅，直接给出可落地的策略建议。回复使用中文，适当使用markdown格式。`;
    const result=await callGPT(prompt,sys);
    if(result)setAIModalContent(_fmtAIResponse(result));
  }catch(err){setAIModalContent(`<p style="color:#dc2626;font-weight:600;">分析失败</p><p>${err.message}</p>`);}
}
async function runHexAIAnalysis(hexCtx){
  const isPoor=hexCtx.type==='poor';
  showAIModal(`🤖 ${isPoor?"差区块":"好区块"} AI 深度分析`);
  try{
    const p=hexCtx.props,hotels=hexCtx.hotels||[];
    const pct=v=>(v*100).toFixed(2)+"%";
    const fR=v=>v==null?"—":v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);
    const toBool=v=>v===true||v==="true";
    const hitCTR=toBool(p.hitCTR),hitGMV=toBool(p.hitGMV),hitSupply=toBool(p.hitSupply),hasGMV=toBool(p.hasGMV);
    const mc=_getModeContext();
    // City benchmarks
    const cityImp=cachedRows.reduce((s,r)=>s+r[IMP],0);
    const cityCTR=cityImp>0?cachedRows.reduce((s,r)=>s+r[CLK],0)/cityImp:null;
    const cityCR=cityImp>0?cachedRows.reduce((s,r)=>s+r[ORD],0)/cityImp:null;
    const cityGPI=cityImp>0?cachedRows.reduce((s,r)=>s+(r[GMV]??0),0)/cityImp:null;
    // Block metrics
    const blkCTR=p.imp>0?p.clk/p.imp:null;
    const blkCR=p.imp>0?p.ord/p.imp:null;
    const blkGPI=hasGMV&&p.imp>0?p.gmv/p.imp:null;
    const cmpPct=(a,b)=>a!=null&&b!=null&&b>0?((a-b)/b*100>0?"+":"")+((a-b)/b*100).toFixed(1)+"%":"";
    // Per-hotel markdown table (top 20 by imp)
    const sorted=[...hotels].sort((a,b)=>b[IMP]-a[IMP]).slice(0,20);
    const listLabel=l=>l==5?"白金":l==6?"钻石":"—";
    const tableRows=sorted.map((h,i)=>{
      const hCTR=h[IMP]>0?h[CLK]/h[IMP]:null;
      const hCR=h[IMP]>0?h[ORD]/h[IMP]:null;
      const hGPI=hasGMV&&h[IMP]>0?(h[GMV]??0)/h[IMP]:null;
      return `| ${i+1} | ${h.name||"(未知)"} | ${h[STAR]}★ | ${listLabel(h[LIST])} | ${Math.round(h[IMP]).toLocaleString()} | ${hCTR!=null?pct(hCTR):"—"} | ${hCR!=null?pct(hCR):"—"} | ${Math.round(h[ORD])} | ${hGPI!=null?"¥"+fR(hGPI):"—"} |`;
    }).join("\n");
    // Impression concentration: top 2 share
    const top2Imp=sorted.slice(0,2).reduce((s,h)=>s+h[IMP],0);
    const concPct=p.imp>0?(top2Imp/p.imp*100).toFixed(1)+"%":"—";
    // Anomalies: high CTR but zero orders (at least 100 imp)
    const anomalies=sorted.filter(h=>h[IMP]>=100&&(h[IMP]>0?h[CLK]/h[IMP]:0)>(blkCTR??0)*1.1&&h[ORD]===0);
    const anomalyStr=anomalies.length?anomalies.map(h=>h.name||String(h.id)).join("、"):"无";
    const prompt=`你是一名OTA（在线旅游平台）酒店排序策略产品经理，正在对上海酒店搜索排序的效果进行区块级精细化诊断。

## 平台背景
- **平台类型**：${mc.platformDesc}
- **目标用户**：${mc.userProfile}

## 区块概况
- **类型**：${isPoor?"⚠️ 差区块（流量效率低，排序有改进空间）":"✅ 好区块（流量效率高，可作为策略标杆）"}，命中诊断 ${p.hitCount}/3 条
- **区块 CTR**：${blkCTR!=null?pct(blkCTR):"—"}（全城均值 ${cityCTR!=null?pct(cityCTR):"—"}，偏差 ${cmpPct(blkCTR,cityCTR)}）
- **区块 CR**：${blkCR!=null?pct(blkCR):"—"}（全城均值 ${cityCR!=null?pct(cityCR):"—"}，偏差 ${cmpPct(blkCR,cityCR)}）
${hasGMV?`- **GMV/曝光**：${blkGPI!=null?"¥"+fR(blkGPI):"—"}（全城均值 ${cityGPI!=null?"¥"+fR(cityGPI):"—"}，偏差 ${cmpPct(blkGPI,cityGPI)}）\n`:""}
- **诊断触发**：① CTR ${hitCTR?(isPoor?"❌低于P25":"✅高于P75"):"○正常"}  ② GMV/曝光 ${hitGMV?(isPoor?"❌低于P25":"✅高于P75"):"○正常/无数据"}  ③ 供需比 ${hitSupply?(isPoor?"❌高于P75（供大于求）":"✅低于P25（需求旺盛）"):"○正常"}
- **曝光集中度**：前2家酒店占区块总曝光 ${concPct}
- **异常信号（高CTR但零订单）**：${anomalyStr}

## 酒店明细（共 ${p.count} 家，按曝光降序）

| # | 酒店名称 | 星级 | 挂牌 | 曝光 | CTR | CR | 订单 | GMV/曝光 |
|---|---------|------|------|-----:|----:|----:|-----:|--------:|
${tableRows}

## 请依次回答以下五个问题

**1. 地理位置与需求场景**
根据酒店名称（尤其是括号内地标信息）推断该区块所在的具体位置和商圈类型（如"外滩北侧、商务+旅游混合需求"），并判断该区域的主流住客画像（商务出行、观光游客、本地休闲等）。

**2. 星级与挂牌结构诊断**
分析现有 ${p.count} 家酒店的星级组合（${Object.entries([...hotels].reduce((m,h)=>{const s=h[STAR]??0;m[s]=(m[s]||0)+1;return m;},{})).sort((a,b)=>+a[0]-+b[0]).map(([s,c])=>`${s}★×${c}`).join("、")}）与挂牌分布。${mc.q2}

**3. 转化效率异常识别**
重点分析表格中 CTR 高但 CR 接近 0 或订单为 0 的酒店（如存在）。${mc.q3}

**4. 曝光分配合理性**
结合每家酒店的 CTR、CR、GMV/曝光判断：当前排序是否把流量分给了"最值得的酒店"？是否有低转化酒店占据头部流量、高转化酒店曝光严重不足的情况？

**5. 排序策略干预建议（3条，需可落地）**
${mc.q5}`;
    const sys=`你是${dataMode==='T'?'Booking.com/Expedia等国际OTA平台':'携程/美团国内OTA平台'}资深排序策略产品经理，熟悉上海各商圈酒店生态。你的分析必须有数据依据，落地性强，避免套话。请用中文回复，使用 markdown（## 标题、**加粗**关键结论、- 列表）。`;
    const result=await callGPT(prompt,sys);
    if(result)setAIModalContent(_fmtAIResponse(result));
  }catch(err){setAIModalContent(`<p style="color:#dc2626;font-weight:600;">分析失败</p><p>${err.message}</p>`);}
}
el("aiModalClose").addEventListener("click",()=>el("aiModal").classList.add("hidden"));
el("aiModalBd").addEventListener("click",()=>el("aiModal").classList.add("hidden"));
el("diagAIBtn").addEventListener("click",runOverallAIAnalysis);

// ============================================================
// 热点事件 & 城市选择共用变量（需在两块逻辑之前声明）
// ============================================================
let _evtLat=null,_evtLon=null,_evtStart=null,_evtEnd=null;
let _rawUserRows=null;
let _isUserMode=false;
const EVT_PRESET_CANTON={lat:23.104136,lon:113.355314};
/** 仅「跳转至事件地点」时设置，用于地图上的五角星（与城市选择无关） */
let _eventJumpStarLat=null,_eventJumpStarLon=null;
let eventJumpStarMarker=null;
let _eventJumpStarLat2=null,_eventJumpStarLon2=null;
let eventJumpStarMarker2=null;
function _buildCircleRing(lon,lat,radiusKm,segments=96){
  const EARTH_KM=6371;
  const toRad=d=>d*Math.PI/180,toDeg=r=>r*180/Math.PI;
  const lat1=toRad(lat),lon1=toRad(lon),angDist=radiusKm/EARTH_KM;
  const ring=[];
  for(let i=0;i<=segments;i++){
    const brg=2*Math.PI*(i/segments);
    const lat2=Math.asin(Math.sin(lat1)*Math.cos(angDist)+Math.cos(lat1)*Math.sin(angDist)*Math.cos(brg));
    const lon2=lon1+Math.atan2(Math.sin(brg)*Math.sin(angDist)*Math.cos(lat1),Math.cos(angDist)-Math.sin(lat1)*Math.sin(lat2));
    let dLon=toDeg(lon2);
    if(dLon>180)dLon-=360;
    if(dLon<-180)dLon+=360;
    ring.push([dLon,toDeg(lat2)]);
  }
  return ring;
}
function _circleGeoJSON(lon,lat,radiusKm){
  if(lon==null||lat==null)return{type:"FeatureCollection",features:[]};
  return{type:"FeatureCollection",features:[{type:"Feature",properties:{radiusKm},geometry:{type:"Polygon",coordinates:[_buildCircleRing(lon,lat,radiusKm)]}}]};
}
function _ensureCircleLayer(src,fill,line,color,radiusKm,geojson){
  const fillOpacity=radiusKm===5?0.07:0.045;
  const lineOpacity=radiusKm===5?0.9:0.75;
  if(!map.getSource(src))map.addSource(src,{type:"geojson",data:geojson});
  if(!map.getLayer(fill))map.addLayer({id:fill,type:"fill",source:src,paint:{"fill-color":color,"fill-opacity":fillOpacity}});
  if(!map.getLayer(line))map.addLayer({id:line,type:"line",source:src,paint:{"line-color":color,"line-width":2,"line-opacity":lineOpacity}});
}
function _setCircleVisible(src,fill,line,color,radiusKm,lon,lat,visible){
  const geojson=_circleGeoJSON(lon,lat,radiusKm);
  _ensureCircleLayer(src,fill,line,color,radiusKm,geojson);
  if(map.getSource(src))map.getSource(src).setData(geojson);
  if(map.getLayer(fill))map.setLayoutProperty(fill,"visibility",visible?"visible":"none");
  if(map.getLayer(line))map.setLayoutProperty(line,"visibility",visible?"visible":"none");
}
function updateEventCircleLayers(){
  const has1=_eventJumpStarLon!=null&&_eventJumpStarLat!=null;
  const has2=_eventJumpStarLon2!=null&&_eventJumpStarLat2!=null;
  _setCircleVisible(EVT_CIRCLE5_SRC,EVT_CIRCLE5_FILL,EVT_CIRCLE5_LINE,"#dc2626",5,_eventJumpStarLon,_eventJumpStarLat,has1&&Boolean(el("evtCircle5Chk")?.checked));
  _setCircleVisible(EVT_CIRCLE9_SRC,EVT_CIRCLE9_FILL,EVT_CIRCLE9_LINE,"#dc2626",9,_eventJumpStarLon,_eventJumpStarLat,has1&&Boolean(el("evtCircle9Chk")?.checked));
  _setCircleVisible(EVT2_CIRCLE5_SRC,EVT2_CIRCLE5_FILL,EVT2_CIRCLE5_LINE,"#f97316",5,_eventJumpStarLon2,_eventJumpStarLat2,has2&&Boolean(el("evtCircle5Chk2")?.checked));
  _setCircleVisible(EVT2_CIRCLE9_SRC,EVT2_CIRCLE9_FILL,EVT2_CIRCLE9_LINE,"#f97316",9,_eventJumpStarLon2,_eventJumpStarLat2,has2&&Boolean(el("evtCircle9Chk2")?.checked));
}
function _makeStarEl(color,stroke,title){
  const wrap=document.createElement("div");
  wrap.className="map-event-star";wrap.title=title;
  wrap.innerHTML=`<svg width="17" height="17" viewBox="0 0 24 24"><path fill="${color}" stroke="${stroke}" stroke-width="0.35" stroke-linejoin="round" d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25 1.18-6.88-5-4.87 6.91-1.01L12 1z"/></svg>`;
  return wrap;
}
function placeEventJumpStar(lon,lat){
  _eventJumpStarLon=lon;_eventJumpStarLat=lat;
  if(!eventJumpStarMarker)eventJumpStarMarker=new maplibregl.Marker({element:_makeStarEl("#dc2626","#991b1b","事件地点 1"),anchor:"center"}).setLngLat([lon,lat]).addTo(map);
  else eventJumpStarMarker.setLngLat([lon,lat]);
  updateEventCircleLayers();
}
function placeEventJumpStar2(lon,lat){
  _eventJumpStarLon2=lon;_eventJumpStarLat2=lat;
  if(!eventJumpStarMarker2)eventJumpStarMarker2=new maplibregl.Marker({element:_makeStarEl("#f97316","#c2410c","事件地点 2"),anchor:"center"}).setLngLat([lon,lat]).addTo(map);
  else eventJumpStarMarker2.setLngLat([lon,lat]);
  updateEventCircleLayers();
}
// ============================================================
// 1 · 城市选择器
// ============================================================
(function(){
  const CITY_ZOOM={上海:10.6,北京:10.2,广州:10.4,深圳:10.6,香港:11.0,重庆:10.0,成都:10.4,杭州:10.4,新加坡:11.2,东京:10.5,首尔:10.5,曼谷:10.8};
  const INTL_CITIES=new Set(["新加坡","东京","首尔","曼谷"]);
  document.querySelectorAll(".city-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      // 高亮选中
      document.querySelectorAll(".city-btn").forEach(b=>b.classList.remove("city-active"));
      btn.classList.add("city-active");
      const lat=parseFloat(btn.dataset.lat),lon=parseFloat(btn.dataset.lon),name=btn.textContent.trim();
      const isIntl=btn.dataset.intl==="true";
      // 国际城市自动切换到 MapTiler
      if(isIntl){
        const mtKey=el("maptilerKeyInput").value.trim()||localStorage.getItem("maptilerKey")||"";
        const curSrc=el("mapSourceSelect").value;
        if(curSrc!=="maptiler"){
          el("mapSourceSelect").value="maptiler";
          el("tdKeyWrap").style.display="none";
          el("maptilerKeyWrap").style.display="block";
          if(mtKey)_applyMapStyle("maptiler",el("tdKeyInput").value.trim(),mtKey);
          else _showEvtMsg("国际城市建议使用 MapTiler，请在底图设置中填入 API Key 后点击应用");
        }
      }
      // 更新 bbox 全局变量（复用热点事件变量）
      _evtLat=lat;_evtLon=lon;
      // 跳转地图
      const zoom=CITY_ZOOM[name]??10.4;
      map.flyTo({center:[lon,lat],zoom,speed:1.6});
      // 解锁上传按钮
      const lbl=el("mainUploadLabel");
      lbl.classList.remove("upload-locked");
      el("mainUploadText").textContent=`上传 ${name} 酒店数据（.xlsx / .xls）`;
      // 更新地图水印文字
      const pill=document.querySelector(".map-pill");
      if(pill)pill.textContent=`${name}酒店热力图 · 点击格子查看详情 · hover 显示数值`;
      // 同步热点事件坐标输入框（若为空则预填）
      if(!el("evtLat").value)el("evtLat").value=lat;
      if(!el("evtLon").value)el("evtLon").value=lon;
    });
  });
  // 初始化时默认选中上海（地图默认在上海，保持一致）
  const shBtn=document.querySelector('.city-btn[data-lat="31.2304"]');
  if(shBtn)shBtn.click();
})();
// ============================================================
// 5 · 热点事件分析
// ============================================================

// 返回当前有效 bbox：若已设事件坐标则以事件为中心取城市尺度范围，否则退回 SH_BBOX
function getActiveBbox(){
  if(_evtLat!==null&&_evtLon!==null){
    return{minLon:_evtLon-1.0,maxLon:_evtLon+1.0,minLat:_evtLat-0.7,maxLat:_evtLat+0.7};
  }
  return SH_BBOX;
}

// Excel 日期解析（支持序列号/字符串/Date）
function _parseDate(v){
  if(v==null||v==="")return null;
  if(v instanceof Date)return isNaN(v.getTime())?null:v;
  if(typeof v==="number"){const d=new Date(Math.round((v-25569)*86400*1000));return isNaN(d.getTime())?null:d;}
  const d=new Date(String(v).trim());return isNaN(d.getTime())?null:d;
}

// 解析用户维度表原始行
function _parseUserDimRows(allRows){
  if(!allRows||allRows.length<2)throw new Error("文件内容为空或仅含表头。");
  const dataRows=allRows.slice(1),valid=[];let skipped=0;
  for(const row of dataRows){
    if(!row||row.length===0){skipped++;continue;}
    const lonVal=safeNum(row[4]),latVal=safeNum(row[5]);
    if(lonVal===null||latVal===null){skipped++;continue;}
    valid.push({
      uid:row[0]??"",
      checkIn:_parseDate(row[1]),
      checkOut:_parseDate(row[2]),
      hotelId:row[3]!=null?String(row[3]).trim():"",
      lon:lonVal,lat:latVal,
      clicked:safeNum(row[6])??0,
      booked:safeNum(row[7])??0,
      bizTravel:safeNum(row[8])??0
    });
  }
  return{valid,total:dataRows.length,skipped};
}

// 将用户维度行聚合为 cachedRows 格式（酒店维度）
function _aggregateUserRows(userRows){
  const bbox=getActiveBbox();
  const map=new Map();
  for(const r of userRows){
    if(r.lon<bbox.minLon||r.lon>bbox.maxLon||r.lat<bbox.minLat||r.lat>bbox.maxLat)continue;
    const key=r.hotelId||`${r.lon.toFixed(5)}_${r.lat.toFixed(5)}`;
    if(!map.has(key))map.set(key,{id:key,name:"",lon:r.lon,lat:r.lat,imp:0,clk:0,ord:0});
    const h=map.get(key);h.imp++;h.clk+=r.clicked;h.ord+=r.booked;
  }
  const rows=[];
  for(const h of map.values()){
    const entry={id:h.id,name:h.name,lat:h.lat,lon:h.lon};
    entry[IMP]=h.imp;entry[CLK]=h.clk;entry[ORD]=h.ord;entry[STAR]=0;entry[LIST]=0;entry[GMV]=0;
    rows.push(entry);
  }
  return rows;
}

// 应用筛选并重新渲染（用户维度模式）
function _applyEvtFilters(){
  if(!_rawUserRows)return;
  let rows=[..._rawUserRows];
  const bizOnly=el("evtFilterBiz").checked;
  const dateOnly=el("evtFilterDate").checked;
  if(bizOnly)rows=rows.filter(r=>r.bizTravel===1);
  if(dateOnly&&_evtStart&&_evtEnd){
    const s=new Date(_evtStart);s.setDate(s.getDate()-1);// 前一天
    const e=new Date(_evtEnd);
    rows=rows.filter(r=>r.checkIn&&r.checkIn>=s&&r.checkIn<=e);
  }
  const aggregated=_aggregateUserRows(rows);
  el("evtUserStat").textContent=`筛选后：${rows.length} 条曝光记录 → ${aggregated.length} 家酒店`;
  if(!aggregated.length){el("evtError").textContent="筛选后无有效数据，请调整筛选条件或事件坐标。";el("evtError").classList.remove("hidden");return;}
  el("evtError").classList.add("hidden");
  _applyDataset(aggregated,rows.length,"main");
  _syncDatasetStats();
  el("refreshBtn").disabled=false;el("poorDetectBtn").disabled=false;el("goodDetectBtn").disabled=false;el("evtDetectHlBtn").disabled=false;el("evtDetectLhBtn").disabled=false;
  el("statsPanel").classList.remove("hidden");
  clearAllDiagLayers();
  aggregateAndRender();
}

// 加载酒店维度表（来自事件卡）
async function _handleEvtHotelFile(file){
  el("evtError").classList.add("hidden");el("evtInfo").classList.add("hidden");
  if(!mainRows||!mainRows.length){
    el("evtError").textContent="请先在「1 · 上传数据」上传主文件，再上传对比数据。";
    el("evtError").classList.remove("hidden");
    return;
  }
  showLoading(true);
  el("evtFilterPanel").classList.add("hidden");
  try{
    const buf=await file.arrayBuffer();
    const allRows=await parseFileWithWorker(buf);
    const{valid,dataRows,skipped}=processRawRows(allRows);
    if(!valid.length)throw new Error(`有效数据为空（共 ${dataRows.length} 行，可能均不在当前范围内）。`);
    _isUserMode=false;_rawUserRows=null;
    compareRows=valid;compareTotalRows=dataRows.length;compareFileName=file.name||"";
    el("refreshBtn").disabled=false;el("poorDetectBtn").disabled=false;el("goodDetectBtn").disabled=false;el("evtDetectHlBtn").disabled=false;el("evtDetectLhBtn").disabled=false;
    if(!dataMode)setDataMode('C');
    el("modeSelector").classList.remove("hidden");
    el("statsPanel").classList.remove("hidden");
    el("evtHotelLabel").classList.add("evt-file-loaded");
    el("evtUserLabel").classList.remove("evt-file-loaded");
    el("evtUserLabelText").textContent="② 用户维度表（UID·入住·离店·酒店ID·经纬度·点击·预订·商旅）";
    el("evtInfo").textContent=skipped>0?`对比数据已加载：${valid.length} 家（跳过 ${skipped} 行）。可勾选“显示对比数据”查看。`:`对比数据已加载：${dataRows.length} 家。可勾选“显示对比数据”查看。`;
    el("evtInfo").classList.remove("hidden");
    if(evtViewMode==="compare"||evtViewMode==="diff")setEvtViewMode(evtViewMode);
    else setEvtViewMode("main");
  }catch(err){el("evtError").textContent=err?.message??String(err);el("evtError").classList.remove("hidden");}
  finally{showLoading(false);}
}

// 加载用户维度表（来自事件卡）
async function _handleEvtUserFile(file){
  el("evtError").classList.add("hidden");el("evtInfo").classList.add("hidden");
  showLoading(true);cachedRows=null;_isUserMode=true;_rawUserRows=null;
  try{
    const buf=await file.arrayBuffer();
    const allRows=await parseFileWithWorker(buf);
    const{valid,total,skipped}=_parseUserDimRows(allRows);
    if(!valid.length)throw new Error(`用户维度表解析失败，没有有效行（共 ${total} 行，经纬度列为空？）`);
    _rawUserRows=valid;
    el("evtUserLabel").classList.add("evt-file-loaded");
    el("evtUserLabelText").textContent=`✓ ${file.name}（${valid.length} 条曝光记录）`;
    el("evtHotelLabel").classList.remove("evt-file-loaded");
    el("evtHotelLabelText").textContent="上传对比数据（同主上传格式）";
    el("evtFilterPanel").classList.remove("hidden");
    el("evtInfo").textContent=`用户维度表已加载：${valid.length} 条记录（跳过 ${skipped} 行），可在下方筛选后渲染。`;
    el("evtInfo").classList.remove("hidden");
    _applyEvtFilters();
  }catch(err){el("evtError").textContent=err?.message??String(err);el("evtError").classList.remove("hidden");}
  finally{showLoading(false);}
}

// 事件文件监听
el("evtHotelFile").addEventListener("change",(e)=>{const f=e.target.files?.[0];if(f){_handleEvtHotelFile(f);e.target.value="";}});
el("evtUserFile").addEventListener("change",(e)=>{const f=e.target.files?.[0];if(f){_handleEvtUserFile(f);e.target.value="";}});
el("evtViewMainChk").addEventListener("change",(e)=>{if(e.target.checked)setEvtViewMode("main");else if(evtViewMode==="main")setEvtViewMode("main");});
el("evtViewCompareChk").addEventListener("change",(e)=>{if(e.target.checked)setEvtViewMode("compare");else if(evtViewMode==="compare")setEvtViewMode("main");});
el("evtViewDiffChk").addEventListener("change",(e)=>{if(e.target.checked)setEvtViewMode("diff");else if(evtViewMode==="diff")setEvtViewMode("main");});
el("evtDiffMetricSelect").addEventListener("change",()=>{if(evtViewMode==="diff")renderDiffComparison();});
el("evtDiffModeSelect").addEventListener("change",()=>{if(evtViewMode==="diff")renderDiffComparison();});
el("evtUnderexpBtn")?.addEventListener("click",showUnderexposedModal);
el("evtApplyBtn").addEventListener("click",_applyEvtFilters);
el("evtCircle5Chk").addEventListener("change",updateEventCircleLayers);
el("evtCircle9Chk").addEventListener("change",updateEventCircleLayers);
el("evtCircle5Chk2").addEventListener("change",updateEventCircleLayers);
el("evtCircle9Chk2").addEventListener("change",updateEventCircleLayers);
el("evtPresetCanton").addEventListener("change",(e)=>{
  if(!e.target.checked)return;
  el("evtLat").value=String(EVT_PRESET_CANTON.lat);
  el("evtLon").value=String(EVT_PRESET_CANTON.lon);
});

// 跳转按钮
el("evtJumpBtn").addEventListener("click",()=>{
  const lat=parseFloat(el("evtLat").value),lon=parseFloat(el("evtLon").value);
  if(!isFinite(lat)||!isFinite(lon)){_showEvtMsg("请填写有效的纬度和经度。");return;}
  _evtLat=lat;_evtLon=lon;
  const sd=el("evtStart").value,ed=el("evtEnd").value;
  _evtStart=sd||null;_evtEnd=ed||null;
  placeEventJumpStar(lon,lat);
  map.flyTo({center:[lon,lat],zoom:10.5,speed:1.4});
  if(_rawUserRows)_applyEvtFilters();
});
el("evtJumpBtn2").addEventListener("click",()=>{
  const lat=parseFloat(el("evtLat2").value),lon=parseFloat(el("evtLon2").value);
  if(!isFinite(lat)||!isFinite(lon)){_showEvtMsg("请填写有效的纬度和经度（地点 2）。");return;}
  placeEventJumpStar2(lon,lat);
  map.flyTo({center:[lon,lat],zoom:10.5,speed:1.4});
});
// ============================================================
// end 热点事件分析
// ============================================================
el("mapSourceSelect").addEventListener("change",()=>{
  const v=el("mapSourceSelect").value;
  el("tdKeyWrap").style.display=v==="tianditu"?"block":"none";
  el("maptilerKeyWrap").style.display=v==="maptiler"?"block":"none";
});
function _applyMapStyle(src,tdKey,mtKey){
  localStorage.setItem("mapSource",src);localStorage.setItem("tdKey",tdKey);localStorage.setItem("maptilerKey",mtKey);
  map.setStyle(buildBaseStyle(src,tdKey,mtKey));
  map.once("styledata",()=>{hoverBound=false;clickBound=false;poorHoverBound=false;goodHoverBound=false;hlHoverBound=false;lhHoverBound=false;if(eventJumpStarMarker){try{eventJumpStarMarker.remove();}catch(e){}eventJumpStarMarker=null;}if(eventJumpStarMarker2){try{eventJumpStarMarker2.remove();}catch(e){}eventJumpStarMarker2=null;}if(_eventJumpStarLon!=null&&_eventJumpStarLat!=null)placeEventJumpStar(_eventJumpStarLon,_eventJumpStarLat);if(_eventJumpStarLon2!=null&&_eventJumpStarLat2!=null)placeEventJumpStar2(_eventJumpStarLon2,_eventJumpStarLat2);updateEventCircleLayers();if(cachedRows){if(evtViewMode==="diff")renderDiffComparison();else aggregateAndRender();}if(hlLayerActive)detectHlHexagons();if(lhLayerActive)detectLhHexagons();map.off('mousemove',TS_SD_FILL,_tsSdHoverHandler);map.off('mouseleave',TS_SD_FILL,_tsSdLeaveHandler);_tsBound=false;if(tsWeekMap)onMapReady(()=>{_ensureTsLayers();tsShowWeek(tsCurrentIdx);});});
}
el("applyMapBtn").addEventListener("click",()=>{
  const src=el("mapSourceSelect").value;
  const tdKey=el("tdKeyInput").value.trim();
  const mtKey=el("maptilerKeyInput").value.trim();
  if(src==="tianditu"&&!tdKey){_showEvtMsg("请输入天地图 token");return;}
  if(src==="maptiler"&&!mtKey){_showEvtMsg("请输入 MapTiler API Key");return;}
  _applyMapStyle(src,tdKey,mtKey);
});

// ============================================================
// 4 · 动态热力图（时序模式）
// ============================================================
let tsWeekMap=null,tsWeeks=[],tsCurrentIdx=0;
let tsPlaying=false,tsTimer=null,tsSpeed=1;
let _tsBound=false;

// 解析时序数据：按 Week 列分组
function _parseTsData(validRows){
  const map=new Map();
  for(const r of validRows){
    const w=String(r.Week||'').trim().toUpperCase();
    if(!/^W([1-9]|10)$/.test(w))continue;
    if(!map.has(w))map.set(w,[]);
    map.get(w).push(r);
  }
  const sorted=[...map.keys()].sort((a,b)=>parseInt(a.slice(1))-parseInt(b.slice(1)));
  return{map,sorted};
}

// 处理时序原始行（保留 Week 列）
function _processTsRawRows(allRows){
  if(!allRows||allRows.length<2)throw new Error('文件内容为空或仅含表头行。');
  const header=allRows[0];
  let weekIdx=-1;
  for(let i=0;i<header.length;i++){if(String(header[i]||'').trim().toLowerCase()==='week'){weekIdx=i;break;}}
  if(weekIdx===-1)throw new Error('未找到 Week 列（表头需包含 "Week"，内容为 W1–W10）。');
  const dataRows=allRows.slice(1);
  const valid=[];let skipped=0;
  for(const row of dataRows){
    if(!row||row.length===0){skipped++;continue;}
    const lonVal=safeNum(row[4]),latVal=safeNum(row[5]);
    if(lonVal===null||latVal===null||!isFinite(lonVal)||!isFinite(latVal)){skipped++;continue;}
    if(latVal<-90||latVal>90||lonVal<-180||lonVal>180){skipped++;continue;}
    const impVal=safeNum(row[1])??0,clkVal=safeNum(row[2])??0,ordVal=safeNum(row[3])??0;
    const starVal=safeNum(row[6])??0,listVal=safeNum(row[7])??0;
    const nameVal=row[8]!=null&&row[8]!==''?String(row[8]).trim():'';
    const gmvVal=safeNum(row[9])??0;
    const weekVal=weekIdx>=0?String(row[weekIdx]||'').trim().toUpperCase():'';
    const entry={id:row[0]??'',name:nameVal,lat:latVal,lon:lonVal,Week:weekVal};
    entry[IMP]=impVal;entry[CLK]=clkVal;entry[ORD]=ordVal;
    entry[STAR]=starVal;entry[LIST]=listVal;entry[GMV]=gmvVal;
    valid.push(entry);
  }
  return{valid,skipped};
}

// 构建平滑热力图 GeoJSON（曝光/点击/订单）
// 使用 log1p 归一化防止单一热点遮蔽其他区域：
//   weight = log(1+v) / log(1+max)
// 典型效果：原始比 1000:1 → log 压缩后 11.5:4.6（约 2.5:1），低值区域仍可见
function _buildTsHeatGeoJSON(rows,field){
  let maxLogW=0;
  for(const r of rows){const v=Math.log1p(Number(r[field])||0);if(v>maxLogW)maxLogW=v;}
  if(maxLogW===0)maxLogW=1;
  const features=rows.filter(r=>r.lat&&r.lon).map(r=>({
    type:'Feature',
    geometry:{type:'Point',coordinates:[r.lon,r.lat]},
    properties:{weight:Math.log1p(Number(r[field])||0)/maxLogW}
  }));
  return{type:'FeatureCollection',features};
}

// 构建供需 H3 六边形 GeoJSON
function _buildTsSDGeoJSON(rows,resolution){
  const agg=new Map();
  for(const r of rows){
    if(!r.lat||!r.lon)continue;
    const cell=h3Cell(r.lat,r.lon,resolution);
    const cur=agg.get(cell)||{imp:0,ord:0};
    cur.imp+=Number(r[IMP])||0;cur.ord+=Number(r[ORD])||0;
    agg.set(cell,cur);
  }
  const totalImp=[...agg.values()].reduce((s,v)=>s+v.imp,0);
  const totalOrd=[...agg.values()].reduce((s,v)=>s+v.ord,0);
  const features=[];
  for(const [cell,v] of agg){
    if(v.imp<5||totalImp===0||totalOrd===0)continue;
    const score=Math.log((v.ord/totalOrd)/(v.imp/totalImp))/Math.LN2;
    if(!Number.isFinite(score))continue;
    features.push({type:'Feature',properties:{score:Math.max(-4,Math.min(4,score))},geometry:{type:'Polygon',coordinates:[h3Boundary(cell)]}});
  }
  return{type:'FeatureCollection',features};
}

// SD hover 命名处理器（便于 map.off 移除，避免 style change 后重复绑定）
function _tsSdHoverHandler(e){
  if(!e.features?.length)return;
  const score=Number(e.features[0].properties.score);
  const label=score>0.3?'欠曝':score<-0.3?'过曝':'均衡';
  map.getCanvas().style.cursor='default';
  const popup=el('tsTooltip');
  if(popup){popup.style.display='block';popup.textContent=`供需：${label}（log₂ ${score.toFixed(2)}）`;}
}
function _tsSdLeaveHandler(){
  map.getCanvas().style.cursor='';
  const p=el('tsTooltip');if(p)p.style.display='none';
}

// 确保 TS 图层存在
function _ensureTsLayers(){
  if(!map.getSource(TS_HEAT_SRC)){
    map.addSource(TS_HEAT_SRC,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:TS_HEAT_LYR,type:'heatmap',source:TS_HEAT_SRC,paint:{
      'heatmap-weight':['get','weight'],
      'heatmap-radius':['interpolate',['linear'],['zoom'],7,12,10,28,13,52],
      'heatmap-intensity':['interpolate',['linear'],['zoom'],7,1.2,11,2,14,3.5],
      'heatmap-opacity':0.88,
      'heatmap-color':['interpolate',['linear'],['heatmap-density'],
        0,'rgba(255,255,255,0)',
        0.12,'rgba(255,245,235,0.5)',
        0.35,'rgba(255,175,100,0.72)',
        0.65,'rgba(220,50,25,0.88)',
        1,'rgba(160,0,0,1)']
    }});
  }
  if(!map.getSource(TS_SD_SRC)){
    map.addSource(TS_SD_SRC,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    const sdColor=['interpolate',['linear'],['get','score'],
      -4,'#1e3a8a',-2,'#1d4ed8',-1,'#60a5fa',
      -0.3,'#bfdbfe',0,'#f3f4f6',0.3,'#fecaca',
      1,'#f87171',2,'#dc2626',4,'#7f1d1d'];
    map.addLayer({id:TS_SD_FILL,type:'fill',source:TS_SD_SRC,paint:{'fill-color':sdColor,'fill-opacity':0.78}});
    map.addLayer({id:TS_SD_LINE,type:'line',source:TS_SD_SRC,paint:{'line-color':sdColor,'line-width':0.8,'line-opacity':0.7}});
  }
  if(!_tsBound){
    _tsBound=true;
    map.on('mousemove',TS_SD_FILL,_tsSdHoverHandler);
    map.on('mouseleave',TS_SD_FILL,_tsSdLeaveHandler);
  }
}

// 隐藏所有 TS 图层
function _hideTsLayers(){
  showLayer(TS_HEAT_LYR,false);
  showLayer(TS_SD_FILL,false);
  showLayer(TS_SD_LINE,false);
}

// 显示指定周
function tsShowWeek(idx){
  tsCurrentIdx=idx;
  const weekKey=tsWeeks[idx];
  const rows=tsWeekMap.get(weekKey);
  const metric=el('tsMetricSelect').value;
  const resolution=Number(el('resSelect').value)||8;
  el('tsScrubber').value=idx;
  el('tsWeekLabel').textContent=weekKey;
  el('tsWeekOverlay').textContent=weekKey;
  _ensureTsLayers();
  if(metric==='sd'){
    map.getSource(TS_SD_SRC).setData(_buildTsSDGeoJSON(rows,resolution));
    showLayer(TS_HEAT_LYR,false);showLayer(TS_SD_FILL,true);showLayer(TS_SD_LINE,true);
  }else{
    const fieldMap={imp:IMP,clk:CLK,ord:ORD};
    map.getSource(TS_HEAT_SRC).setData(_buildTsHeatGeoJSON(rows,fieldMap[metric]));
    showLayer(TS_HEAT_LYR,true);showLayer(TS_SD_FILL,false);showLayer(TS_SD_LINE,false);
  }
}

// 播放 / 暂停
function tsPlay(){
  if(tsPlaying)return;
  tsPlaying=true;el('tsPlayBtn').textContent='⏸';
  tsTimer=setInterval(()=>{tsShowWeek((tsCurrentIdx+1)%tsWeeks.length);},Math.round(1000/tsSpeed));
}
function tsPause(){
  if(!tsPlaying)return;
  tsPlaying=false;el('tsPlayBtn').textContent='▶';
  clearInterval(tsTimer);tsTimer=null;
}

// 处理时序文件上传
async function handleTsFile(file){
  el('tsMsgHint').textContent='解析中…';
  tsPause();
  try{
    const buf=await file.arrayBuffer();
    const allRows=await parseFileWithWorker(buf);
    const{valid,skipped}=_processTsRawRows(allRows);
    if(!valid.length)throw new Error('未找到有效数据行，请确认文件格式及 Week 列内容（W1–W10）。');
    const{map:wMap,sorted}=_parseTsData(valid);
    if(!sorted.length)throw new Error('Week 列未找到 W1–W10 格式内容。');
    tsWeekMap=wMap;tsWeeks=sorted;tsCurrentIdx=0;
    el('tsScrubber').max=sorted.length-1;el('tsScrubber').value=0;
    // 生成刻度标签
    const tickRow=el('tsTickRow');tickRow.innerHTML='';
    sorted.forEach(w=>{const s=document.createElement('span');s.className='ts-tick';s.textContent=w;tickRow.appendChild(s);});
    el('tsWeekLabel').textContent=sorted[0];
    el('tsWeekCount').textContent=`共 ${sorted.length} 周`;
    el('tsControlsWrap').classList.remove('hidden');
    el('tsMsgHint').textContent=`已加载 ${sorted.length} 周数据 ✓（跳过 ${skipped} 行无效）`;
    el('tsWeekOverlay').style.display='block';
    el('tsWeekOverlay').textContent=sorted[0];
    onMapReady(()=>{_ensureTsLayers();tsShowWeek(0);});
  }catch(err){el('tsMsgHint').textContent=`❌ ${err.message}`;}
}

// 事件绑定
el('tsUploadBtn').addEventListener('click',()=>el('tsFileInput').click());
el('tsFileInput').addEventListener('change',(e)=>{const f=e.target.files?.[0];if(f){handleTsFile(f);e.target.value='';}});
el('tsPlayBtn').addEventListener('click',()=>{tsPlaying?tsPause():tsPlay();});
el('tsScrubber').addEventListener('input',()=>{tsPause();tsShowWeek(Number(el('tsScrubber').value));});
el('tsMetricSelect').addEventListener('change',()=>{if(tsWeekMap)tsShowWeek(tsCurrentIdx);});
document.querySelectorAll('.ts-speed-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.ts-speed-btn').forEach(b=>b.classList.remove('ts-speed-active'));
    btn.classList.add('ts-speed-active');
    tsSpeed=parseFloat(btn.dataset.speed);
    if(tsPlaying){tsPause();tsPlay();}
  });
});
// ============================================================
// end 动态热力图
// ============================================================