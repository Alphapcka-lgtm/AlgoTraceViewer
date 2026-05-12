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

//    IO.println(Arrays.toString(cabbageBuckets));
//    IO.println(Arrays.toString(cabbageTypes));
//    IO.println(Arrays.toString(cabbageGuess));

    IO.println("induce sort l");
    induceSortL(source, cabbageGuess, cabbageBuckets, cabbageTypes);
    IO.println("induce sort s");
    induceSortS(source, cabbageGuess, cabbageBuckets, cabbageTypes);

    IO.println("summary");
    SuffixArraySummary summary = summariseSuffixArray(source, cabbageGuess, cabbageTypes);
    IO.println(summary.summaryString);
    IO.println(summary.summaryAlphabetSize);
    IO.println(summary.summarySuffixOffsets);

    IO.println("make summary suffix array");
    int[] summarySuffixArray = makeSummarySuffixArray(summary.summaryString, summary.summaryAlphabetSize);
    showSuffixArray(summarySuffixArray);

    IO.println("accurate lms sort");
    int[] cabbageReal = accurateLMSSort(source, cabbageBuckets, cabbageTypes, summarySuffixArray, summary.summarySuffixOffsets);
    showSuffixArray(cabbageReal);

    IO.println(Arrays.toString(makeSuffixArrayByInducedSorting(source, 256)));
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
        /*
         * TODO: good idea to later make it more easily viewable for visualization
         *  but it currently results in wrong guesses
         */
        // use this so that 'a' is at the first place of the array
//        res[c - 'a']++;
        res[c]++;
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

/**
 * Slot L-Type suffixes into place
 *
 * @param source
 * @param guessedSuffixArray
 * @param bucketSizes
 * @param typeMap
 */
