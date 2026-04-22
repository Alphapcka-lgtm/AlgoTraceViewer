private final char S_TYPE = 'S';
private final char L_TYPE = 'L';

void main() {
    String source = "cabbage";
    IO.println(naivelyMakeSuffixArray(source));
    showTypeMap(source);
    IO.println("=============================================");
    source = "rikki-tikki-tikka";
    showTypeMap(source);
    char[] typeMap = buildTypeMap(source);
    IO.println(lmsSubstringsAreEqual(source, typeMap, 1, 7));
    IO.println(lmsSubstringsAreEqual(source, typeMap, 1, 13));
    source = "cabbage";
    int[] bucketSizes = findBucketSizes(source);
    IO.println(Arrays.toString(bucketSizes));
    IO.println("filtered: " + Arrays.toString(Arrays.stream(bucketSizes).filter(i -> i != 0).toArray()));
    IO.println(findBucketHeads(bucketSizes));
    IO.println(findBucketTails(bucketSizes));
}

List<Integer> naivelyMakeSuffixArray(final String source) {
    final List<String> suffixes = new ArrayList<>();
    for (int i = 0; i < source.length() + 1; i++) {
        suffixes.add(source.substring(i));
    }
    IO.println(suffixes);
    Collections.sort(suffixes);
    IO.println(suffixes);

    final List<Integer> suffixArray = new ArrayList<>();
    for (final String suffix : suffixes) {
        int offset = source.length() - suffix.length();
        suffixArray.add(offset);
    }

    return suffixArray;
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

void showTypeMap(final String data) {
    IO.println(data);
    final char[] typeMap = buildTypeMap(data);
    IO.println(new String(typeMap));
    for (int i = 0; i < typeMap.length; i++) {
        if (isLmsChar(i, typeMap)) {
            IO.print('^');
        } else {
            IO.print(' ');
        }
    }
    IO.println();
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

/**
 *
 * @param source  the source string
 * @param typemap typemap of source string
 * @param offsetA first offset
 * @param offsetB second offset
 * @return <code>true</code> if LMS substrings at offsetA and offsetB are equal.
 */
boolean lmsSubstringsAreEqual(final String source, final char[] typemap, final int offsetA, final int offsetB) {

    // disallow negative offsets
    if (offsetA < 0 || offsetB < 0) {
        return false;
    }

    // no other substring is equal to the empty suffix.
    if (offsetA == source.length() || offsetB == source.length()) {
        return false;
    }

    int i = 0;
    while (true) {
        final boolean aIsLms = isLmsChar(i + offsetA, typemap);
        final boolean bIsLms = isLmsChar(i + offsetB, typemap);

        // if we've found the start of the next LMS substrings...
        if (i > 0 && aIsLms && bIsLms) {
            // ...then we made it all the way through our original LMS
            // substrings without finding a difference, so we can go home now
            return true;
        }

        if (aIsLms != bIsLms) {
            // we found the end of one LMS substring before we reached
            // the end of the other
            return false;
        }

        if (source.charAt(i + offsetA) != source.charAt(i + offsetB)) {
            // we found a character difference, we're done
            return false;
        }

        i++;
    }
}

int[] findBucketSizes(final String source) {
    return findBucketSizes(source, 256);
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

List<Integer> findBucketHeads(final int[] bucketSizes) {
    int offset = 1;
    final List<Integer> res = new ArrayList<>();
    for (int bucketSize : bucketSizes) {
        res.add(offset);
        offset += bucketSize;
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