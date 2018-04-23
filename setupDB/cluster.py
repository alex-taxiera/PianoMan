import sys
import json
import numpy as np
from sklearn.cluster import MiniBatchKMeans

d = {}
k = MiniBatchKMeans(n_clusters=4000,max_iter=10,random_state=0,batch_size=20000).fit(np.array(json.load(open('data.json'))))
d['labels'] = k.labels_.tolist()
d['centers'] = k.cluster_centers_.tolist()
sys.stdout.write(json.dumps(d))
