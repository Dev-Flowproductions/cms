/**
 * Normalizes text used in raster cover prompts for on-image headlines:
 * ordinary words use European sentence case; **acronyms** (including unknown ones)
 * render in ALL CAPS.
 *
 * Rule of thumb: alphabetic tokens of length 2–5 become ALL CAPS unless they are
 * common English / marketing words (blocklist). Tokens with 6+ letters are sentence case.
 * Mixed-case short tokens (e.g. Api, Seo) are treated as acronyms → ALL CAPS.
 */

/** Canonical spellings for digit/mixed forms (map wins over blocklist). */
const ACRONYM_BY_LOWER: Readonly<Record<string, string>> = {
  ai: "AI",
  ml: "ML",
  api: "API",
  seo: "SEO",
  aeo: "AEO",
  geo: "GEO",
  ux: "UX",
  ui: "UI",
  ar: "AR",
  vr: "VR",
  hr: "HR",
  pr: "PR",
  qa: "QA",
  cto: "CTO",
  ceo: "CEO",
  cfo: "CFO",
  cio: "CIO",
  cpo: "CPO",
  cmo: "CMO",
  coo: "COO",
  cms: "CMS",
  crm: "CRM",
  erp: "ERP",
  cta: "CTA",
  roi: "ROI",
  roas: "ROAS",
  kpi: "KPI",
  okr: "OKR",
  nlp: "NLP",
  llm: "LLM",
  llms: "LLMS",
  gpt: "GPT",
  gpu: "GPU",
  cdn: "CDN",
  ssl: "SSL",
  tls: "TLS",
  http: "HTTP",
  https: "HTTPS",
  json: "JSON",
  xml: "XML",
  sql: "SQL",
  aws: "AWS",
  gcp: "GCP",
  saas: "SAAS",
  iot: "IOT",
  nft: "NFT",
  dao: "DAO",
  defi: "DEFI",
  rag: "RAG",
  gdpr: "GDPR",
  soc: "SOC",
  iso: "ISO",
  sdk: "SDK",
  ide: "IDE",
  cli: "CLI",
  css: "CSS",
  html: "HTML",
  pdf: "PDF",
  csv: "CSV",
  cpu: "CPU",
  ram: "RAM",
  ssd: "SSD",
  hdd: "HDD",
  dns: "DNS",
  vpn: "VPN",
  lan: "LAN",
  wan: "WAN",
  wifi: "WIFI",
  nfc: "NFC",
  rfid: "RFID",
  oem: "OEM",
  smb: "SMB",
  sme: "SME",
  b2b: "B2B",
  b2c: "B2C",
  d2c: "D2C",
  c2c: "C2C",
  p2p: "P2P",
  mcp: "MCP",
  rpc: "RPC",
  jwt: "JWT",
  oauth: "OAUTH",
  oidc: "OIDC",
  sso: "SSO",
  mfa: "MFA",
  "2fa": "2FA",
  otp: "OTP",
  cve: "CVE",
  sla: "SLA",
  slo: "SLO",
  sli: "SLI",
  tldr: "TLDR",
  faq: "FAQ",
  eol: "EOL",
  eod: "EOD",
  yoy: "YOY",
  qbr: "QBR",
  rfc: "RFC",
  rfp: "RFP",
  rfi: "RFI",
  rfq: "RFQ",
  sku: "SKU",
  upc: "UPC",
  gtin: "GTIN",
  ean: "EAN",
  asn: "ASN",
};

