import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import SeverityBadge from "@/components/screening/SeverityBadge";
import ScoreCircle from "@/components/screening/ScoreCircle";
import api from "@/lib/api";
import { HISTORY } from "@/constants/testIds";
import { Search, Filter, ShieldCheck, Activity, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearLocalScreeningHistory } from "@/lib/accessControl";

const History = () => {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api
      .get("/screenings")
      .then(({ data }) => setScreenings(data))
      .catch(() => setScreenings([]));

    const onCleared = () => setScreenings([]);
    window.addEventListener("spectra:history-cleared", onCleared);
    return () => window.removeEventListener("spectra:history-cleared", onCleared);
  }, []);

  const handleClearLocal = async () => {
    setClearing(true);
    try {
      await clearLocalScreeningHistory();
      setScreenings([]);
    } finally {
      setClearing(false);
    }
  };

  const validScreenings = (screenings || []).filter(
    (s) =>
      s.status !== "REJECTED" &&
      s.status !== "INCONCLUSIVE" &&
      s.result?.status !== "REJECTED" &&
      s.result?.status !== "INCONCLUSIVE" &&
      s.result?.is_valid_radiograph !== false &&
      !s.result?.is_inconclusive
  );

  const filteredScreenings = validScreenings.filter((s) => {
    const matchesSearch =
      s.patient_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.age).includes(searchTerm) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "ALL" || s.result?.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div data-testid={HISTORY.page} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            CAD Screening History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit trail of chest X-ray CAD evaluations, stratified by MaHTAS severity score.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {screenings ? `${validScreenings.length} records archived` : "Loading archive..."}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="history-clear-local-button"
            onClick={handleClearLocal}
            disabled={clearing || validScreenings.length === 0}
            className="h-8 text-xs border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {clearing ? "Clearing..." : "Clear local history"}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by category, gender, age, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Severity segment controls */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-slate-50 p-1 text-xs">
          <Filter className="ml-1 mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {["ALL", "NO_LESION", "MINIMAL", "MODERATE", "SEVERE"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                severityFilter === sev
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {sev === "ALL" ? "All" : sev.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        {screenings === null && (
          <div data-testid={HISTORY.loadingState} className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {screenings !== null && filteredScreenings.length === 0 && (
          <div
            data-testid={HISTORY.emptyState}
            className="p-12 text-center text-sm text-muted-foreground"
          >
            <Activity className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No screening records found</p>
            <p className="mt-1 text-xs">
              {searchTerm || severityFilter !== "ALL"
                ? "Try adjusting your search criteria or severity filters."
                : "Submit a chest X-ray on the New Screening page to see it logged here."}
            </p>
          </div>
        )}

        {screenings !== null && filteredScreenings.length > 0 && (
          <>
            {/* Mobile Cards */}
            <div className="divide-y divide-border md:hidden">
              {filteredScreenings.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  data-testid={HISTORY.row(s.id)}
                  onClick={() => navigate(`/screening/${s.id}`)}
                  className="flex w-full min-h-[76px] items-center gap-3 p-4 text-left transition-colors duration-150 active:bg-slate-50"
                >
                  <ScoreCircle
                    testId={HISTORY.scoreCircle(s.id)}
                    score={s.result?.tb_score}
                    severity={s.result?.severity}
                    isValid={s.result?.is_valid_radiograph !== false}
                    className="h-11 w-11 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-foreground">
                      {s.patient_category} · {s.age}y · {s.gender}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <SeverityBadge severity={s.result?.severity} className="shrink-0" showBm={false} />
                </button>
              ))}
            </div>

            {/* Desktop Table */}
            <Table data-testid={HISTORY.table} className="hidden md:table">
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead className="w-16">Score</TableHead>
                  <TableHead>Screening Category</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Severity Stratification</TableHead>
                  <TableHead className="text-right">TB CAD Index</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScreenings.map((s) => {
                  const isValid = s.result?.is_valid_radiograph !== false;
                  return (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer transition-colors duration-150 hover:bg-slate-50/80"
                      onClick={() => navigate(`/screening/${s.id}`)}
                    >
                      <TableCell>
                        <ScoreCircle
                          score={s.result?.tb_score}
                          severity={s.result?.severity}
                          isValid={isValid}
                        />
                      </TableCell>
                      <TableCell className="font-heading font-medium text-foreground">
                        {s.patient_category}
                      </TableCell>
                      <TableCell className="font-mono">{s.age}y</TableCell>
                      <TableCell>{s.gender}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={s.result?.severity} />
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {isValid ? `${s.result?.tb_score}/100` : "--"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
