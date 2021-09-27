// 时间复杂度(n/2)*(logn)或者(n/2)*n(最坏的情况)
function quickSort(arr, left, right) {
    var len = arr.length,
        partitionIndex,
        left = typeof left != 'number' ? 0 : left,
        right = typeof right != 'number' ? len - 1 : right;

    if (left < right) {
        partitionIndex = partition(arr, left, right); // 找到基准值索引，并对数组进行分区
        quickSort(arr, left, partitionIndex-1);
        quickSort(arr, partitionIndex+1, right);
    }
    return arr;
}

function partition(arr, left ,right) {     // 分区操作
    var pivot = left,                      // 把数组中第一个值设定为基准值（pivot）
        index = pivot + 1;
    for (var i = index; i <= right; i++) {
        if (arr[i] < arr[pivot]) {
            swap(arr, i, index); // 值交换,把小于基准值的放左边
            index++;
        }        
    }
    swap(arr, pivot, index - 1);// 与基准值交换位置，确保基准值左侧一定是小于基准值
    return index-1; // 基准值的索引
}

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

var a = [5,2,3,4,23,33,22,1,6,7,8,9,10,1,333]

console.log(quickSort(a))