/** 2–5 letter tokens that are normal words, not acronyms (lowercase keys). */
const COMMON_HEADLINE_WORDS: ReadonlySet<string>> = new Set(
  (
    "a,an,as,at,be,by,do,go,he,hi,if,in,is,it,me,my,no,of,on,or,ox,so,to,up,us,we,am,oh,ok,ah,eh,er," +
    "the,and,for,not,but,you,all,any,can,had,her,was,one,our,out,how,its,let,may,new,now,old,see,two," +
    "who,why,way,are,get,has,him,his,own,say,she,too,use,yes,yet,bad,big,did,few,got,ago,end,off,day," +
    "run,try,ask,buy,cut,eat,low,set,top,pay,win,won,per,via,own,age,air,art,bad,bay,big,bit,boy,bus," +
    "car,cop,cry,cup,cut,dad,dam,die,dig,dog,dry,ear,eat,egg,eye,fan,far,fat,fit,fix,fly,fog,fun,gap," +
    "gas,gay,gel,gem,gun,gut,guy,had,hair,half,hall,hand,hard,harm,hate,have,head,hear,heat,held,hell," +
    "help,here,hero,hide,high,hill,hint,hire,hold,hole,holy,home,hope,host,hour,huge,hung,hunt,hurt," +
    "idea,into,iron,item,jobs,join,jump,just,keep,kept,keys,kids,kind,knee,knew,know,lack,lady,laid," +
    "lake,land,last,late,lawn,lead,left,less,life,like,line,link,list,live,load,loan,lock,long,look," +
    "lord,lose,lost,loud,love,luck,made,mail,main,make,male,many,mark,mass,meal,mean,meat,meet,mere," +
    "mile,mind,mine,miss,mode,moon,more,most,move,much,must,name,near,neck,need,news,next,nice,nine," +
    "node,noon,note,noun,open,oral,over,pace,pack,page,paid,pair,palm,part,pass,past,path,peak,pick," +
    "pile,pink,pipe,plan,play,plot,plus,poem,poet,poll,pool,poor,port,pose,post,pour,pray,prep,prey," +
    "pull,pure,push,race,rain,rank,rate,read,real,rear,rest,rich,ride,ring,rise,risk,road,rock,role," +
    "roll,roof,room,root,rope,rose,rule,rush,safe,said,sake,sale,salt,same,sand,save,seat,seed,seek," +
    "seem,self,sell,sent,ship,shop,shot,show,shut,sick,side,sign,silk,sing,sink,site,size,skin,skip," +
    "slip,slow,snow,soft,soil,sold,some,song,soon,sort,soul,span,spot,stay,step,stop,such,suit,sure," +
    "swim,tail,take,tale,talk,tall,tank,tape,task,team,tear,teen,tell,tend,term,test,text,than,that," +
    "them,then,they,thin,this,thus,tide,tidy,tied,time,tiny,told,toll,tone,took,tool,tops,torn,tour," +
    "town,tree,trip,true,tube,tune,turn,twin,type,unit,upon,used,user,uses,vary,very,vote,wage,wait," +
    "wake,walk,wall,want,ward,warm,wash,wave,ways,weak,wear,week,well,went,were,west,what,when," +
    "whom,wide,wife,wild,will,wind,wine,wing,wire,wish,with,wood,word,work,worn,yard,year,yoga,your," +
    "zero,zone,zoom,able,also,area,army,away,back,bank,base,beam,bear,beat,bell,belt,bend,best,bill," +
    "bird,blow,blue,boat,body,bold,bond,book,boom,born,boss,both,bowl,bulk,burn,busy,cafe,cake,call," +
    "calm,came,camp,card,care,case,cash,cast,cave,cell,chat,chef,city,clay,clip,club,coal,coat,code," +
    "coin,cold,come,cook,cool,copy,cost,crew,crop,dark,data,date,dawn,days,deal,dean,debt,deck,deep," +
    "deny,desk,dial,diet,dirt,disc,dish,done,dose,down,draw,drew,drop,drug,dual,duke,dust,duty,each," +
    "earn,ease,east,edge,edit,else,even,ever,face,fact,fail,fair,fall,farm,fast,fate,fear,feed,feel," +
    "file,fill,film,find,fine,fire,firm,fish,five,flag,flat,flew,flip,flow,foam,folk,food,foot,form," +
    "fort,four,free,from,fuel,full,fund,gain,gave,gift,girl,give,glow,goal,goes,gold,golf,gone,good," +
    "gray,grew,grey,grow,half,hall,hand,hang,hard,harm,hate,have,head,hear,heat,held,help,here,hero," +
    "hide,high,hill,hint,hire,hold,hole,holy,home,hope,host,hour,huge,hunt,hurt,idea,inch,iron,item," +
    "join,jump,just,keep,kept,keys,kids,kind,knee,knew,know,lack,lady,laid,lake,land,last,late,lawn," +
    "lead,left,less,life,like,line,link,list,live,load,loan,lock,long,look,lord,lose,lost,loud,love," +
    "luck,made,mail,main,make,male,many,mark,mass,meal,mean,meat,meet,mere,mile,mind,mine,miss,mode," +
    "moon,more,most,move,much,must,name,near,neck,need,news,next,nice,nine,node,noon,note,noun,once," +
    "only,onto,open,oral,over,pace,pack,page,paid,pair,palm,part,pass,past,path,peak,pick,pile,pink," +
    "pipe,plan,play,plot,plus,poem,poet,poll,pool,poor,port,pose,post,pour,pray,prep,prey,pull,pure," +
    "push,race,rain,rank,rate,read,real,rear,rest,rich,ride,ring,rise,risk,road,rock,role,roll,roof," +
    "room,root,rope,rose,rule,rush,safe,said,sake,sale,salt,same,sand,save,seat,seed,seek,seem,self," +
    "sell,sent,ship,shop,shot,show,shut,sick,side,sign,silk,sing,sink,site,size,skin,skip,slip,slow," +
    "snow,soft,soil,sold,some,song,soon,sort,soul,span,spot,stay,step,stop,such,suit,sure,swim,tail," +
    "take,tale,talk,tall,tank,tape,task,team,tear,teen,tell,tend,term,test,text,than,that,them,then," +
    "they,thin,this,thus,tide,tidy,tied,time,tiny,told,toll,tone,took,tool,tops,torn,tour,town,tree," +
    "trip,true,tube,tune,turn,twin,type,unit,upon,used,user,uses,vary,very,vote,wage,wait,wake,walk," +
    "wall,want,ward,warm,wash,wave,ways,weak,wear,week,well,went,were,west,what,when,whom,wide,wife," +
    "wild,will,wind,wine,wing,wire,wish,with,wood,word,work,worn,yard,year,yoga,your,zero,zone,zoom," +
    "about,above,abuse,actor,adapt,added,admit,adult,after,again,agent,agree,ahead,alarm,album,alert," +
    "alike,alive,allow,alone,along,alter,among,anger,angle,angry,apart,apple,apply,arena,argue,arise," +
    "array,aside,asset,audio,audit,avoid,award,aware,badly,baker,bases,basic,beach,began,begin,begun," +
    "being,below,bench,billy,birth,black,blame,blank,blast,blind,block,blood,bloom,board,boost,booth," +
    "bound,brain,brand,brass,brave,bread,break,breed,brief,bring,broad,broke,brown,brush,built,buyer," +
    "cabin,cable,cache,carry,catch,cause,chain,chair,chalk,champ,chaos,chart,chase,cheap,check,chest," +
    "chief,child,chose,civil,claim,class,clean,clear,click,climb,clock,close,cloud,coach,coast,could," +
    "count,court,cover,crack,craft,crash,cream,crime,cross,crowd,crown,curve,cycle,daily,dance,dated," +
    "dealt,death,depth,doing,doubt,dozen,draft,drama,dream,dress,drill,drink,drive,drove,dying,eager," +
    "early,earth,eight,elect,elite,empty,ended,enemy,enjoy,enter,entry,equal,error,event,every,exact," +
    "exist,extra,fancy,fatal,fault,fiber,field,fifth,fifty,fight,final,first,flash,fleet,floor,fluid," +
    "focus,force,forth,found,frame,frank,fraud,fresh,front,fruit,fully,funds,giant,given,glass,globe," +
    "going,grace,grade,grain,grand,grant,grass,great,green,gross,group,grown,guard,guest,guide," +
    "habit,happy,harsh,heart,heavy,hello,hobby,house,human,humor,hurry,ideal,image,index,inner,input," +
    "issue,japan,jimmy,joint,jones,judge,known,label,large,laser,later,laugh,layer,learn,lease,least," +
    "leave,legal,level,light,limit,local,loose,lower,lucky,lunch,lying,magic,major,maker,march,maria," +
    "match,maybe,mayor,media,metal,might,minor,minus,mixed,model,money,month,moral,motor,mount,mouse," +
    "mouth,movie,music,needs,never,newly,night,ninth,noise,north,noted,novel,nurse,occur,ocean,offer," +
    "often,order,other,ought,paint,panel,paper,party,peace,phone,piece,pilot,pitch,place,plain,plane," +
    "plant,plate,point,porch,pound,power,press,price,pride,prime,print,prior,prior,proud,prove,quick," +
    "quiet,quite,radio,raise,rally,ranch,range,rapid,ratio,reach,ready,refer,relax,reply,rider,ridge," +
    "right,rigid,rival,river,robin,rough,round,route,royal,rural,scale,scene,scope,score,sense,serve," +
    "seven,shall,shape,share,sharp,sheet,shelf,shell,shift,shirt,shock,shoot,short,shown,sight,since," +
    "sixth,sixty,sized,skill,sleep,slide,slope,small,smart,smile,smith,solid,solve,sorry,sound,south," +
    "space,spare,speak,speed,spend,split,spoke,sport,staff,stage,stake,stand,start,state,steam,steel," +
    "stick,still,stock,stone,stood,store,storm,story,strip,stuck,study,stuff,style,sugar,super,sweet," +
    "table,taken,taste,taxes,teach,teams,tears,terms,thank,their,theme,there,these,thick,thing,think," +
    "third,those,three,threw,throw,tight,times,tired,title,today,topic,total,touch,tough,tower,track," +
    "trade,train,treat,trend,trial,tried,tries,troop,truck,truly,trust,truth,twice,under,undue,union," +
    "until,upper,upset,urban,usage,usual,valid,value,video,vital,voice,waste,watch,water,wheel,where," +
    "which,while,white,whole,whose,woman,women,world,worry,worse,worst,worth,would,wound,write," +
    "wrong,wrote,young,youth,brand,sales,leads,guide,tools,trends,posts,pages,teams,users,first," +
    "every,never,could,would,should,their,there,these,which,while,where,whose,being,below,between," +
    "beyond,budget,choose,client,closed,course,custom,demand,design,detail,direct,domain,driven," +
    "during,effect,effort,empire,enable,energy,engage,engine,enough,escape,estate,expand,expect," +
    "expert,export,extend,factor,family,famous,fasten,filter,finish,future,garden,gender,growth," +
    "health,height,hidden,impact,income,inside,insure,intent,island,jacket,junior,leader,letter," +
    "likely,linear,listen,little,locate,longer,lovely,lowest,margin,market,matter,member,memory," +
    "method,middle,mobile,modern,moment,moving,native,nature,nearly,notice,number,object,online," +
    "option,origin,output,parent,people,period,please,prefer,pretty,public,reason,region,report," +
    "result,return,reveal,review,rhythm,rising,school,search,second,secure,select,senior,series," +
    "server,simple,simply,single,social,socket,solution,someone,spring,square,stable,status,stream," +
    "street,string,strong,studio,submit,summer,survey,switch,symbol,system,target,ticket,toward," +
    "travel,treaty,tunnel,unique,unless,update,useful,valley,vector,vendor,verify,versus,victim," +
    "vision,visual,volume,window,winter,wisdom,within,wonder,worker,writer,yellow,action,before," +
    "better,beyond,binary,bottom,bright,broken,browse,budget,button,camera,campus,cancel,carbon," +
    "career,center,chance,change,charge,choice,choose,chosen,circle,clause,client,closed,closer," +
    "coffee,column,coming,common,copper,corner,costly,county,couple,course,covert,create,credit," +
    "crisis,custom,cycle,damage,danger,dealer,degree,deliver,demand,depend,desert,design,detail," +
    "detect,device,dialog,dinner,direct,dollar,double,driver,during,easily,editor,effect,effort," +
    "either,eleven,emerge,empire,enable,energy,engine,enough,escape,estate,ethics,evenly,exceed," +
    "except,excess,expand,expect,expert,export,extend,fabric,facing,factor,failed,fairly,family," +
    "famous,father,fellow,female,figure,finger,finish,fisher,flight,follow,forest,forget,formal," +
    "format,former,foster,fourth,friend,front,future,garden,gather,gender,gentle,gently,global," +
    "golden,govern,ground,growth,guitar,hammer,handle,happen,hardly,health,height,hidden,hockey," +
    "holder,hollow,honest,horror,hospital,hotels,hourly,hunter,impact,import,income,indeed,indoor," +
    "inform,injury,inside,insist,intact,intent,invest,island,jacket,junior,keeper,killer,ladder," +
    "lately,latter,launch,lawsuit,leader,league,legacy,lesson,letter,likely,linear,little,locate," +
    "longer,lovely,lowest,lumber,mainly,manage,manner,manual,marble,margin,market,master,matter," +
    "medium,member,memory,mental,method,middle,minute,mirror,mobile,modern,modest,moment,morning," +
    "mostly,mother,motion,moving,murder,museum,music,mystery,narrow,nation,native,nature,nearly," +
    "needle,neighbor,neither,nelson,nephew,nervous,never,night,nimble,ninety,ninth,nobody,noise," +
    "normal,notice,novel,nuclear,number,object,obtain,office,online,option,orange,origin,output," +
    "oxygen,packet,palace,parent,partly,passed,pastor,patchy,patent,people,period,permit,petrol," +
    "phrase,picked,picture,pillow,pirate,placed,planet,player,please,plenty,pocket,poetry,police," +
    "policy,prefer,pretty,priest,prince,prison,profit,prompt,proper,public,purple,pursue,puzzle," +
    "quarter,quiet,rabbit,racial,radius,random,rarely,rather,reader,really,reason,recall,recent," +
    "record,reduce,refer,reflex,reform,regard,region,reject,relief,remain,remedy,remote,remove," +
    "repair,repeat,report,rescue,resort,result,retail,return,reveal,review,revise,rhythm,riding," +
    "rising,rocket,roller,rubber,ruling,safety,salary,sample,saving,scared,scheme,school,screen," +
    "search,season,second,secret,sector,secure,select,seller,senior,sensor,series,server,settle," +
    "severe,shadow,shared,sheep,shelf,shell,shield,shirts,shorts,should,shower,silent,silver," +
    "simple,simply,singer,single,sister,sitcom,sixths,sketch,skills,slight,slowly,smooth,soccer," +
    "social,socket,sodium,solar,solid,solved,sorted,sought,sound,source,speech,speed,spend,spider," +
    "spirit,splash,split,sponge,spring,square,stable,status,steady,steam,steel,stick,still,stock," +
    "stone,stood,store,storm,story,strain,strait,straw,stream,street,stress,strict,stride,strike," +
    "string,strip,stuck,studio,stupid,sturdy,submit,sudden,suffer,sugar,summer,sunday,sunset," +
    "super,survey,sweet,swing,switch,symbol,system,tablet,tackle,tailor,taking,talent,target," +
    "taught,temple,tenant,tender,tennis,thanks,themes,theory,thirty,though,thread,threat,throat," +
    "ticket,timber,timing,tissue,titles,today,toddler,toggle,tomato,tongue,tonight,topics,torque," +
    "toward,tower,toxic,traced,tracks,trade,tragic,trails,trains,traits,travel,treaty,trendy," +
    "trials,tribal,tricky,triple,trophy,trough,trucks,trusty,trying,tunnel,turtle,twelve,twenty," +
    "typing,unable,uncle,under,unfair,union,unique,unless,unlike,unlock,unpaid,until,unveil," +
    "update,uphill,upload,upside,uptime,upward,urgent,useful,vacant,vacuum,valley,vanish,vendor," +
    "verify,versus,victim,victor,video,viking,violet,virtue,vision,visual,volume,voyage,waiver," +
    "waiter,waking,walker,wallop,wallet,wander,wanted,warmer,warned,warped,washed,wasted,watery," +
    "weaken,weaver,webcam,wedding,weekly,weight,weirdo,welded,welcome,welfare,western,wetland," +
    "whales,wheat,whilst,whisky,white,whoever,wholly,wicked,widely,widest,widows,widths,wifely," +
    "wildly,window,winner,winter,wiping,wisdom,wisely,wished,wishes,within,wizard,wobble,woman," +
    "wonder,wooden,worded,worker,world,wormed,worry,worse,worst,worth,would,wound,woven,writer," +
    "yellow,yearly,young,youth,zoning"
  )
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
);

