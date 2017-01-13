cd ./scripts
echo "bash ../s1_server.sh $2 /mnt/gpfs/Database/process/CNV/$1 $3 $1 /mnt/gpfs/Database/softs/CNV_V01" >"./wk_$1.sh"
qsub -cwd -l vf=6g ./wk_$1.sh