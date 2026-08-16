package com.example.demo.suffixArray;

import java.util.Arrays;

/**
 * Immutable class representing the S-type and L-type suffixes of the string.
 *
 * @author Michael Kerscher
 */
public class TypeMap {

    private final Type[] map;

    private TypeMap(final Type[] map) {
        this.map = map;
    }

    public static TypeMap buildTypeMap(final int[] text) {
        Type[] map = new Type[text.length];

        if (text.length == 1) {
            return new TypeMap(map);
        }

        map[text.length - 1] = Type.L_TYPE;

        for (int i = text.length - 2; i > -1; i--) {
            if (text[i] > text[i + 1]) {
                map[i] = Type.L_TYPE;
            } else if (text[i] == text[i + 1] && map[i + 1] == Type.L_TYPE) {
                map[i] = Type.L_TYPE;
            } else {
                map[i] = Type.S_TYPE;
            }
        }

        map[text.length - 1] = Type.S_TYPE;

        return new TypeMap(map);
    }

    public int length() {
        return map.length;
    }

    public Type getType(final int index) {
        return map[index];
    }

    public int getLmsCount() {
        int count = 0;
        for (int i = 0; i < map.length; i++) {
            if (isLmsChar(i)) count++;
        }
        return count;
    }

    /**
     * Indicates if the char at offset is a left-most S-type
     *
     * @param offset the offset of the char of the string
     * @return <code>true</code> if the character at offset is a left-most S-type
     */
    public boolean isLmsChar(final int offset) {
        if (offset <= 0 || offset >= length()) return false;

        return map[offset] == Type.S_TYPE && map[offset - 1] == Type.L_TYPE;
    }

    @Override
    public String toString() {
        var f = Arrays.stream(map).map(Type::getValue).toArray(Character[]::new);
        return Arrays.toString(f);
    }

    public enum Type {
        S_TYPE('S'),
        L_TYPE('L');

        private final char value;

        Type(char value) {
            this.value = value;
        }

        public char getValue() {
            return value;
        }
    }
}
