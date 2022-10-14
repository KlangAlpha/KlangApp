import sys
import os
while True:
    line = sys.stdin.readline()
    if "?" in line:
        print("mv " + line.strip() + " " + line.split('?')[0])
        os.system("mv " + line.strip() + " " + line.split('?')[0])

