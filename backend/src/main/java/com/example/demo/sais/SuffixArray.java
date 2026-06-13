package com.example.demo.sais;

import com.example.demo.experiments.data.TypeMap;
import com.example.demo.sais.dto.SaisResponseDto;
import com.example.demo.sais.dto.SortStepDto;
import com.example.demo.sais.dto.TypeMapDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
public class SuffixArray {

    private static String source;

    private final SaisResponseDto.SaisResponseDtoBuilder responseBuilder;

    public SuffixArray() {
        responseBuilder = SaisResponseDto.builder();
    }

    /**
     * Make a suffix array with LMS-substrings approximately right.
     */
    private int[] guessLmsSort(final int[] text, final int[] bucketSizes, final TypeMap typeMap, int alphabetSize, final boolean trackSteps) {
        // Create a suffix array with room for a pointer to every suffix of
        // the string, including the empty suffix at the end.
        final int[] guessedSuffixArray = new int[text.length];
        Arrays.fill(guessedSuffixArray, -1);

        final int[] bucketTails = findBucketTails(bucketSizes, alphabetSize);

        final List<SortStepDto> guessLmsSteps = new ArrayList<>();

        // Bucket-sort all the LMS suffixes into their appropriate bucket.
        IO.println("Sort all lms suffixes into appropriate bucket");
        for (int i = 0; i < text.length; i++) {
            if (!typeMap.isLmsChar(i)) {
                // Not the start of an LMS suffix
                continue;
            }

            // Which bucket does this suffix go into?
            int bucketIndex;
            bucketIndex = text[i];
            // Add the start position at the tail of the bucket...
            guessedSuffixArray[bucketTails[bucketIndex]] = i;
            if (trackSteps) {
                char c = (i < source.length()) ? source.charAt(i) : '$';
                IO.println(c + "(" + i + ")" + " -> " + bucketTails[bucketIndex]);
                showSuffixArray(guessedSuffixArray, bucketTails[bucketIndex]);
                guessLmsSteps.add(new SortStepDto(i, bucketTails[bucketIndex]));
            }
            // ... and move the tail pointer down.
            bucketTails[bucketIndex]--;

            // Show the current state of the array
//        showSuffixArray(guessedSuffixArray);
        }

        if (trackSteps) {
            responseBuilder.guessLmsSteps(guessLmsSteps);
        }

        return guessedSuffixArray;
    }

    private int[] findBucketSizes(final int[] text, final int alphabetSize) {
        final int[] res = new int[alphabetSize + 1];

        for (int c : text) {
            res[c]++;
        }

        return res;
    }

    int[] findBucketTails(final int[] bucketSizes, int alphabetSize) {
        int[] end = new int[alphabetSize + 1];
        int sum = 0;
        for (int i = 0; i <= alphabetSize; i++) {
            sum += bucketSizes[i];
            end[i] = sum - 1;
        }

        return end;
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

    private void showSuffixArray(final int[] arr) {
        for (int j : arr) {
            IO.print(String.format("%02d ", j));
        }
        IO.println();
    }

    /**
     * Slot L-Type suffixes into place
     *
     * @param text
     * @param guessedSuffixArray
     * @param bucketSizes
     * @param typeMap
     */
    private void induceSortL(final int[] text, final int[] guessedSuffixArray, final int[] bucketSizes, final TypeMap typeMap, final int alphabetSize, final boolean trackSteps, final boolean isGuess) {
        final int[] bucketHeads = findBucketHeads(bucketSizes, alphabetSize);

        final List<SortStepDto> induceLSteps = new ArrayList<>();

        IO.println("Inducing L-suffixes");
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

            if (typeMap.getType(j) != TypeMap.Type.L_TYPE) {
                // We're only interested in L-type suffixes right now.
                continue;
            }

            int bucketIndex;
//        if (test) {
            bucketIndex = text[j];
//        } else {
//            bucketIndex = source.charAt(j);
//        }
            // Add the start position at the head of the bucket...
            guessedSuffixArray[bucketHeads[bucketIndex]] = j;

            if (trackSteps) {
                char c = (j < source.length()) ? source.charAt(j) : '$';
                IO.println(c + "(" + j + ")" + " -> " + bucketHeads[bucketIndex]);
                showSuffixArray(guessedSuffixArray, bucketHeads[bucketIndex]);
                induceLSteps.add(new SortStepDto(j, bucketHeads[bucketIndex]));
            }

            // ...and move the head pointer up.
            bucketHeads[bucketIndex]++;

//        showSuffixArray(guessedSuffixArray, i);
        }

        if (trackSteps) {
            if (isGuess) {
                responseBuilder.guessInduceL(induceLSteps);
            } else {
                responseBuilder.saInduceL(induceLSteps);
            }
        }
    }

