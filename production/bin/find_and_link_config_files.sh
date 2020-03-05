#!/bin/bash

DIR=$1

cd ${DIR};

FILES=$(find . -not \( -path ./node_modules -prune \) -name '*.example');

for F in $FILES; do
	LF=$(echo $F | sed 's/\.example//' | sed 's|^./||');
	echo ${LF};
	LDIR=$(dirname ${LF} | sed 's/${DIR}//' );

	if [ ! -e ${DEPLOYDIR}/shared/${LDIR} ]; then
		echo "creating ${DEPLOYDIR}/shared/${LDIR}";
		mkdir -p ${DEPLOYDIR}/shared/${LDIR}	
	fi

	rm -f ${LF};
	echo "linking ${LF} <-- ${DEPLOYDIR}/shared/${LF}"; 
	ln -s ${DEPLOYDIR}/shared/${LF} ${LF};
done