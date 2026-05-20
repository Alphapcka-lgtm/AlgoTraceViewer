package EhrlichSwapsAlgorithm;

import java.awt.*;
import java.util.Arrays;
import java.util.stream.IntStream;
public class EAlg {
    static void main() {
        final int SIZE = 4;
        int[] a = IntStream.range(10, SIZE + 10).toArray(); //generates all permutations of the distinct elements a_0...a_n-1

        int[] b = IntStream.range(0, SIZE).toArray();
        int[] c = new int[SIZE]; //control table

        while (true) {
            System.out.println("a : " + Arrays.toString(a));
            System.out.println("b : " + Arrays.toString(b));
            System.out.println("c : " + Arrays.toString(c));
            System.out.println();
            int j = 1;

            int k = calcNextK(c, SIZE);

            if (k == SIZE) {
                System.out.println("Alle Permutationen wurden erzeugt....");
                return;
            }

            c[k - 1] += 1;
            System.out.println("Welche Position als nächstes mit Position 0 getauscht wird = b[k] = "+b[k]);
            System.out.println("=> es wurde "+ a[0] + " mit " + a[b[k]] + " getauscht");
            swap(a, 0, b[k]);


            k--;

            while (j < k) {
                swap(b, j, k);
                j++;
                k--;
            }
        }
    }

    public static int calcNextK(int[] c, int SIZE){
        int k=1;
        while (k == c[k - 1] && k < SIZE) {
            System.out.println("c[k - 1]= " + c[k - 1]);
            System.out.println("k= " + k);
            c[k - 1] = 0;
            k++;
        }
        return k;
    }
    public static void swap(int[] a, int i, int j) {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    public static long factorial(int number) {
        long result = 1;
        for (int factor = 2; factor <= number; factor++) {
            result *= factor;
        }
        return result;
    }
}