    private int[] findBucketHeads(final int[] bucketSizes, int alphabetSize) {
        int[] heads = new int[alphabetSize + 1];

        int sum = 0;
        for (int i = 0; i <= alphabetSize; i++) {
            heads[i] = sum;
            sum += bucketSizes[i];
        }

        return heads;
    }

    /**
     * Slot S-type suffixes into place
     */
    private void induceSortS(final int[] text, final int[] guessedSuffixArray, final int[] bucketSizes, final TypeMap typeMap, final int alphabetSize, final boolean trackSteps, final boolean isGuess) {
        final int[] bucketTails = findBucketTails(bucketSizes, alphabetSize);

        final List<SortStepDto> induceSSteps = new ArrayList<>();

        IO.println("Inducing S-suffixes");
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

            if (typeMap.getType(j) != TypeMap.Type.S_TYPE) {
                // We're only interested in S-type suffixes right now.
                continue;
            }

            // Which bucket does this suffix go into?
            int bucketIndex = text[j];
            // Add the start position at the tail of the bucket...
            guessedSuffixArray[bucketTails[bucketIndex]] = j;

            if (trackSteps) {
                char c = (j < source.length()) ? source.charAt(j) : '$';
                IO.println(c + "(" + j + ")" + " -> " + bucketTails[bucketIndex]);
                showSuffixArray(guessedSuffixArray, bucketTails[bucketIndex]);
                induceSSteps.add(new SortStepDto(j, bucketTails[bucketIndex]));
            }

            // ...and move the tail pointer down.
            bucketTails[bucketIndex]--;

//        showSuffixArray(guessedSuffixArray, i);
        }

