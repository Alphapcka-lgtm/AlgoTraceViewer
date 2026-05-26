package com.example.demo.experiments.data;

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

    public static TypeMap buildTypeMap(final String string) {
        Type[] map = new Type[string.length() + 1];
        map[string.length()] = Type.S_TYPE;

        if (string.isEmpty()) {
            return new TypeMap(map);
        }

        map[string.length() - 1] = Type.L_TYPE;

        for (int i = string.length() - 2; i > -1; i--) {
            if (string.charAt(i) > string.charAt(i + 1)) {
                map[i] = Type.L_TYPE;
            } else if (string.charAt(i) == string.charAt(i + 1) && map[i + 1] == Type.L_TYPE) {
                map[i] = Type.L_TYPE;
            } else {
                map[i] = Type.S_TYPE;
            }
        }

        return new TypeMap(map);
    }

    public int length() {
        return map.length;
    }

    public Type getType(final int index) {
        return map[index];
    }

    /**
     * Indicates if the char at offset is a left-most S-type
     *
     * @param offset the offset of the char of the string
     * @return <code>true</code> if the character at offset is a left-most S-type
     */
    public boolean isLmsChar(final int offset) {
        if (offset < 0 || offset >= length()) return false;

        return map[offset] == Type.S_TYPE && map[offset - 1] == Type.L_TYPE;
    }

    public enum Type {
        S_TYPE('S'),
        L_TYPE('L');

        private final char value;

        Type(char value) {
            this.value = value;
        }
    }
}
