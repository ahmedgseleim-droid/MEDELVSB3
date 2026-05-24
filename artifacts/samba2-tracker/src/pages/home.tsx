import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListRecords,
  useDeleteRecord,
  getListRecordsQueryKey,
  getGetRecordStatsQueryKey,
} from "@workspace/api-client-react";
type Record = { id: number; patientName: string; dob: string; phone: string; serial: string; implant: string; issueDescription: string; conditions: string; skin: string[]; visual: string[]; audio: string[]; physical: string[]; accessory: string[]; connectivity: string[]; steps: string[]; resolved: string; resolvedHow: string; nextAction: string; contactName: string; contactEmail: string; submittedBy?: string; };
import { Download, LogOut } from "lucide-react";
import { clearStoredToken } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog";
import { TrackerForm } from "../components/tracker-form";
import { AdhearForm } from "../components/adhear-form";
import { StatsCards } from "../components/stats-cards";
import { PatientReportModal } from "../components/patient-report-modal";

type FormMode = "samba2" | "adhear";

export default function Home() {
  const [formMode, setFormMode] = useState<FormMode>("samba2");
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [printingRecord, setPrintingRecord] = useState<{ record: Record; rowNumber: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allRecords, isLoading } = useListRecords({
    query: { queryKey: getListRecordsQueryKey() },
  });

  const samba2Records = allRecords?.filter((r) => r.implant !== "ADHEAR");
  const adhearRecords = allRecords?.filter((r) => r.implant === "ADHEAR");
  const records = formMode === "samba2" ? samba2Records : adhearRecords;

  const deleteRecord = useDeleteRecord({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordStatsQueryKey() });
        toast({ title: "Record deleted successfully" });
        setDeletingId(null);
      },
      onError: () => {
        toast({ title: "Failed to delete record", variant: "destructive" });
      },
    },
  });

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => setEditingRecord(null);
  const handleSuccess = () => setEditingRecord(null);

  const handleModeSwitch = (mode: FormMode) => {
    setFormMode(mode);
    setEditingRecord(null);
  };

  const exportToCSV = useCallback(() => {
    if (!records || records.length === 0) return;

    const escape = (val: string | undefined | null) => `"${(val ?? "").replace(/"/g, '""')}"`;
    const arr = (vals: string[] | undefined | null) => escape((vals ?? []).join("; "));

    let headers: string[];
    let rows: string[];

    if (formMode === "samba2") {
      headers = [
        "#", "Patient Name", "DOB", "Phone", "Serial", "Implant Type",
        "Issue Description", "Conditions",
        "Skin Issues", "Visual Inspection", "Audio Issues", "Physical Issues",
        "Accessory Issues", "Connectivity Issues", "Steps Taken",
        "Resolved", "Resolved How", "Next Action",
        "Contact Name", "Contact Email",
      ];
      rows = records.map((r, i) => [
        i + 1,
        escape(r.patientName), escape(r.dob), escape(r.phone),
        escape(r.serial), escape(r.implant),
        escape(r.issueDescription), escape(r.conditions),
        arr(r.skin), arr(r.visual), arr(r.audio), arr(r.physical),
        arr(r.accessory), arr(r.connectivity), arr(r.steps),
        escape(r.resolved), escape(r.resolvedHow), escape(r.nextAction),
        escape(r.contactName), escape(r.contactEmail),
      ].join(","));
    } else {
      headers = [
        "#", "Patient Name", "DOB", "Phone", "Serial",
        "Device Issue Description", "User Feedback",
        "Audio Quality Issues", "Physical Device Issues",
        "Connectivity Issues", "Other Issues",
        "Adhesive Adapter Steps", "Processor Steps",
        "Resolved", "Resolved How", "Next Action",
        "Contact Name", "Contact Email",
      ];
      rows = records.map((r, i) => [
        i + 1,
        escape(r.patientName), escape(r.dob), escape(r.phone), escape(r.serial),
        escape(r.issueDescription), escape(r.conditions),
        arr(r.audio), arr(r.physical), arr(r.connectivity), arr(r.accessory),
        arr(r.skin), arr(r.steps),
        escape(r.resolved), escape(r.resolvedHow), escape(r.nextAction),
        escape(r.contactName), escape(r.contactEmail),
      ].join(","));
    }

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formMode}-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [records, formMode]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1600px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          MEDEL — Device Troubleshooting Tracker
        </h1>
        <p className="text-muted-foreground mt-2">Patient Case Troubleshooting Log</p>
      </div>
      <button onClick={() => { clearStoredToken(); window.location.reload(); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span>Sign out</span>
      </button>
      <div className="hidden">
      </div>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => handleModeSwitch("samba2")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            formMode === "samba2"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          SAMBA 2
        </button>
        <button
          onClick={() => handleModeSwitch("adhear")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            formMode === "adhear"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ADHEAR
        </button>
      </div>

      <div className="mb-8">
        {formMode === "samba2" ? (
          <TrackerForm
            editingRecord={editingRecord}
            onCancelEdit={handleCancelEdit}
            onSuccess={handleSuccess}
          />
        ) : (
          <AdhearForm
            editingRecord={editingRecord}
            onCancelEdit={handleCancelEdit}
            onSuccess={handleSuccess}
          />
        )}
      </div>

      <StatsCards records={records} isLoading={isLoading} mode={formMode} />

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {formMode === "samba2" ? "SAMBA 2" : "ADHEAR"} Patient Records
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={!records || records.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="min-w-max">
            {formMode === "samba2" ? (
              <Samba2Table
                records={records}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={setDeletingId}
                onPrint={(r, i) => setPrintingRecord({ record: r, rowNumber: i })}
              />
            ) : (
              <AdhearTable
                records={records}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={setDeletingId}
                onPrint={(r, i) => setPrintingRecord({ record: r, rowNumber: i })}
              />
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteRecord.mutate({ id: deletingId })}
              disabled={deleteRecord.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {printingRecord && (
        <PatientReportModal
          record={printingRecord.record}
          rowNumber={printingRecord.rowNumber}
          onClose={() => setPrintingRecord(null)}
        />
      )}
    </div>
  );
}

function Samba2Table({
  records,
  isLoading,
  onEdit,
  onDelete,
  onPrint,
}: {
  records: Record[] | undefined;
  isLoading: boolean;
  onEdit: (r: Record) => void;
  onDelete: (id: number) => void;
  onPrint: (r: Record, rowNumber: number) => void;
}) {
  const COLS = 20;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 whitespace-nowrap">#</TableHead>
          <TableHead className="whitespace-nowrap">Patient</TableHead>
          <TableHead className="whitespace-nowrap">DOB</TableHead>
          <TableHead className="whitespace-nowrap">Phone</TableHead>
          <TableHead className="whitespace-nowrap">Serial</TableHead>
          <TableHead className="whitespace-nowrap">Implant Type</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Skin Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Visual Inspection</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Audio Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Physical Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Accessory Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Connectivity Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Steps Taken</TableHead>
          <TableHead className="whitespace-nowrap">Resolved</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Resolved How</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Next Action</TableHead>
          <TableHead className="whitespace-nowrap">Contact Name</TableHead>
          <TableHead className="whitespace-nowrap">Contact Email</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Issue Description</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Conditions</TableHead>
          <TableHead className="whitespace-nowrap">Submitted By</TableHead>
          <TableHead className="text-right sticky right-0 bg-card border-l whitespace-nowrap">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow><TableCell colSpan={COLS} className="h-24 text-center"><Skeleton className="w-full h-8" /></TableCell></TableRow>
        ) : !records?.length ? (
          <TableRow><TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">No SAMBA 2 records found</TableCell></TableRow>
        ) : (
          records.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium whitespace-nowrap">{i + 1}</TableCell>
              <TableCell className="whitespace-nowrap">{r.patientName}</TableCell>
              <TableCell className="whitespace-nowrap">{r.dob}</TableCell>
              <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
              <TableCell className="whitespace-nowrap">{r.serial}</TableCell>
              <TableCell className="whitespace-nowrap">{r.implant}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.skin?.join(", ")}>{r.skin?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.visual?.join(", ")}>{r.visual?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.audio?.join(", ")}>{r.audio?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.physical?.join(", ")}>{r.physical?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.accessory?.join(", ")}>{r.accessory?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.connectivity?.join(", ")}>{r.connectivity?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.steps?.join(", ")}>{r.steps?.join(", ")}</TableCell>
              <TableCell className="whitespace-nowrap">{r.resolved || "-"}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.resolvedHow}>{r.resolvedHow}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.nextAction}>{r.nextAction}</TableCell>
              <TableCell className="whitespace-nowrap">{r.contactName}</TableCell>
              <TableCell className="whitespace-nowrap">{r.contactEmail}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.issueDescription}>{r.issueDescription}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.conditions}>{r.conditions}</TableCell>
              <TableCell className="text-right sticky right-0 bg-card border-l whitespace-nowrap">
                <div className="flex justify-end gap-2 px-2">
                  <Button variant="ghost" size="sm" onClick={() => onPrint(r, i + 1)}>Report</Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(r)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function AdhearTable({
  records,
  isLoading,
  onEdit,
  onDelete,
  onPrint,
}: {
  records: Record[] | undefined;
  isLoading: boolean;
  onEdit: (r: Record) => void;
  onDelete: (id: number) => void;
  onPrint: (r: Record, rowNumber: number) => void;
}) {
  const COLS = 17;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 whitespace-nowrap">#</TableHead>
          <TableHead className="whitespace-nowrap">Patient</TableHead>
          <TableHead className="whitespace-nowrap">DOB</TableHead>
          <TableHead className="whitespace-nowrap">Phone</TableHead>
          <TableHead className="whitespace-nowrap">Serial</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Audio Quality Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Physical Device Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Connectivity Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Other Issues</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Adhesive Adapter Steps</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Processor Steps</TableHead>
          <TableHead className="whitespace-nowrap">Resolved</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Resolved How</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Next Action</TableHead>
          <TableHead className="whitespace-nowrap">Contact Name</TableHead>
          <TableHead className="whitespace-nowrap">Contact Email</TableHead>
          <TableHead className="whitespace-nowrap max-w-[180px]">Issue Description</TableHead>
          <TableHead className="whitespace-nowrap">Submitted By</TableHead>
          <TableHead className="text-right sticky right-0 bg-card border-l whitespace-nowrap">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow><TableCell colSpan={COLS} className="h-24 text-center"><Skeleton className="w-full h-8" /></TableCell></TableRow>
        ) : !records?.length ? (
          <TableRow><TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">No ADHEAR records found</TableCell></TableRow>
        ) : (
          records.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium whitespace-nowrap">{i + 1}</TableCell>
              <TableCell className="whitespace-nowrap">{r.patientName}</TableCell>
              <TableCell className="whitespace-nowrap">{r.dob}</TableCell>
              <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
              <TableCell className="whitespace-nowrap">{r.serial}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.audio?.join(", ")}>{r.audio?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.physical?.join(", ")}>{r.physical?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.connectivity?.join(", ")}>{r.connectivity?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.accessory?.join(", ")}>{r.accessory?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.skin?.join(", ")}>{r.skin?.join(", ")}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.steps?.join(", ")}>{r.steps?.join(", ")}</TableCell>
              <TableCell className="whitespace-nowrap">{r.resolved || "-"}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.resolvedHow}>{r.resolvedHow}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.nextAction}>{r.nextAction}</TableCell>
              <TableCell className="whitespace-nowrap">{r.contactName}</TableCell>
              <TableCell className="whitespace-nowrap">{r.contactEmail}</TableCell>
              <TableCell className="truncate max-w-[180px]" title={r.issueDescription}>{r.issueDescription}</TableCell>
              <TableCell className="text-right sticky right-0 bg-card border-l whitespace-nowrap">
                <div className="flex justify-end gap-2 px-2">
                  <Button variant="ghost" size="sm" onClick={() => onPrint(r, i + 1)}>Report</Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(r)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(r.id)}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
