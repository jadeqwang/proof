import cv2, numpy as np, sys
K='/home/jade/Documents/proof/media/keyframes/office91/'
src=sys.argv[1]; dx=int(sys.argv[2]); dy=int(sys.argv[3]); ycut=int(sys.argv[4]); out=sys.argv[5]
a=cv2.imread(K+'BO1_v2.jpg').astype(np.float32); b=cv2.imread(K+src).astype(np.float32)
assert a.shape==b.shape, (a.shape,b.shape)
H,W=a.shape[:2]
d=np.abs(cv2.GaussianBlur(a,(0,0),3)-cv2.GaussianBlur(b,(0,0),3)).max(axis=2)
print('median diff',np.median(d),'p90',np.percentile(d,90))
m=(d>float(sys.argv[6]) if len(sys.argv)>6 else d>14).astype(np.uint8)*255
m[ycut:,:]=0
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((25,25),np.uint8))
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((15,15),np.uint8))
n,lab,st,cen=cv2.connectedComponentsWithStats(m)
big=1+np.argmax(st[1:,4]); m=(lab==big).astype(np.uint8)*255
cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); m=np.zeros_like(m); cv2.drawContours(m,cs,-1,255,-1)
print('hand bbox',st[big])
hsv=cv2.cvtColor(cv2.GaussianBlur(b,(0,0),2).astype(np.uint8),cv2.COLOR_BGR2HSV); print('hsv flesh',hsv[400,1300],'yellow',hsv[900,600],'shadow',hsv[640,1010]); yel=((hsv[...,0]>=int(sys.argv[7]))&(hsv[...,0]<=38)&(hsv[...,1]>70)).astype(np.uint8)*255; yel=cv2.morphologyEx(yel,cv2.MORPH_OPEN,np.ones((9,9),np.uint8)); m[yel>0]=0; m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((9,9),np.uint8)); n,lab,st,cen=cv2.connectedComponentsWithStats(m); big=1+np.argmax(st[1:,4]); m=(lab==big).astype(np.uint8)*255
m=cv2.dilate(m,np.ones((3,3),np.uint8)); m=cv2.GaussianBlur(m,(0,0),2.5).astype(np.float32)/255
M=np.float32([[1,0,dx],[0,1,dy]])
bs=cv2.warpAffine(b,M,(W,H),borderMode=cv2.BORDER_REPLICATE); ms=cv2.warpAffine(m,M,(W,H),borderValue=0)
sh=cv2.GaussianBlur(cv2.dilate((ms*255).astype(np.uint8),np.ones((21,21),np.uint8)),(0,0),14).astype(np.float32)/255; sh=cv2.warpAffine(sh,np.float32([[1,0,10],[0,1,16]]),(W,H)); sh[int(0.50*H):,:]*=0; a=a*(1-0.10*sh[...,None])
o=a*(1-ms[...,None])+bs*ms[...,None]
cv2.imwrite(out,o.astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,95])
cv2.imwrite(out.replace('.jpg','_view.jpg').replace(K,'/tmp/claude-1000/-home-jade-Documents-proof/7524669a-e042-40b2-bd26-146c5f54ad8a/scratchpad/sho/'),cv2.resize(o.astype(np.uint8),(1400,788),interpolation=cv2.INTER_AREA))
cv2.imwrite('/tmp/claude-1000/-home-jade-Documents-proof/7524669a-e042-40b2-bd26-146c5f54ad8a/scratchpad/sho/bo2mask.jpg',cv2.resize((m*255).astype(np.uint8),(700,394)))
