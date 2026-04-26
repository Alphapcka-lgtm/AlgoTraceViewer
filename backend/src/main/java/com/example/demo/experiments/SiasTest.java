private final static int EXTENDED_ASCII_SIZE = 256;

private final static char S_TYPE = 'S';
private final static char L_TYPE = 'L';

void main() {
    int[] arr = new int[]{2, -1, 4};
    showSuffixArray(arr);
    showSuffixArray(arr, 2);
    IO.println(String.format("'a'=%d", (int) 'a'));
    IO.println(String.format("'%c'=%d", (char) ((short) 0), (int) ((char) 0)));

    String source = "cabbage";
    int[] cabbageBuckets = findBucketSizes(source);
    char[] cabbageTypes = buildTypeMap(source);
    int[] cabbageGuess = guessLmsSort(source, cabbageBuckets, cabbageTypes);

    IO.println(Arrays.toString(cabbageBuckets));
    IO.println(Arrays.toString(cabbageTypes));
    IO.println(Arrays.toString(cabbageGuess));
}

/**
 * Make a suffix array with LMS-substrings approximately right.
 */
int[] guessLmsSort(final String source, final int[] bucketSizes, final char[] typeMap) {
    // Create a suffix array with room for a pointer to every suffix of
    // the string, including the empty suffix at the end.
    final int[] guessedSuffixArray = new int[source.length() + 1];
    Arrays.fill(guessedSuffixArray, -1);

    final List<Integer> bucketTails = findBucketTails(bucketSizes);

    // Bucket-sort all the LMS suffixes into their appropriate bucket.
    for (int i = 0; i < source.length(); i++) {
        if (!isLmsChar(i, typeMap)) {
            // Not the start of an LMS suffix
            continue;
        }

        // Which bucket does this suffix go into?
        char bucketIndex = source.charAt(i);
        // Add the start position at the tail of the bucket...
        guessedSuffixArray[bucketTails.get(bucketIndex)] = i;
        // ... and move the tail pointer down.
        bucketTails.set(bucketIndex, bucketTails.get(bucketIndex) - 1);

        // Show the current state of the array
        showSuffixArray(guessedSuffixArray);
    }

    // The empty suffix is defined to be an LMS-substring, and we know
    // it goes at the front.
    guessedSuffixArray[0] = source.length();

    showSuffixArray(guessedSuffixArray);
    return guessedSuffixArray;
}

/**
 *
 * @param offset  the offset
 * @param typeMap the typemap
 * @return <code>true</code> if the character at offset is a left-most S-type.
 */
boolean isLmsChar(final int offset, final char[] typeMap) {
    if (offset <= 0 || offset >= typeMap.length) {
        return false;
    }

    if (typeMap[offset] == S_TYPE && typeMap[offset - 1] == L_TYPE) {
        return true;
    }

    return false;
}

char[] buildTypeMap(final String data) {
    final char[] res = new char[data.length() + 1];
    res[data.length()] = S_TYPE;

    if (data.isEmpty()) {
        return res;
    }

    res[data.length() - 1] = L_TYPE;

    for (int i = data.length() - 2; i > -1; i--) {
        if (data.charAt(i) > data.charAt(i + 1)) {
            res[i] = L_TYPE;
        } else if (data.charAt(i) == data.charAt(i + 1) && res[i + 1] == L_TYPE) {
            res[i] = L_TYPE;
        } else {
            res[i] = S_TYPE;
        }
    }

    return res;
}

int[] findBucketSizes(final String source) {
    return findBucketSizes(source, EXTENDED_ASCII_SIZE);
}

int[] findBucketSizes(final String source, final int alphabetSize) {
    final int[] res = new int[alphabetSize];

    for (char c : source.toCharArray()) {
        // use this so that 'a' is at the first place of the array
        res[c - 'a']++;
//        res[c]++;
    }

    return res;
}

List<Integer> findBucketTails(final int[] bucketSizes) {
    int offset = 1;
    final List<Integer> res = new ArrayList<>();
    for (int bucketSize : bucketSizes) {
        offset += bucketSize;
        res.add(offset - 1);
    }

    return res;
}


void showSuffixArray(final int[] arr, final int pos) {
    showSuffixArray(arr);

    for (int i = 0; i < arr.length; i++) {
        if (i == pos) {
            IO.print("^^ ");
        } else {
            IO.print("   ");
        }
    }
    IO.println();
}

void showSuffixArray(final int[] arr) {
    for (int j : arr) {
        IO.print(String.format("%02d ", j));
    }
    IO.println();
}