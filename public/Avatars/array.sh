#Just use following structure to store output of command into a variable:
var=$(command)
#For example:
var=$(echo 'hi')    #store hi into var

directoryNamesArray=("Beard" "Hairs" "Pants" "Shirt" "Shoes" "Head")
resultArrayNames=("beardNamesArray" "hairNamesArray" "pantsNamesArray" "shirtNamesArray" "shoesNamesArray" "headNamesArray")


#Reset result file
echo "" > meshNamesArray.txt

#iterate 
for((i=0;i<${#directoryNamesArray[@]};i++)); do
arr=($(ls ${directoryNamesArray[$i]}))   #store list of files into array

# iterate through array using a counter
echo "${resultArrayNames[$i]} = [" >> meshNamesArray.txt
for ((j=0; j<${#arr[@]}; j++)); do
    #do something to each element of array
    echo "\"${arr[$j]}\"," >> meshNamesArray.txt
done
echo "]" >> meshNamesArray.txt
done
