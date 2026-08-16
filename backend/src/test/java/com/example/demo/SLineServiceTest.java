package com.example.demo;

import com.example.demo.closestPair.Point;
import com.example.demo.closestPair.PointPair;
import com.example.demo.closestPair.SweepLineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
//KI generierte Tests
class SLineServiceTest {

    private static final double EPSILON = 1e-9;

    private SweepLineService service;

    @BeforeEach
    void setUp() {
        service = new SweepLineService();
    }

    /*
     * Diese Methode an deinen Point-Konstruktor anpassen.
     *
     * Zum Beispiel:
     * return new Point(id, id, x, y);
     * return new Point(x, y, id, id);
     * return new Point(id, x, y, id);
     */
    private static Point p(String id, int x, int y) {
        return new Point(x, y, id, id);
    }

    private PointPair solve(Point... points) {
        return service.nearestPair(List.of(points));
    }

    private PointPair solve(List<Point> points) {
        return service.nearestPair(points);
    }

    private static double distance(Point p1, Point p2) {
        return SweepLineService.euclideanDistance(p1, p2);
    }

    /**
     * Prüft das Ergebnis, ohne eine bestimmte Reihenfolge des Punktepaares
     * vorauszusetzen.
     */
    private static void assertResult(
            PointPair result,
            double expectedDistance,
            Point expectedP1,
            Point expectedP2
    ) {
        assertNotNull(result);
        assertNotNull(result.p0());
        assertNotNull(result.p1());

        assertEquals(expectedDistance, result.distance(), EPSILON);

        boolean correctPair =
                result.p0().equals(expectedP1)
                        && result.p1().equals(expectedP2)
                        ||
                        result.p0().equals(expectedP2)
                                && result.p1().equals(expectedP1);

        assertTrue(
                correctPair,
                () -> "Expected pair "
                        + expectedP1.label() + " / " + expectedP2.label()
                        + ", but got "
                        + result.p0().label() + " / " + result.p1().label()
        );

        assertEquals(
                distance(result.p0(), result.p1()),
                result.distance(),
                EPSILON,
                "Stored distance does not match the returned points"
        );
    }

    /**
     * Für Fälle mit mehreren gleich guten Punktepaaren sollte nur die
     * minimale Distanz geprüft werden.
     */
    private static void assertMinimumDistance(
            PointPair result,
            double expectedDistance,
            List<Point> input
    ) {
        assertNotNull(result);
        assertNotNull(result.p0());
        assertNotNull(result.p1());

        assertEquals(expectedDistance, result.distance(), EPSILON);

        assertTrue(input.contains(result.p0()));
        assertTrue(input.contains(result.p1()));
        assertNotEquals(result.p0(), result.p1());

        assertEquals(
                distance(result.p0(), result.p1()),
                result.distance(),
                EPSILON
        );
    }

    // ---------------------------------------------------------------------
    // Ungültige Eingaben
    // ---------------------------------------------------------------------

