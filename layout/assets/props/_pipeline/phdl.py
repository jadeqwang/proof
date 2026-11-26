import json,sys,os,urllib.request
def get(u):
    r=urllib.request.Request(u,headers={'User-Agent':'proof-layout/1.0'}); return urllib.request.urlopen(r).read()
for aid,name in [a.split(':') for a in sys.argv[1:]]:
    f=json.loads(get(f'https://api.polyhaven.com/files/{aid}'))
    g=f['gltf']['1k']['gltf']; os.makedirs(name,exist_ok=True)
    open(f'{name}/{os.path.basename(g["url"])}','wb').write(get(g['url']))
    for rel,inc in g.get('include',{}).items():
        p=os.path.normpath(os.path.join(name,rel)); assert p.startswith(name+'/'); os.makedirs(os.path.dirname(p),exist_ok=True); open(p,'wb').write(get(inc['url']))
    info=json.loads(get(f'https://api.polyhaven.com/info/{aid}')); json.dump(info,open(f'{name}/ph_info.json','w'))
    print(name,'ok',info.get('authors'))