void induceSortL(final String source, final int[] guessedSuffixArray, final int[] bucketSizes, final char[] typeMap) {
    final List<Integer> bucketHeads = findBucketHeads(bucketSizes);

    for (int i = 0; i < guessedSuffixArray.length; i++) {
        if (guessedSuffixArray[i] == -1) {
            // No offset is recorded here.
            continue;
        }

        // We're interested in the suffix that begins to the left of the suffix this entry points at.
        int j = guessedSuffixArray[i] - 1;
        if (j < 0) {
            /*
             * This entry in the suffix array is the suffix that begins at the start
             * of the string, offset 0. Therefore, there is no suffix to the left of it,
             * and j is out of bounds of the typemap.
             */
            continue;
        }

        if (typeMap[j] != L_TYPE) {
            // We're only interested in L-type suffixes right now.
            continue;
        }

        char bucketIndex = source.charAt(j);
        // Add the start position at the head of the bucket...
        guessedSuffixArray[bucketHeads.get(bucketIndex)] = j;
        // ...and move the head pointer up.
        bucketHeads.set(bucketIndex, bucketHeads.get(bucketIndex) + 1);

        showSuffixArray(guessedSuffixArray, i);
    }
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

/**
 * Slot S-type suffixes into place
 */
void induceSortS(final String source, final int[] guessedSuffixArray, final int[] bucketSizes, final char[] typeMap) {
    final List<Integer> bucketTails = findBucketTails(bucketSizes);

    for (int i = guessedSuffixArray.length - 1; i > -1; i--) {
        int j = guessedSuffixArray[i] - 1;
        if (j < 0) {
            /*
             * This entry of the suffix array is the suffix that begins at the start
             * of the string, offset 0. Therefore, there is no suffix to the left of it,
             * and j is out of bounds of the typemap.
             */
            continue;
        }

        if (typeMap[j] != S_TYPE) {
            // We're only interested in S-type suffixes right now.
            continue;
        }

        // Which bucket does this suffix go into?
        char bucketIndex = source.charAt(j);
        // Add the start position at the tail of the bucket...
        guessedSuffixArray[bucketTails.get(bucketIndex)] = j;
        // ...and move the tail pointer down.
        bucketTails.set(bucketIndex, bucketTails.get(bucketIndex) - 1);

        showSuffixArray(guessedSuffixArray, i);
    }
}

/**
 * Construct a 'summary string' of the positions of LMS-substrings.
 */
SuffixArraySummary summariseSuffixArray(final String source, final int[] guessedSuffixArray, final char[] typeMap) {
    // We will use this array to store the names of LMS substring in the positions they appear in the original string
    final int[] lmsNames = new int[source.length() + 1];
    Arrays.fill(lmsNames, -1);

    // Keep track of what names we've allocated
    int currentName = 0;

    // Where in the original string was the last LMS suffix we checked?
    int lastLMSSuffixOffset = -1; // TODO: in python is None

    /*
     * We know that the first LMS-substring we'll see will always be the one
     * representing the empty suffix, and it will always be at position 0 of
     * suffixOffset
     */
    lmsNames[guessedSuffixArray[0]] = currentName;
    lastLMSSuffixOffset = guessedSuffixArray[0];

    showSuffixArray(lmsNames);

    // For each suffix in the suffix array...
    for (int i = 1; i < source.length(); i++) {
        // ...where does this suffix appear in the original string?
        int suffixOffset = guessedSuffixArray[i];

        // We only care about LMS suffixes.
        if (!isLmsChar(suffixOffset, typeMap)) {
            continue;
        }

        /*
         * If this LMS suffix starts with a different LMS substring
         * from the last suffix we looked at...
         */
        if (!lmsSubstringsAreEqual(source, typeMap, lastLMSSuffixOffset, suffixOffset)) {
            // ...then it gets a new name
            currentName++;
        }

        // Record the last suffix we looked at.
        lastLMSSuffixOffset = suffixOffset;

        /*
         * Store the name of this LMS suffix in lmsNames, in the same place
         * this suffix occurs in the original string.
         */
        lmsNames[suffixOffset] = currentName;
        showSuffixArray(lmsNames);
    }

    /*
     * Now lmsNames contains all the characters of the suffix string in the correct order,
     * but it also contains a lot of unused indexes we don't care about and which we want
     * to remove. We also take this opportunity to build summarySuffixOffsets, which tells
     * us which LMS-suffix each item in the summary string represents.
     * This will be important later.
     */
    final List<Integer> summarySuffixOffsets = new ArrayList<>();
    final List<Integer> summaryString = new ArrayList<>();
    for (int i = 0; i < lmsNames.length; i++) {
        int name = lmsNames[i];
        if (name == -1) {
            continue;
        }

        summarySuffixOffsets.add(i);
        summaryString.add(name);
    }

    /*
     * The alphabetically smallest character in the summary string is numbered zero,
     * so the total number of characters i our alphabet is one larger than the largest
     * numbered character.
     */
    int summaryAlphabetSize = currentName + 1;

    // return summaryString, summaryAlphabetSize, summarySuffixOffsets
    return new SuffixArraySummary(summaryString, summaryAlphabetSize, summarySuffixOffsets);
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

/**
 * Construct a sorted suffix array of the summary string.
 */
int[] makeSummarySuffixArray(final List<Integer> summaryString, final int summaryAlphabetSize) {
    if (summaryAlphabetSize == summaryString.size()) {
        /*
         * Every character of this summary string appears once and only once,
         * so we can make the suffix array with a bucket sort.
         */
        final int[] summarySuffixArray = new int[summaryString.size() + 1];
        Arrays.fill(summarySuffixArray, -1);

        // Always include the empty suffix at the beginning.
        summarySuffixArray[0] = summaryString.size();

        for (int i = 0; i < summaryString.size(); i++) {
            int y = summaryString.get(i);
            summarySuffixArray[y + 1] = i;
        }
        return summarySuffixArray;
    } else {
        // This summary string is a little more complex, so we'll have to use recursion
        return makeSummarySuffixArray(summaryString, summaryAlphabetSize);
    }
}

/**
 * Make a suffix array with LMS suffixes exactly right.
 *
 * @return
 */
int[] accurateLMSSort(final String string, final int[] bucketSizes, final char[] typeMap, final int[] summarySuffixArray, final List<Integer> summarySuffixOffsets) {
    // A suffix for every character, plus the empty suffix.
    final int[] suffixOffsets = new int[string.length() + 1];
    Arrays.fill(suffixOffsets, -1);

    /*
     * As before, we'll be adding suffixes to the ends of their respective buckets,
     * so to keep them in the right order we'll have to iterate through summarySuffixArray
     * in reverse order
     */
    final List<Integer> bucketTails = findBucketTails(bucketSizes);
    for (int i = summarySuffixArray.length - 1; i > 1; i--) {
        int stringIndex = summarySuffixOffsets.get(summarySuffixArray[i]);

        // Which bucket does this suffix go into?
        char bucketIndex = string.charAt(stringIndex);
        // Add the suffix at the tail of the bucket...
        suffixOffsets[bucketTails.get(bucketIndex)] = stringIndex;
        // ...and move the tail pointer down.
        bucketTails.set(bucketIndex, bucketTails.get(bucketIndex) - 1);
        showSuffixArray(suffixOffsets);
    }

    // Always include the empty suffix at the beginning
    suffixOffsets[0] = string.length();

    showSuffixArray(suffixOffsets);

    return suffixOffsets;
}

/**
 * Compute the suffix array of `string` with the SA-IS algorithm.
 *
 * @param string       the string for which to create the suffix array (never <code>null</code>)
 * @param alphabetSize the size of the alphabet
 * @return
 */
int[] makeSuffixArrayByInducedSorting(final String string, final int alphabetSize) {
    Objects.requireNonNull(string);
    if (alphabetSize < 0) {
        throw new IllegalArgumentException("alphabet size cannot be negative");
    }

    // Classify each character of the String as S-type of L-type
    final char[] typeMap = buildTypeMap(string);

    /*
     * We'll be slotting suffixes into buckets according to what
     * character they start with, so let's precompute that info now.
     */
    final int[] bucketSizes = findBucketSizes(string, alphabetSize);

    /*
     * Usa a simple bucket-sort to insert all the LMS suffixes into
     * approximately the right place of the suffix array
     */
    final int[] guessedSuffixArray = guessLmsSort(string, bucketSizes, typeMap);

    /*
     * Slot all the other suffixes into guessedSuffixArray, by using induced sorting.
     * This may move the LMS suffixes around.
     */
    induceSortL(string, guessedSuffixArray, bucketSizes, typeMap);
    induceSortS(string, guessedSuffixArray, bucketSizes, typeMap);

    // Create a new string that summarizes the relative order of LMS suffixes in the guessed suffix array
    final SuffixArraySummary summary = summariseSuffixArray(string, guessedSuffixArray, typeMap);

    // Make a sorted suffix array of the summary string.
    final int[] summarySuffixArray = makeSummarySuffixArray(summary.summaryString(), summary.summaryAlphabetSize());

    // Using the suffix array of the summary string, determine exactly where the LMS suffixes go in our final array.
    final int[] result = accurateLMSSort(string, bucketSizes, typeMap, summarySuffixArray, summary.summarySuffixOffsets);

    // * ...and once again, slot all the other suffixes into place with induced sorting.
    induceSortL(string, result, bucketSizes, typeMap);
    induceSortS(string, result, bucketSizes, typeMap);

    return result;
}

record SuffixArraySummary(List<Integer> summaryString, int summaryAlphabetSize, List<Integer> summarySuffixOffsets) {
}