    @Test
    void nullListThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.nearestPair(null)
        );

        assertEquals(
                "There must be at least two points",
                exception.getMessage()
        );
    }

    @Test
    void emptyListThrowsException() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.nearestPair(List.of())
        );
    }

    @Test
    void onePointThrowsException() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.nearestPair(
                        List.of(p("A", 1, 1))
                )
        );
    }

    // ---------------------------------------------------------------------
    // Minimale Eingaben
    // ---------------------------------------------------------------------

    @Test
    void exactlyTwoHorizontalPoints() {
        Point a = p("A", 0, 0);
        Point b = p("B", 5, 0);

        PointPair result = solve(a, b);

        assertResult(result, 5.0, a, b);
    }

    @Test
    void exactlyTwoVerticalPoints() {
        Point a = p("A", 3, -2);
        Point b = p("B", 3, 4);

        PointPair result = solve(a, b);

        assertResult(result, 6.0, a, b);
    }

    @Test
    void exactlyTwoDiagonalPoints() {
        Point a = p("A", 0, 0);
        Point b = p("B", 3, 4);

        PointPair result = solve(a, b);

        assertResult(result, 5.0, a, b);
    }

    @Test
    void exactlyTwoPointsWithNegativeCoordinates() {
        Point a = p("A", -5, -7);
        Point b = p("B", -2, -3);

        PointPair result = solve(a, b);

        assertResult(result, 5.0, a, b);
    }

    // ---------------------------------------------------------------------
    // Normale Fälle
    // ---------------------------------------------------------------------

    @Test
    void findsClosestPairAmongThreePoints() {
        Point a = p("A", 0, 0);
        Point b = p("B", 10, 10);
        Point c = p("C", 2, 1);

        PointPair result = solve(a, b, c);

        assertResult(result, Math.sqrt(5), a, c);
    }

    @Test
    void closestPairIsAtBeginningOfXOrder() {
        Point a = p("A", 0, 0);
        Point b = p("B", 1, 1);
        Point c = p("C", 20, 20);
        Point d = p("D", 40, 40);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), a, b);
    }

    @Test
    void closestPairIsInMiddleOfXOrder() {
        Point a = p("A", 0, 0);
        Point b = p("B", 10, 20);
        Point c = p("C", 11, 21);
        Point d = p("D", 30, 0);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), b, c);
    }

    @Test
    void closestPairIsAtEndOfXOrder() {
        Point a = p("A", 0, 0);
        Point b = p("B", 20, 20);
        Point c = p("C", 50, 50);
        Point d = p("D", 51, 50);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, c, d);
    }

    @Test
    void inputDoesNotNeedToBeSorted() {
        Point a = p("A", 100, 100);
        Point b = p("B", 1, 1);
        Point c = p("C", 0, 0);
        Point d = p("D", -50, 80);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), b, c);
    }

    @Test
    void handlesAllPointsOnHorizontalLine() {
        Point a = p("A", 0, 4);
        Point b = p("B", 10, 4);
        Point c = p("C", 13, 4);
        Point d = p("D", 30, 4);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 3.0, b, c);
    }

    @Test
    void handlesAllPointsOnVerticalLine() {
        Point a = p("A", 5, -20);
        Point b = p("B", 5, 4);
        Point c = p("C", 5, 7);
        Point d = p("D", 5, 100);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 3.0, b, c);
    }

    @Test
    void handlesMixedPositiveAndNegativeCoordinates() {
        Point a = p("A", -10, -10);
        Point b = p("B", -3, 5);
        Point c = p("C", -2, 6);
        Point d = p("D", 20, -8);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), b, c);
    }

    // ---------------------------------------------------------------------
    // Fälle, die für Sweep Line besonders wichtig sind
    // ---------------------------------------------------------------------

    @Test
    void findsPairAcrossCurrentSweepBoundary() {
        Point a = p("A", 0, 100);
        Point b = p("B", 4, 0);
        Point c = p("C", 5, 1);
        Point d = p("D", 20, 100);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), b, c);
    }

    @Test
    void ignoresPointOutsideHorizontalDeltaWindow() {
        Point a = p("A", 0, 0);
        Point b = p("B", 3, 4);      // initial delta = 5
        Point c = p("C", 10, 0);
        Point d = p("D", 11, 0);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, c, d);
    }

    @Test
    void findsCandidateWithVeryDifferentInsertionOrderInTreeSet() {
        Point a = p("A", 0, 100);
        Point b = p("B", 1, -100);
        Point c = p("C", 2, 10);
        Point d = p("D", 3, 11);

        PointPair result = solve(a, b, c, d);

        assertResult(result, Math.sqrt(2), c, d);
    }

    @Test
    void deltaShrinksMultipleTimes() {
        Point a = p("A", 0, 0);
        Point b = p("B", 20, 0);     // delta 20
        Point c = p("C", 28, 0);     // delta 8
        Point d = p("D", 32, 0);     // delta 4
        Point e = p("E", 33, 0);     // delta 1

        PointPair result = solve(a, b, c, d, e);

        assertResult(result, 1.0, d, e);
    }

    @Test
    void closestPointsAreNotAdjacentInInputOrder() {
        Point a = p("A", 0, 0);
        Point b = p("B", 100, 100);
        Point c = p("C", 1, 1);
        Point d = p("D", -100, 50);

        List<Point> points = List.of(a, b, c, d);

        PointPair result = solve(points);

        assertResult(result, Math.sqrt(2), a, c);
    }

    // ---------------------------------------------------------------------
    // Doppelte Koordinaten
    // ---------------------------------------------------------------------

    @Test
    void duplicateCoordinatesProduceDistanceZero() {
        Point a = p("A", 4, 7);
        Point b = p("B", 20, 30);
        Point c = p("C", 4, 7);

        PointPair result = solve(a, b, c);

        assertResult(result, 0.0, a, c);
    }

    @Test
    void duplicateCoordinatesAtBeginningProduceDistanceZero() {
        Point a = p("A", 0, 0);
        Point b = p("B", 0, 0);
        Point c = p("C", 100, 100);

        PointPair result = solve(a, b, c);

        assertResult(result, 0.0, a, b);
    }

    @Test
    void duplicateCoordinatesAtEndProduceDistanceZero() {
        Point a = p("A", -100, -100);
        Point b = p("B", 0, 0);
        Point c = p("C", 50, 50);
        Point d = p("D", 50, 50);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 0.0, c, d);
    }

    @Test
    void multipleDuplicatePointsStillProduceValidResult() {
        List<Point> points = List.of(
                p("A", 5, 5),
                p("B", 5, 5),
                p("C", 5, 5),
                p("D", 20, 20)
        );

        PointPair result = solve(points);

        assertMinimumDistance(result, 0.0, points);
    }

    // ---------------------------------------------------------------------
    // Gleichstände
    // ---------------------------------------------------------------------

    @Test
    void squareHasSeveralEquallyClosePairs() {
        List<Point> points = List.of(
                p("A", 0, 0),
                p("B", 0, 10),
                p("C", 10, 0),
                p("D", 10, 10)
        );

        PointPair result = solve(points);

        assertMinimumDistance(result, 10.0, points);
    }

    @Test
    void equallySpacedHorizontalPointsHaveSeveralSolutions() {
        List<Point> points = List.of(
                p("A", 0, 0),
                p("B", 4, 0),
                p("C", 8, 0),
                p("D", 12, 0)
        );

        PointPair result = solve(points);

        assertMinimumDistance(result, 4.0, points);
    }

    @Test
    void equilateralLikeIntegerConfigurationHasTie() {
        List<Point> points = List.of(
                p("A", 0, 0),
                p("B", 3, 4),
                p("C", 6, 0)
        );

        PointPair result = solve(points);

        assertMinimumDistance(result, 5.0, points);
    }

    // ---------------------------------------------------------------------
    // Gleiche x- oder y-Koordinaten
    // ---------------------------------------------------------------------

    @Test
    void severalPointsCanHaveSameXCoordinate() {
        Point a = p("A", 3, 0);
        Point b = p("B", 3, 20);
        Point c = p("C", 3, 21);
        Point d = p("D", 3, 100);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, b, c);
    }

    @Test
    void severalPointsCanHaveSameYCoordinate() {
        Point a = p("A", -50, 8);
        Point b = p("B", 10, 8);
        Point c = p("C", 11, 8);
        Point d = p("D", 100, 8);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, b, c);
    }

    @Test
    void sameXAndDifferentYAreKeptDistinctByTreeSet() {
        Point a = p("A", 0, 0);
        Point b = p("B", 0, 5);
        Point c = p("C", 0, 6);
        Point d = p("D", 10, 100);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, b, c);
    }

    // ---------------------------------------------------------------------
    // Große und extreme Koordinaten
    // ---------------------------------------------------------------------

    @Test
    void handlesLargeCoordinatesWithoutIntOverflow() {
        Point a = p("A", Integer.MIN_VALUE, 0);
        Point b = p("B", Integer.MAX_VALUE, 0);

        PointPair result = solve(a, b);

        double expected = 4_294_967_295.0;

        assertResult(result, expected, a, b);
    }

    @Test
    void handlesLargeDifferencesInBothDimensions() {
        Point a = p("A", Integer.MIN_VALUE, Integer.MIN_VALUE);
        Point b = p("B", Integer.MAX_VALUE, Integer.MAX_VALUE);

        PointPair result = solve(a, b);

        double difference = 4_294_967_295.0;
        double expected = Math.sqrt(
                difference * difference + difference * difference
        );

        assertResult(result, expected, a, b);
    }

    @Test
    void findsSmallPairDespiteOtherExtremeCoordinates() {
        Point a = p("A", Integer.MIN_VALUE, Integer.MIN_VALUE);
        Point b = p("B", 100, 100);
        Point c = p("C", 101, 100);
        Point d = p("D", Integer.MAX_VALUE, Integer.MAX_VALUE);

        PointPair result = solve(a, b, c, d);

        assertResult(result, 1.0, b, c);
    }

    // ---------------------------------------------------------------------
    // Eingabeliste darf nicht verändert werden
    // ---------------------------------------------------------------------

    @Test
    void algorithmDoesNotChangeInputOrder() {
        Point a = p("A", 10, 4);
        Point b = p("B", -5, 7);
        Point c = p("C", 3, 2);

        List<Point> input = new ArrayList<>(List.of(a, b, c));
        List<Point> originalOrder = new ArrayList<>(input);

        solve(input);

        assertEquals(originalOrder, input);
    }

    // ---------------------------------------------------------------------
    // Parametrisierte bekannte Beispiele
    // ---------------------------------------------------------------------

    static Stream<KnownCase> knownCases() {
        return Stream.of(
                new KnownCase(
                        List.of(
                                p("A", 0, 0),
                                p("B", 2, 1),
                                p("C", 1, 1)
                        ),
                        1.0
                ),
                new KnownCase(
                        List.of(
                                p("A", -4, -3),
                                p("B", 0, 0),
                                p("C", 10, 10)
                        ),
                        5.0
                ),
                new KnownCase(
                        List.of(
                                p("A", 0, 0),
                                p("B", 6, 8),
                                p("C", 7, 8),
                                p("D", 100, 100)
                        ),
                        1.0
                ),
                new KnownCase(
                        List.of(
                                p("A", -10, 2),
                                p("B", -8, 3),
                                p("C", 20, -5),
                                p("D", 80, 100)
                        ),
                        Math.sqrt(5)
                ),
                new KnownCase(
                        List.of(
                                p("A", 1, 1),
                                p("B", 2, 2),
                                p("C", 3, 3),
                                p("D", 4, 4)
                        ),
                        Math.sqrt(2)
                )
        );
    }

    @ParameterizedTest
    @MethodSource("knownCases")
    void returnsExpectedMinimumDistanceForKnownCases(KnownCase testCase) {
        PointPair result = solve(testCase.points());

        assertMinimumDistance(
                result,
                testCase.expectedDistance(),
                testCase.points()
        );
    }

    private record KnownCase(
            List<Point> points,
            double expectedDistance
    ) {
    }

    // ---------------------------------------------------------------------
    // Brute-Force-Vergleich
    // ---------------------------------------------------------------------

    /**
     * Ein absichtlich einfacher O(n²)-Algorithmus als Test-Orakel.
     * Er ist nicht effizient, aber sehr leicht auf Korrektheit zu prüfen.
     */
    private static PointPair bruteForce(List<Point> points) {
        if (points == null || points.size() < 2) {
            throw new IllegalArgumentException(
                    "There must be at least two points"
            );
        }

        Point bestP0 = points.get(0);
        Point bestP1 = points.get(1);
        double bestDistance = distance(bestP0, bestP1);

        for (int i = 0; i < points.size(); i++) {
            for (int j = i + 1; j < points.size(); j++) {
                Point p0 = points.get(i);
                Point p1 = points.get(j);
                double currentDistance = distance(p0, p1);

                if (currentDistance < bestDistance) {
                    bestDistance = currentDistance;
                    bestP0 = p0;
                    bestP1 = p1;
                }
            }
        }

        return new PointPair(bestP0, bestP1, bestDistance);
    }

    @Test
    void matchesBruteForceForManyDeterministicRandomInputs() {
        Random random = new Random(42);

        for (int testRun = 0; testRun < 1_000; testRun++) {
            int numberOfPoints = 2 + random.nextInt(50);
            List<Point> points = new ArrayList<>();

            for (int i = 0; i < numberOfPoints; i++) {
                int x = random.nextInt(2_001) - 1_000;
                int y = random.nextInt(2_001) - 1_000;

                points.add(p("P" + i, x, y));
            }

            PointPair expected = bruteForce(points);
            PointPair actual = solve(points);

            assertEquals(
                    expected.distance(),
                    actual.distance(),
                    EPSILON,
                    () -> "Difference in random test run ... with points " + points
            );

            assertEquals(
                    actual.distance(),
                    distance(actual.p0(), actual.p1()),
                    EPSILON
            );
        }
    }

    @Test
    void matchesBruteForceForRandomInputsWithManyDuplicateCoordinates() {
        Random random = new Random(123);

        for (int testRun = 0; testRun < 500; testRun++) {
            int numberOfPoints = 2 + random.nextInt(40);
            List<Point> points = new ArrayList<>();

            for (int i = 0; i < numberOfPoints; i++) {
                // Kleine Range erzeugt absichtlich viele gleiche Koordinaten.
                int x = random.nextInt(11) - 5;
                int y = random.nextInt(11) - 5;

                points.add(p("P" + i, x, y));
            }

            PointPair expected = bruteForce(points);
            PointPair actual = solve(points);

            assertEquals(
                    expected.distance(),
                    actual.distance(),
                    EPSILON,
                    () -> "Difference in duplicate-heavy run "
            );
        }
    }

    @Test
    void matchesBruteForceForRandomCollinearPoints() {
        Random random = new Random(456);

        for (int testRun = 0; testRun < 500; testRun++) {
            int numberOfPoints = 2 + random.nextInt(50);
            List<Point> points = new ArrayList<>();

            for (int i = 0; i < numberOfPoints; i++) {
                int x = random.nextInt(2_001) - 1_000;
                int y = 3 * x + 7;

                points.add(p("P" + i, x, y));
            }

            PointPair expected = bruteForce(points);
            PointPair actual = solve(points);

            assertEquals(
                    expected.distance(),
                    actual.distance(),
                    EPSILON
            );
        }
    }

    // ---------------------------------------------------------------------
    // Struktur des zurückgegebenen Ergebnisses
    // ---------------------------------------------------------------------

    @Test
    void resultAlwaysContainsTwoDifferentInputPoints() {
        List<Point> points = List.of(
                p("A", 0, 0),
                p("B", 4, 5),
                p("C", 9, 2),
                p("D", -2, 8)
        );

        PointPair result = solve(points);

        assertNotNull(result);
        assertNotNull(result.p0());
        assertNotNull(result.p1());

        assertNotEquals(result.p0(), result.p1());
        assertTrue(points.contains(result.p0()));
        assertTrue(points.contains(result.p1()));
    }

    @Test
    void resultDistanceMatchesReturnedPoints() {
        List<Point> points = List.of(
                p("A", -7, 12),
                p("B", 4, 3),
                p("C", 5, 3),
                p("D", 100, -100)
        );

        PointPair result = solve(points);

        assertEquals(
                distance(result.p0(), result.p1()),
                result.distance(),
                EPSILON
        );
    }

    @Test
    void allInputPointIdsRemainUniqueInTestData() {
        List<Point> points = List.of(
                p("A", 0, 0),
                p("B", 0, 0),
                p("C", 1, 1)
        );

        Set<String> ids = new HashSet<>();

        for (Point point : points) {
            assertTrue(
                    ids.add(point.id()),
                    "Duplicate test ID: " + point.id()
            );
        }
    }
}