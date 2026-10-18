import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Trash2, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import XrayViewer from "@/components/screening/XrayViewer";
import ResultPanel from "@/components/screening/ResultPanel";
import PrintableReport from "@/components/screening/PrintableReport";
import api from "@/lib/api";
import { downloadElementAsPdf } from "@/lib/pdfGenerator";
import { DETAIL } from "@/constants/testIds";
import { deleteScreeningFromFirestore } from "@/lib/firebase";

const ScreeningDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [screening, setScreening] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    api
      .get(`/screenings/${id}`)
      .then(({ data }) => setScreening(data))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/screenings/${id}`);
      await deleteScreeningFromFirestore(id);
      navigate("/history");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setDownloadingPdf(true);
    try {
      await downloadElementAsPdf(
        printRef.current,
        `tb-screening-${screening.id.slice(0, 8)}.pdf`
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p data-testid={DETAIL.notFound} className="text-lg font-medium text-foreground">
          Screening record not found.
        </p>
        <Button variant="link" onClick={() => navigate("/history")}>
          Back to history
        </Button>
      </div>
    );
  }

  return (
    <div data-testid={DETAIL.page} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/history"
        data-testid={DETAIL.backLink}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to screening history
      </Link>

      {!screening ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {screening.patient_category} · {screening.age}y · {screening.gender}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Screened on {new Date(screening.created_at).toLocaleString()} · ID: {screening.id}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                data-testid={DETAIL.downloadPdfButton}
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid={DETAIL.deleteButton}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Record
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this screening record?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The patient demographic data, radiological findings, and stored X-ray image will be permanently purged from the archive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid={DETAIL.deleteCancelButton}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-testid={DETAIL.deleteConfirmButton}
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <XrayViewer
              imageSrc={screening.image_base64}
              annotations={screening.result?.annotations || []}
            />
            <ResultPanel result={screening.result} />
          </div>

          <div style={{ position: "fixed", left: "-99999px", top: 0 }} aria-hidden="true">
            <PrintableReport ref={printRef} screening={screening} />
          </div>
        </>
      )}
    </div>
  );
};

export default ScreeningDetail;
