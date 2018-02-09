import sys
import h5py
import json

f = h5py.File(sys.argv[1], 'r')
d = {'id': sys.argv[1][-21:-3]}
for i in f.keys():
    d[i] = {}
    for j in f[i].keys():
        x = list()
        if i == 'analysis' and j == 'songs':
            continue
        if 'confidence' in j:
            continue
        #print(j)
        for k in range(len(f[i][j])):
            y = f[i][j][k]
            if y.__class__.__name__ == 'int32':
                y = str(y)
            if y.__class__.__name__ == 'void':
                z = [ a for a in y]
                if i == 'metadata':
                    j = 'song'
                    x = {'artist': z[9].decode('UTF-8'), 'artist_id': z[4].decode('UTF-8'), 'title': z[18].decode('UTF-8')}
                elif i == 'musicbrainz':
                    j = 'year'
                    x = str(z[1])
                continue
            elif y.__class__.__name__ == 'bytes_':
                y = y.decode('UTF-8')
            elif y.__class__.__name__ == 'ndarray':
                y = y.tolist()
            x.append(y)
        d[i][j] = x

sys.stdout.write(json.dumps(d))