function caseCore(core: string): string {
  if (!core) return core;
  const lower = core.toLowerCase();
  const mapped = ACRONYM_BY_LOWER[lower];
  if (mapped) return mapped;

  if (core === core.toUpperCase() && /^[A-Z0-9]{2,12}$/.test(core)) {
    return core;
  }

  const lettersOnly = /^[a-zA-Z]+$/.test(core);
  const lettersAndDigits = /^[a-zA-Z0-9]+$/.test(core);

  if (lettersOnly && core.length >= 6) {
    return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
  }

  if (lettersOnly && core.length >= 2 && core.length <= 5) {
    const hasMixedCase = core !== lower && core !== core.toUpperCase();
    if (hasMixedCase) {
      return core.toUpperCase();
    }
    if (COMMON_HEADLINE_WORDS.has(lower)) {
      return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
    }
    return core.toUpperCase();
  }

  if (lettersAndDigits && core.length >= 2 && core.length <= 8) {
    return core.toUpperCase();
  }

  return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

function applyToken(token: string): string {
  if (!token) return token;
  return token.split("-").map((seg) => applySegment(seg)).join("-");
}

function applySegment(segment: string): string {
  const m = segment.match(/^([^A-Za-z0-9]*)([A-Za-z0-9][A-Za-z0-9']*)([^A-Za-z0-9]*)$/);
  if (!m) return segment;
  const [, pre, core, post] = m;
  return pre + caseCore(core) + post;
}

/**
 * Applies per-word rules for the string embedded in the image prompt.
 * Hyphenated compounds split on `-` so each part is cased independently.
 */
export function applyCoverHeadlineCasing(headline: string): string {
  const t = headline.trim();
  if (!t) return t;
  return t.split(/\s+/).map(applyToken).join(" ");
}
