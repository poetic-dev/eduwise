import { useEffect, useState } from "react";
import { api } from "@/api";
import { getApiErrorMessage } from "@/api/errors";
import { Card, CardContent, CardHeader, CardTitle, Chart, Alert, AlertDescription, Spinner } from "@fusorb/facet-components";
import type { Stream } from "@/types";

interface AnalyticsResponse {
  analytics: {
    streamDistribution: Record<Stream, number>;
    confidenceDistribution: { bin: string; count: number }[];
    registrationsByMonth: { month: string; count: number }[];
    topCourses: {
      courseId: string;
      courseName: string;
      facultyArea: string;
      validationCount: number;
      complianceRate: number;
    }[];
    avgAcademicPerStream: { stream: Stream | null; avgWeightedScore: number }[];
  };
}

const STREAM_COLORS: Record<Stream, string> = {
  Science: "#3B82F6",
  Humanities: "#8B5CF6",
  Business: "#10B981",
};

const STREAM_LABELS: Record<Stream, string> = {
  Science: "Science",
  Humanities: "Humanities",
  Business: "Business",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await api.get<AnalyticsResponse>("/admin/analytics");
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load analytics."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Spinner className="mr-2" />
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "No analytics available."}</AlertDescription>
      </Alert>
    );
  }

  const { analytics } = data;

  const streamData = (Object.keys(analytics.streamDistribution) as Stream[]).map((stream) => ({
    name: STREAM_LABELS[stream],
    value: analytics.streamDistribution[stream] ?? 0,
    color: STREAM_COLORS[stream],
  }));

  const avgScoreData = analytics.avgAcademicPerStream
    .filter((r) => r.stream !== null)
    .map((r) => ({ name: STREAM_LABELS[r.stream as Stream], score: Math.round(r.avgWeightedScore) }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Aggregated recommendation, registration, and JAMB course insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Stream distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommended Stream Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {streamData.every((d) => d.value === 0) ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No recommendations yet.
              </p>
            ) : (
              <div className="w-full">
                <Chart
                  type="pie"
                  x={streamData.map((d) => d.name)}
                  series={[{ id: "stream", label: "Stream", data: streamData.map((d) => d.value) }]}
                  colors={{ chart: streamData.map((d) => d.color) }}
                  height={400}
                  showLegend={false}
                  renderSliceLabel={(_index, value, _percent, xLabel) => (
                    <text fontSize={11} fill="var(--muted-foreground)" textAnchor="middle">
                      {`${xLabel}: ${value}`}
                    </text>
                  )}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confidence histogram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confidence Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <Chart
                type="bar"
                x={analytics.confidenceDistribution.map((d) => d.bin)}
                series={[{ id: "count", label: "Recommendations", data: analytics.confidenceDistribution.map((d) => d.count) }]}
                yMin={0}
                height={400}
                showLegend={false}
                barRadius={4}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Registrations over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <Chart
                type="area"
                curve="smooth"
                x={analytics.registrationsByMonth.map((d) => d.month)}
                series={[{ id: "reg", label: "Registrations", data: analytics.registrationsByMonth.map((d) => d.count) }]}
                yMin={0}
                height={400}
                showLegend={false}
                colors={{ chart: ["#3B82F6"] }}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top JAMB courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top JAMB Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCourses.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No JAMB validations yet.
              </p>
            ) : (
              <div className="w-full">
                <Chart
                  type="bar"
                  layout="horizontal"
                  x={analytics.topCourses.map((c) => c.courseName)}
                  series={[
                    {
                      id: "validations",
                      label: "Validations",
                      data: analytics.topCourses.map((c) => c.validationCount),
                      color: "#8B5CF6",
                    },
                  ]}
                  yMin={0}
                  height={400}
                  showLegend={false}
                  barRadius={4}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avg academic score per stream */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Average Weighted Academic Score by Stream</CardTitle>
          </CardHeader>
          <CardContent>
            {avgScoreData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No academic profiles yet.
              </p>
            ) : (
              <div className="w-full">
                <Chart
                  type="bar"
                  x={avgScoreData.map((d) => d.name)}
                  series={[
                    {
                      id: "score",
                      label: "Avg weighted score",
                      data: avgScoreData.map((d) => d.score),
                    },
                  ]}
                  yMin={0}
                  yMax={100}
                  height={400}
                  showLegend={false}
                  colors={{ chart: avgScoreData.map((d) => STREAM_COLORS[d.name as Stream] ?? "#3B82F6") }}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
