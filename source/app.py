import random
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Аналитика выполнения контрактов", page_icon="📈", layout="wide")
st.title("📈 Аналитика выполнения государственных контрактов")
st.caption("Демонстрационная система мониторинга и интеллектуального прогнозирования")

CUSTOMERS=["АО «Газпром нефть»","ПАО «Сбербанк»","ПАО «Роснефть»","ПАО «Лукойл»","ГК «Ростех»","ПАО «РЖД»","ПАО «МТС»","АО «Русал»","ГК «ВТБ»"]
SUBJECTS=["Поставка оборудования","Строительные работы","ИТ-разработка","Консультационные услуги","Логистические услуги","Маркетинговые исследования","Обслуживание техники","Обучение персонала","Проектные работы","Научные исследования"]
STATUSES=["В работе","Завершен","На паузе","Просрочен","На подписании"]

@st.cache_data
def sample(n=120):
    random.seed(42)
    rows=[]
    for i in range(n):
        p=random.uniform(.70,.95) if i<48 else random.uniform(.50,.70) if i<84 else random.uniform(.30,.50) if i<108 else random.uniform(.10,.30)
        risk="Низкий" if p>=.70 else "Средний" if p>=.50 else "Высокий" if p>=.30 else "Критический"
        start=datetime.now()-timedelta(days=random.randint(30,730))
        rows.append({"ID контракта":f"CTR-2024-{i+1:05d}","Наименование":f"Контракт №{i+1}: {random.choice(SUBJECTS).lower()}","Заказчик":random.choice(CUSTOMERS),"Предмет":random.choice(SUBJECTS),"Цена":random.randint(1_000_000,50_000_000),"Дата":start,"Статус":random.choice(STATUSES),"Вероятность":round(p,3),"Риск":risk})
    return pd.DataFrame(rows)

df=sample()
with st.sidebar:
    st.header("Фильтры")
    pr=st.slider("Вероятность",0.0,1.0,(0.10,0.95),0.01)
    pc=st.slider("Цена, млн ₽",1,50,(1,50))
    status=st.multiselect("Статус",STATUSES)
    risk=st.multiselect("Риск",["Низкий","Средний","Высокий","Критический"])
    customer=st.multiselect("Заказчик",CUSTOMERS)

f=df[df["Вероятность"].between(*pr) & df["Цена"].between(pc[0]*1_000_000,pc[1]*1_000_000)]
if status: f=f[f["Статус"].isin(status)]
if risk: f=f[f["Риск"].isin(risk)]
if customer: f=f[f["Заказчик"].isin(customer)]

c1,c2,c3,c4=st.columns(4)
c1.metric("Контрактов",len(f))
c2.metric("Средняя вероятность",f"{f['Вероятность'].mean():.1%}" if len(f) else "—")
c3.metric("Сумма",f"{f['Цена'].sum()/1e9:.2f} млрд ₽")
c4.metric("Повышенный риск",len(f[f["Риск"].isin(["Высокий","Критический"])]))

tab1,tab2=st.tabs(["📋 Реестр","📈 Аналитика"])
with tab1:
    q=st.text_input("Поиск")
    show=f
    if q:
        m=show.astype(str).apply(lambda col: col.str.contains(q,case=False,na=False)).any(axis=1)
        show=show[m]
    st.dataframe(show,hide_index=True,use_container_width=True)
with tab2:
    a,b=st.columns(2)
    with a:
        st.plotly_chart(px.histogram(f,x="Вероятность",nbins=15,title="Распределение вероятностей"),use_container_width=True)
    with b:
        rc=f["Риск"].value_counts()
        st.plotly_chart(px.pie(values=rc.values,names=rc.index,title="Уровни риска"),use_container_width=True)
    st.plotly_chart(px.scatter(f,x="Вероятность",y="Цена",color="Риск",hover_data=["ID контракта","Заказчик"],log_y=True),use_container_width=True)

st.info("Данные в демонстрации синтетические. Для промышленного контура требуется подключение реальных источников/API и обученных моделей.")
