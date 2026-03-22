void main() {
    final int[] arr = {6, 3, 2, -99, 4, 22, 88, 0, 0, 1, 34, 1};
    boolean change = false;
    for (int i = arr.length; i >= 1; i--) {
        for (int j = 0; j < i - 1; j++) {
            int x = arr[j];
            int y = arr[j + 1];
            if (x > y) {
                arr[j] = y;
                arr[j + 1] = x;
                change = true;
            }
        }
        if (!change) {
            break;
        }
        IO.println(Arrays.toString(arr));
        change = false;
    }
}