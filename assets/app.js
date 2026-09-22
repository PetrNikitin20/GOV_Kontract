(() => {
const customers=["АО «Газпром нефть»","ПАО «Сбербанк»","ПАО «Роснефть»","ПАО «Лукойл»","ГК «Ростех»","ПАО «РЖД»","ПАО «МТС»","АО «Русал»","ГК «ВТБ»"];
const subjects=["Поставка оборудования","Строительные работы","ИТ-разработка","Консультационные услуги","Логистические услуги","Маркетинговые исследования","Обслуживание техники","Обучение персонала","Проектные работы","Научные исследования"];
const statuses=["В работе","Завершен","На паузе","Просрочен","На подписании"];
const features=["Дата контракта","Сводный индикатор компании","Стоимость поставленной продукции","Дата исполнения","Фактически поставлено","Иски в роли ответчика","Сумма исполнительных производств","Чистая прибыль","Уровень бюджета","Себестоимость продаж"];
let seed=20240922;
const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)];
const rub=n=>new Intl.NumberFormat("ru-RU").format(n)+" ₽";
const data=Array.from({length:120},(_,i)=>{
  let p=i<48?.70+rnd()*.25:i<84?.50+rnd()*.20:i<108?.30+rnd()*.20:.10+rnd()*.20;
  let risk=p>=.70?"Низкий":p>=.50?"Средний":p>=.30?"Высокий":"Критический";
  const price=Math.round((1+rnd()*49)*1e6);
  return {id:`CTR-2024-${String(i+1).padStart(5,"0")}`,name:`Контракт №${i+1}: ${pick(subjects).toLowerCase()}`,customer:pick(customers),subject:pick(subjects),price,status:pick(statuses),prob:p,risk,notice:`IZ-${Math.floor(1000+rnd()*9000)}`,method:pick(["Электронный аукцион","Конкурс","Запрос котировок","Единственный поставщик"]),funding:pick(["Федеральный бюджет","Региональный бюджет","Внебюджетные средства"]),manager:`Менеджер ${pick(["Иванов","Петров","Сидоров","Кузнецов","Смирнов"])}`,features:features.map(f=>[f,(rnd()*2-1)])};
});
const $=s=>document.querySelector(s);
let page=1; const pageSize=15;
function fillSelect(id,vals){const el=$(id);vals.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;el.appendChild(o)})}
fillSelect("#status",statuses);fillSelect("#risk",["Низкий","Средний","Высокий","Критический"]);fillSelect("#customer",customers);
function filtered(){
  let pmin=+$("#probMin").value/100,pmax=+$("#probMax").value/100,min=+$("#priceMin").value*1e6,max=+$("#priceMax").value*1e6,q=$("#search").value.toLowerCase(),status=$("#status").value,risk=$("#risk").value,cust=$("#customer").value;
  return data.filter(x=>x.prob>=Math.min(pmin,pmax)&&x.prob<=Math.max(pmin,pmax)&&x.price>=Math.min(min,max)&&x.price<=Math.max(min,max)&&(!status||x.status===status)&&(!risk||x.risk===risk)&&(!cust||x.customer===cust)&&(!q||[x.id,x.name,x.customer,x.subject].join(" ").toLowerCase().includes(q)));
}
function render(){
  const f=filtered();
  $("#probLabel").textContent=`${Math.min(+$("#probMin").value,+$("#probMax").value)}–${Math.max(+$("#probMin").value,+$("#probMax").value)}%`;
  $("#priceLabel").textContent=`${Math.min(+$("#priceMin").value,+$("#priceMax").value)}–${Math.max(+$("#priceMin").value,+$("#priceMax").value)}`;
  renderMetrics(f);renderBars(f);renderTable(f);
}
function renderMetrics(f){
  const avg=f.length?f.reduce((s,x)=>s+x.prob,0)/f.length:0,sum=f.reduce((s,x)=>s+x.price,0),crit=f.filter(x=>x.risk==="Критический"||x.risk==="Высокий").length;
  $("#metrics").innerHTML=[["Контрактов",f.length,"в текущей выборке"],["Средняя вероятность",(avg*100).toFixed(1)+"%","прогноз исполнения"],["Сумма контрактов",(sum/1e9).toFixed(2)+" млрд ₽","объём выборки"],["Повышенный риск",crit,`${f.length?Math.round(crit/f.length*100):0}% выборки`]].map(([a,b,c])=>`<div class="metric"><small>${a}</small><b>${b}</b><span class="delta">${c}</span></div>`).join("");
}
function makeBars(el,rows){
  const max=Math.max(1,...rows.map(r=>r[1]));
  el.innerHTML=rows.map(([k,v,label])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${label??v}</b></div>`).join("");
}
function renderBars(f){
  makeBars($("#riskChart"),["Низкий","Средний","Высокий","Критический"].map(k=>[k,f.filter(x=>x.risk===k).length]));
  makeBars($("#statusChart"),statuses.map(k=>{const a=f.filter(x=>x.status===k);const v=a.length?a.reduce((s,x)=>s+x.prob,0)/a.length:0;return[k,v,(v*100).toFixed(0)+"%"]}));
}
function renderTable(f){
  const pages=Math.max(1,Math.ceil(f.length/pageSize));page=Math.min(page,pages);const part=f.slice((page-1)*pageSize,page*pageSize);
  $("#contractsBody").innerHTML=part.map(x=>`<tr><td class="id">${x.id}</td><td>${x.name}</td><td>${x.customer}</td><td>${rub(x.price)}</td><td>${x.status}</td><td><span class="prob ${x.prob>=.7?"high":x.prob>=.5?"med":"low"}">${(x.prob*100).toFixed(0)}%</span></td><td><span class="pill risk-${x.risk}">${x.risk}</span></td><td><button class="btn" data-id="${x.id}">Подробнее</button></td></tr>`).join("")||'<tr><td colspan="8">Нет данных по выбранным фильтрам</td></tr>';
  $("#pageInfo").textContent=`Страница ${page} из ${pages} · ${f.length} контрактов`;$("#prevPage").disabled=page<=1;$("#nextPage").disabled=page>=pages;
  document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>openDetail(data.find(x=>x.id===b.dataset.id)));
}
function openDetail(x){
  const sorted=[...x.features].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,8);
  $("#dialogContent").innerHTML=`<span class="eyebrow">${x.id}</span><h2>${x.name}</h2><div class="detail-grid"><div class="detail"><small>Заказчик</small><b>${x.customer}</b></div><div class="detail"><small>Предмет</small><b>${x.subject}</b></div><div class="detail"><small>Цена</small><b>${rub(x.price)}</b></div><div class="detail"><small>Вероятность выполнения</small><b>${(x.prob*100).toFixed(1)}% · ${x.risk}</b></div><div class="detail"><small>Способ размещения</small><b>${x.method}</b></div><div class="detail"><small>Источник финансирования</small><b>${x.funding}</b></div><div class="detail"><small>Номер извещения</small><b>${x.notice}</b></div><div class="detail"><small>Ответственный</small><b>${x.manager}</b></div></div><div class="feature-list"><h3>Факторы, влияющие на прогноз</h3>${sorted.map(([k,v])=>`<div class="feature-row"><span>${k}</span><div class="feature-track"><div class="feature-fill" style="width:${Math.abs(v)*100}%"></div></div><b>${v.toFixed(2)}</b></div>`).join("")}</div>`;
  $("#contractDialog").showModal();
}
["probMin","probMax","priceMin","priceMax","status","risk","customer","search"].forEach(id=>$("#"+id).addEventListener(id==="search"?"input":"change",()=>{page=1;render()}));
$("#prevPage").onclick=()=>{page--;render()};$("#nextPage").onclick=()=>{page++;render()};$("#closeDialog").onclick=()=>$("#contractDialog").close();
$("#resetBtn").onclick=()=>{$("#probMin").value=10;$("#probMax").value=95;$("#priceMin").value=1;$("#priceMax").value=50;$("#status").value=$("#risk").value=$("#customer").value="";$("#search").value="";page=1;render()};
render();
})();