        if (trackSteps) {
            if (isGuess) {
                responseBuilder.guessInduceS(induceSSteps);
            } else {
                responseBuilder.saInduceS(induceSSteps);
            }
        }
    }

    /**
     *
     * @param text    the source string
     * @param typemap typemap of source string
     * @param offsetA first offset
     * @param offsetB second offset
     * @return <code>true</code> if LMS substrings at offsetA and offsetB are equal.
     */
    private boolean lmsSubstringsAreEqual(final int[] text, final TypeMap typemap, final int offsetA, final int offsetB) {

        // disallow negative offsets
        if (offsetA < 0 || offsetB < 0) {
            return false;
        }

        // no other substring is equal to the empty suffix.
        if (offsetA == text.length || offsetB == text.length) {
            return false;
        }

        int i = 0;
        while (true) {
            final boolean aIsLms = typemap.isLmsChar(i + offsetA);
            final boolean bIsLms = typemap.isLmsChar(i + offsetB);

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

            if (text[i + offsetA] != text[i + offsetB]) {
                // we found a character difference, we're done
                return false;
            }

            i++;
        }
    }

    /**
     * Compute the suffix array of `string` with the SA-IS algorithm.
     *
     * @param text         the string for which to create the suffix array (never <code>null</code>)
     * @param alphabetSize the size of the alphabet
     * @return
     */
    private int[] sais(final int[] text, final int alphabetSize, final boolean trackSteps) {
        Objects.requireNonNull(text);
        if (alphabetSize < 0) {
            throw new IllegalArgumentException("alphabet size cannot be negative");
        }

        // Classify each character of the String as S-type of L-type
//    final char[] typeMapOld = buildTypeMap(string);
        final TypeMap typeMap = TypeMap.buildTypeMap(text);
        if (trackSteps) responseBuilder.typeMapDto(TypeMapDto.fromTypeMap(typeMap));

        /*
         * We'll be slotting suffixes into buckets according to what
         * character they start with, so let's precompute that info now.
         */
        final int[] bucketSizes = findBucketSizes(text, alphabetSize);
        if (trackSteps) responseBuilder.bucketSizes(bucketSizes);

        /*
         * Usa a simple bucket-sort to insert all the LMS suffixes into
         * approximately the right place of the suffix array
         */
        final int[] guessedSuffixArray = guessLmsSort(text, bucketSizes, typeMap, alphabetSize, trackSteps);

        /*
         * Slot all the other suffixes into guessedSuffixArray, by using induced sorting.
         * This may move the LMS suffixes around.
         */
        induceSortL(text, guessedSuffixArray, bucketSizes, typeMap, alphabetSize, trackSteps, true);
        induceSortS(text, guessedSuffixArray, bucketSizes, typeMap, alphabetSize, trackSteps, true);

        final int lmsCount = typeMap.getLmsCount();

        // lms suffixes in the sorted order
        final int[] lmsOrder = new int[lmsCount];
        int idx = 0;
        for (int pos : guessedSuffixArray) {
            if (pos >= 0 && typeMap.isLmsChar(pos)) {
                lmsOrder[idx++] = pos;
            }
        }

        // assign a names to lms substring
        final int[] lmsNames = new int[text.length];
        Arrays.fill(lmsNames, -1);
        int currentName = 0;
        // first lms substring always gets name 0.
        lmsNames[lmsOrder[0]] = 0;
        for (int i = 1; i < lmsCount; i++) {
            int a = lmsOrder[i - 1];
            int b = lmsOrder[i];

            boolean different = !lmsSubstringsAreEqual(text, typeMap, a, b);

            if (different) {
                currentName++;
            }

            lmsNames[b] = currentName;
        }

        // scan lms positions in text order, not suffix order.
        final int[] reduced = new int[lmsCount];
        final int[] lmsPositions = new int[lmsCount];
        idx = 0;
        for (int i = 0; i < text.length; i++) {
            if (typeMap.isLmsChar(i)) {
                reduced[idx] = lmsNames[i];
                lmsPositions[idx] = i;
                idx++;
            }
        }

        if (trackSteps) {
            IO.println("LMS Order\tName");
            for (int i = 0; i < lmsOrder.length; i++) {
                IO.println(lmsOrder[i] + " -> " + lmsNames[lmsOrder[i]]);
            }

            IO.println("names in text order");
            for (int i = 0; i < lmsPositions.length; i++) {
                IO.println(lmsPositions[i] + " -> " + lmsNames[lmsPositions[i]]);
            }

            IO.println("reduced text: " + Arrays.toString(reduced));
        }

        final int[] reducedSa;
        if (currentName + 1 == lmsCount) {
            reducedSa = new int[lmsCount];
            for (int i = 0; i < lmsCount; i++) {
                reducedSa[reduced[i]] = i;
            }
        } else {
            if (trackSteps) IO.println("Reduced sa with recursion");
            reducedSa = sais(reduced, currentName, false);
        }

        if (trackSteps) {
            IO.println("reduced suffix array: " + Arrays.toString(reducedSa));
            responseBuilder.lmsOrder(lmsOrder)
                    .lmsNames(lmsNames)
                    .lmsPositions(lmsPositions)
                    .reduced(reduced)
                    .reducedSorted(reducedSa);
        }

        final int[] result = new int[text.length];
        Arrays.fill(result, -1);

        final int[] bucketTails = findBucketTails(bucketSizes, alphabetSize);

        if (trackSteps) IO.println("final lms placement");
        for (int i = reducedSa.length - 1; i >= 0; i--) {
            int lmsIndex = reducedSa[i];

            if (lmsIndex >= lmsPositions.length) {
                continue;
            }

            int pos = lmsPositions[lmsIndex];
            int bucketIndex = text[pos];
            result[bucketTails[bucketIndex]] = pos;
            if (trackSteps) {
                char c = (pos < source.length()) ? source.charAt(pos) : '$';
                IO.println(c + "(" + pos + ")" + " -> " + bucketTails[bucketIndex]);
                showSuffixArray(result, bucketTails[pos]);
            }
            bucketTails[text[pos]]--;
        }

        if (trackSteps) responseBuilder.saLmsAdded(Arrays.copyOf(result, result.length));

        // * ...and once again, slot all the other suffixes into place with induced sorting.
        induceSortL(text, result, bucketSizes, typeMap, alphabetSize, trackSteps, false);
        induceSortS(text, result, bucketSizes, typeMap, alphabetSize, trackSteps, false);

        if (trackSteps) responseBuilder.sa(result);

        return result;
    }

    public int[] suffixArray(final String string) {
        source = string;
        final int[] text = new int[string.length() + 1];
        for (int i = 0; i < string.length(); i++) {
            text[i] = string.charAt(i) - 'a' + 1;
        }
        text[string.length()] = 0; // sentinel
        responseBuilder.source(string + "$");
        return sais(text, 27, true);
    }

    public SaisResponseDto getResponseData() {
        return responseBuilder.timestamp(System.currentTimeMillis()).build();
    }
}
