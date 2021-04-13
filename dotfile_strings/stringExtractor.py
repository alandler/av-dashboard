import os

here = os.path.dirname(os.path.abspath(__file__))
print(here)
filename = os.path.join(here, 'dt_policy_8.txt')
f = open(filename, "r")
s = ""
for line in f:
    s+=line.strip()+"\\n"
f.close()

filename = os.path.join(here, 'dt_policy_8_string.txt')
f = open(filename, "w")
f.write(s)
f.close()
