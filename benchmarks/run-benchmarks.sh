#!/bin/bash
if [ $# -ne 1 ]; then
	echo "usage: ./run-benchmarks.sh <src_file>"
	exit 1
fi
echo "opt disabled"
java -jar rhino/js.jar -opt -1 $1
echo "opt level 0"
java -jar rhino/js.jar -opt 0 $1
echo "opt level 9"
java -jar rhino/js.jar -opt 9 $1