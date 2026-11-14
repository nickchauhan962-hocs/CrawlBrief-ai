import { CategoryScore, Finding } from "@/lib/schemas/audit-report";

export interface CategoryScoresResult {
  categoryScores: Record<string, CategoryScore>;
  heuristicScore: number | null;
}

/**
 * Computes category scores and a transparent heuristic score based on deterministic findings.
 */
export function calculateCategoryScores(
  findings: Finding[],
  pagesCount: number,
  pagespeedPerformanceScore?: number | null
): CategoryScoresResult {
  const categories: Array<"technical" | "content" | "schema"> = ["technical", "content", "schema"];
  const categoryScores: Record<string, CategoryScore> = {};

  for (const cat of categories) {
    const catFindings = findings.filter((f) => f.category === cat);
    const highIssues = catFindings.filter((f) => f.severity === "high").length;
    const medIssues = catFindings.filter((f) => f.severity === "medium").length;
    const lowIssues = catFindings.filter((f) => f.severity === "low").length;

    // Base score is 100, deducted by severity weights
    // High: -25 pts, Medium: -10 pts, Low: -3 pts
    const deduction = highIssues * 25 + medIssues * 10 + lowIssues * 3;
    const rawScore = Math.max(0, 100 - deduction);

    let status: "good" | "needs_improvement" | "poor" = "good";
    if (rawScore < 60 || highIssues > 0) {
      status = "poor";
    } else if (rawScore < 85 || medIssues > 0) {
      status = "needs_improvement";
    }

    categoryScores[cat] = {
      score: rawScore,
      status,
      passed: Math.max(0, 10 - catFindings.length),
      issues: catFindings.length,
    };
  }

  // Performance category (from PageSpeed if provided)
  if (typeof pagespeedPerformanceScore === "number") {
    const pScore = Math.round(pagespeedPerformanceScore);
    categoryScores["performance"] = {
      score: pScore,
      status: pScore >= 90 ? "good" : pScore >= 50 ? "needs_improvement" : "poor",
      passed: pScore >= 90 ? 1 : 0,
      issues: pScore < 90 ? 1 : 0,
    };
  } else {
    categoryScores["performance"] = {
      score: null,
      status: "unmeasured",
      passed: 0,
      issues: 0,
    };
  }

  // Calculate overall heuristic score (average of measured categories)
  const measuredScores: number[] = [];
  if (categoryScores["technical"]?.score !== null) measuredScores.push(categoryScores["technical"].score);
  if (categoryScores["content"]?.score !== null) measuredScores.push(categoryScores["content"].score);
  if (categoryScores["schema"]?.score !== null) measuredScores.push(categoryScores["schema"].score);
  if (categoryScores["performance"]?.score !== null) measuredScores.push(categoryScores["performance"].score);

  const heuristicScore =
    measuredScores.length > 0
      ? Math.round(measuredScores.reduce((a, b) => a + b, 0) / measuredScores.length)
      : null;

  return { categoryScores, heuristicScore };
}
