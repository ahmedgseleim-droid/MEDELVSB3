import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListRecords, useDeleteRecord,
  getListRecordsQueryKey, getGetRecordStatsQueryKey,
} from "@workspace/api-client-react";
import { LogOut } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TrackerForm } from "@/components/tracker-form";
import { AdhearForm } from "@/components/adhear-form";
import { PatientReportModal } from "@/components/patient-report-modal";
import { clearStoredToken } from "@/lib/auth";

type Record = { id: number; patientName: string; dob: string; phone: string; serial: string; implant: string; issueDescription: string; conditions: string; skin: string[]; visual: string[]; audio: string[]; physical: string[]; accessory: string[]; connectivity: string[]; steps: string[]; resolved: string; resolvedHow: string; nextAction: string; contactName: string; contactEmail: string; submittedBy?: string; };
type FormMode = "samba2" | "adhear";

interface StaffViewProps { username: string; }

export default function StaffView({ username }: StaffViewProps) {
  const [formMode, setFormMode]         = useState<FormMode>("samba2");
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [printingRecord, setPrintingRecord] = useState<{ record: Record; rowNumber: number } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allRecords, isLoading } = useListRecords({
    query: { queryKey: getListRecordsQueryKey() },
  });

  const samba2Records = allRecords?.filter((r: Record) => r.implant !== "ADHEAR");
  const adhearRecords = allRecords?.filter((r: Record) => r.implant === "ADHEAR");
  const records = formMode === "samba2" ? samba2Records : adhearRecords;

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleModeSwitch = (mode: FormMode) => {
    setFormMode(mode);
    setEditingRecord(null);
  };

  const handleLogout = () => {
    clearStoredToken();
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1400px]">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#C60C30" }}>
            MEDEL — Device Tracker
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#646464" }}>
            Logged in as <span className="font-semibold" style={{ color: "#0D0D0D" }}>{username}</span>
            {" "}— you can see and edit your own records only
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Mode tabs */}
      <div className="mb-6 flex gap-2 border-b" style={{ borderColor: "#E4E4E4" }}>
        <button
          onClick={() => handleModeSwitch("samba2")}
          className="px-6 py-3 text-sm font-semibold border-b-2 transition-colors"
          style={formMode === "samba2"
            ? { borderColor: "#C60C30", color: "#C60C30" }
            : { borderColor: "transparent", color: "#646464" }}
        >
          SAMBA 2
        </button>
        <button
          onClick={() => handleModeSwitch("adhear")}
          className="px-6 py-3 text-sm font-semibold border-b-2 transition-colors"
          style={formMode === "adhear"
            ? { borderColor: "#00A1B5", color: "#00A1B5" }
            : { borderColor: "transparent", color: "#646464" }}
        >
          ADHEAR
        </button>
      </div>

      {/* Form */}
      <div className="mb-8">
        {formMode === "samba2" ? (
          <TrackerForm
            editingRecord={editingRecord}
            onCancelEdit={() => setEditingRecord(null)}
            onSuccess={() => setEditingRecord(null)}
          />
        ) : (
          <AdhearForm
            editingRecord={editingRecord}
            onCancelEdit={() => setEditingRecord(null)}
            onSuccess={() => setEditingRecord(null)}
          />
        )}
      </div>

      {/* Records table — own records only */}
      <div className="bg-white rounded-lg border shadow-sm" style={{ borderColor: "#E4E4E4" }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#E4E4E4" }}>
          <h2 className="text-lg font-semibold" style={{ color: "#0D0D0D" }}>
            Your {formMode === "samba2" ? "SAMBA 2" : "ADHEAR"} Records
          </h2>
          <span className="text-sm" style={{ color: "#979594" }}>
            {records?.length ?? 0} record{records?.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Serial</TableHead>
                  {formMode === "samba2" && <TableHead>Implant Type</TableHead>}
                  <TableHead className="max-w-[180px]">Issue Description</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead className="max-w-[180px]">Next Action</TableHead>
                  <TableHead className="text-right sticky right-0 bg-white border-l">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <Skeleton className="w-full h-8" />
                    </TableCell>
                  </TableRow>
                ) : !records?.length ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center" style={{ color: "#979594" }}>
                      No records yet — submit your first record above
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r: Record, i: number) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.patientName}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.dob}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.serial}</TableCell>
                      {formMode === "samba2" && <TableCell className="whitespace-nowrap">{r.implant}</TableCell>}
                      <TableCell className="truncate max-w-[180px]" title={r.issueDescription}>{r.issueDescription}</TableCell>
                      <TableCell>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={r.resolved === "Yes"
                            ? { background: "#dcfce7", color: "#166534" }
                            : r.resolved === "No"
                            ? { background: "#fee2e2", color: "#991b1b" }
                            : { background: "#F0F0F0", color: "#646464" }}
                        >
                          {r.resolved || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="truncate max-w-[180px]" title={r.nextAction}>{r.nextAction}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-white border-l">
                        <div className="flex justify-end gap-2 px-2">
                          <Button variant="ghost" size="sm" onClick={() => setPrintingRecord({ record: r, rowNumber: i + 1 })}>
                            Report
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(r)}>
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

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
