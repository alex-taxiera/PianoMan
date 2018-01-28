import sys
import h5py
import json

f = h5py.File(sys.argv[1], 'r')
d = {}
for i in f.keys():
    d[i] = {}
    for j in f[i].keys():
        x = list()
        for k in range(len(f[i][j])):
            y = f[i][j][k]
            if y.__class__.__name__ == 'void':
                z = [ a for a in y]
                if i == 'metadata':
                    j = 'song'
                    z = {'artist': z[9].decode('UTF-8'), 'song_title': z[18].decode('UTF-8')}
                elif i == 'musicbrainz':
                    j = 'year'
                    z = str(z[1])
                else:
                    continue
                y = z
            elif y.__class__.__name__ == 'bytes_':
                y = y.decode('UTF-8')
            elif y.__class__.__name__ == 'ndarray':
                y = y.tolist()
            x.append(y)
        d[i][j] = x

sys.stdout.write(json.dumps(d))
