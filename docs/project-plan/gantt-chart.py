import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as md
from datetime import date, timedelta
D=lambda m,d: date(2026,m,d)
tasks=[
 ('1. Team formation and topic selection', D(9,1), D(10,10), 'done', 'All'),
 ('2. Repository foundation', D(10,11), D(10,11), 'done', 'All'),
 ('3. Requirements (SRS)', D(10,11), D(10,12), 'done', 'All'),
 ('4. Test plan and test cases', D(10,12), D(10,13), 'done', 'All'),
 ('5. Architecture and design (SAD)', D(10,13), D(10,24), 'done', 'All'),
 ('6. Organization, backlog and board', D(10,20), D(10,27), 'done', 'Varun'),
 ('7. Sprint 0: scaffold, CI, database, Docker', D(10,28), D(10,30), 'done', 'All'),
 ('8. Sprint 1 (24 issues, 86 points)', D(10,30), D(11,4), 'done', 'All'),
 ('9. Sprint 2 (24 issues, 81 points)', D(11,5), D(11,10), 'done', 'All'),
 ('10. System testing (53 test cases)', D(11,10), D(11,12), 'done', 'All'),
 ('11. Project plan and final documents', D(11,10), D(11,20), 'plan', 'Varun'),
 ('12. Final report, presentation and demo', D(11,20), D(11,30), 'plan', 'All'),
]
miles=[('SRS v1.0',D(10,12)),('SAD v1.0',D(10,24)),('Sprint 1 review',D(11,4)),('Sprint 2 review, freeze',D(11,10))]
fig,ax=plt.subplots(figsize=(13,6.2))
for i,(n,s,e,st,o) in enumerate(tasks):
    y=len(tasks)-1-i; w=(e-s).days+1
    ax.barh(y,w,left=md.date2num(s),height=0.55,color='#1f3a5f' if st=='done' else '#9fb3c8',edgecolor='#1f3a5f')
    ax.text(md.date2num(e)+1.6,y,o,va='center',fontsize=8,color='#52606d')
for n,d in miles:
    x=md.date2num(d); ax.axvline(x,color='#b54708',lw=0.8,ls='--'); ax.text(x,len(tasks)-0.35,n,rotation=90,fontsize=7.5,color='#b54708',va='bottom',ha='right')
ax.set_yticks(range(len(tasks))); ax.set_yticklabels([t[0] for t in reversed(tasks)],fontsize=9)
ax.xaxis.set_major_locator(md.WeekdayLocator(byweekday=md.MO)); ax.xaxis.set_major_formatter(md.DateFormatter('%d %b'))
plt.setp(ax.get_xticklabels(),rotation=45,ha='right',fontsize=8)
ax.set_xlim(md.date2num(D(8,31)),md.date2num(D(12,5))); ax.set_ylim(-0.7,len(tasks)+1.6)
ax.grid(axis='x',color='#e4e7eb'); ax.set_axisbelow(True)
for s in ['top','right']: ax.spines[s].set_visible(False)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color='#1f3a5f',label='Done'),Patch(facecolor='#9fb3c8',edgecolor='#1f3a5f',label='Planned'),plt.Line2D([0],[0],color='#b54708',ls='--',label='Milestone')],loc='lower left',fontsize=8,frameon=False)
ax.set_title('EMS project schedule, Sep to Nov 2026 (weeks start on Monday)',fontsize=11,loc='left')
plt.tight_layout(); plt.savefig('gantt-chart.png',dpi=160)
