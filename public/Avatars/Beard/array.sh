#Just use following structure to store output of command into a variable:
var=$(command)
#For example:
var=$(echo 'hi')    #store hi into var
arr=($(ls))   #store list of files into array

# iterate through array using a counter
echo "["
for ((i=0; i<${#arr[@]}; i++)); do
    #do something to each element of array
    echo "\"${arr[$i]}\","
done
echo "]"