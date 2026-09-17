#!/usr/bin/env python3
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
APPROVED=ROOT/'data'/'approved'
allowed_topics={"math","knowledge","language","science","history","geography","technology","arts","english","religion","physical","civics","skills","finance","digitalSafety","digitalWallet","cyberSafety","aiLiteracy","greenTech","gymnasium","firstAid"}
allowed_grades={"kindergarten","primary-1","primary-2","primary-3","primary-4","primary-5","primary-6","gymnasium-1","gymnasium-2","gymnasium-3"}
errors=[]; rows=[]; ids=set()
for path in sorted(APPROVED.glob('*.json')):
    try: data=json.loads(path.read_text())
    except Exception as e: errors.append(f'{path}: invalid JSON: {e}'); continue
    if not isinstance(data,list): errors.append(f'{path}: root must be an array'); continue
    for n,q in enumerate(data,1):
        where=f'{path}:{n}'
        required=['id','topic','grade','language','unit','difficulty','prompt','choices','correct','explanation','source','status']
        for k in required:
            if k not in q: errors.append(f'{where}: missing {k}')
        if q.get('id') in ids: errors.append(f'{where}: duplicate id {q.get("id")}')
        ids.add(q.get('id'))
        if q.get('topic') not in allowed_topics: errors.append(f'{where}: invalid topic')
        if q.get('grade') not in allowed_grades: errors.append(f'{where}: invalid grade')
        if q.get('language') not in ('el','en'): errors.append(f'{where}: invalid language')
        ch=q.get('choices',[])
        if not isinstance(ch,list) or len(ch)!=4 or len(set(ch))!=4: errors.append(f'{where}: choices must be four distinct strings')
        if q.get('correct') not in ch: errors.append(f'{where}: correct answer not in choices')
        if q.get('status')!='approved': errors.append(f'{where}: non-approved record in approved directory')
        if q.get('source',{}).get('authority') not in ('Ινστιτούτο Εκπαιδευτικής Πολιτικής (ΙΕΠ)','Υπουργείο Παιδείας / ebooks.edu.gr'): errors.append(f'{where}: unsupported source authority')
        rows.append(q)
by_topic={t:sum(1 for q in rows if q.get('topic')==t) for t in sorted(allowed_topics)}
print(json.dumps({'files':len(list(APPROVED.glob('*.json'))),'questions':len(rows),'by_topic':by_topic,'errors':errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
