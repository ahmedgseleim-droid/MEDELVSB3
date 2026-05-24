import { useRef } from "react";
import { Record } from "@workspace/api-client-react/src/generated/api.schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PatientReportModalProps {
  record: Record | null;
  rowNumber: number;
  onClose: () => void;
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={`flex items-start gap-2 text-sm ${checked ? "text-foreground" : "text-muted-foreground/50"}`}>
      <span className="mt-0.5 shrink-0">
        {checked ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
            <rect x="0.5" y="0.5" width="13" height="13" rx="2.5" stroke="currentColor" />
            <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/30">
            <rect x="0.5" y="0.5" width="13" height="13" rx="2.5" stroke="currentColor" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/30 pb-1 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-1 text-sm mb-1">
      <span className="font-medium text-muted-foreground shrink-0 w-36">{label}:</span>
      <span className="text-foreground">{value || "—"}</span>
    </div>
  );
}

const SAMBA2_SKIN = ["Normal", "Redness", "Swelling", "Discomfort"];
const SAMBA2_VISUAL = ["Housing intact", "Cover damage", "Corrosion", "Moisture related issues"];
const SAMBA2_AUDIO = ["No sound/output", "Weak Sound", "Sound too Loud", "Distorted/Muffled Sound", "Intermittent Sound Cutting", "Feedback/Whistling"];
const SAMBA2_PHYSICAL = ["Processor Won't power on", "Battery draining too quickly", "Battery Compartment Issues", "Cover damage", "Processor falls off frequently", "Skin irritation at implant site"];
const SAMBA2_ACCESSORY = ["Attachment Clip malfunction", "WaterWear Problems", "Program switching failure", "Volume control Unresponsive"];
const SAMBA2_CONNECTIVITY = ["SAMBA 2 GO pairing failure", "Streaming audio problems", "SAMBA 2 remote app malfunction"];
const SAMBA2_STEPS = ["Replaced battery", "Cleaned device components", "Battery contacts cleaned", "Magnet strength verified", "SAMBA 2 GO re-paired", "Remote App reinstalled"];

const ADHEAR_AUDIO = ["No sound from device", "Distorted or unclear sound", "Intermittent sound cutting out", "Volume too low even at maximum setting", "Feedback/whistling sounds"];
const ADHEAR_PHYSICAL = ["Device won't turn on", "Battery draining too quickly", "Visible damage to device", "Adhesive not sticking properly"];
const ADHEAR_CONNECTIVITY = ["Issues with connectivity accessories"];
const ADHEAR_OTHER = ["Skin irritation where device is worn", "Device feels uncomfortable", "Other"];
const ADHEAR_ADAPTER = ["Changed location of Adhesive Adapter", "Cleaning/Checking site of placement for obstructions", "Replaced Adhesive Adapter"];
const ADHEAR_PROCESSOR = ["Replaced battery", "Cleaned device components", "Restarted the device", "Checking coupling plate (Fixed or Loose)", "Other"];

export function PatientReportModal({ record, rowNumber, onClose }: PatientReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const isAdhear = record.implant === "ADHEAR";
  const has = (arr: string[] | null | undefined, val: string) => (arr ?? []).includes(val);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=850,height=1100");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Patient Report — ${record.patientName}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #111; background: white; padding: 28px 36px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #7f1212; }
          .header-title { font-size: 17px; font-weight: 700; color: #7f1212; }
          .header-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
          .header-meta { text-align: right; font-size: 10px; color: #666; }
          .section { margin-bottom: 16px; }
          .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7f1212; border-bottom: 1px solid #e0c0c0; padding-bottom: 4px; margin-bottom: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; }
          .info-row { display: flex; gap: 4px; }
          .info-label { font-weight: 600; color: #555; min-width: 120px; }
          .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px; }
          .check-item { display: flex; align-items: flex-start; gap: 5px; line-height: 1.4; }
          .check-box { width: 11px; height: 11px; border: 1px solid #aaa; border-radius: 2px; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; }
          .check-box.checked { border-color: #7f1212; background: #7f1212; color: white; }
          .check-box.checked::after { content: '✓'; font-size: 8px; color: white; line-height: 1; }
          .check-label { color: #333; }
          .check-label.unchecked { color: #bbb; }
          .text-block { background: #f9f9f9; border: 1px solid #e8e8e8; border-radius: 4px; padding: 7px 9px; min-height: 40px; font-size: 11px; color: #333; white-space: pre-wrap; }
          .resolved-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; }
          .resolved-yes { background: #dcfce7; color: #166534; }
          .resolved-no { background: #fee2e2; color: #991b1b; }
          .resolved-dash { background: #f3f4f6; color: #666; }
          .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 9px; color: #999; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
        <div class="footer">
          <span>MEDEL — ${isAdhear ? "ADHEAR" : "SAMBA 2"} Troubleshooting Report</span>
          <span>Record #${rowNumber} &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</span>
        </div>
        <script>window.onload = function(){ window.print(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const resolvedClass =
    record.resolved === "Yes"
      ? "bg-green-100 text-green-800"
      : record.resolved === "No"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-600";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle className="text-primary">
            Patient Report — {record.patientName}
          </DialogTitle>
          <Button onClick={handlePrint} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </DialogHeader>

        <div ref={printRef} id="print-content" className="space-y-0">
          <div className="header flex justify-between items-start border-b-2 border-primary pb-3 mb-5">
            <div>
              <div className="text-lg font-bold text-primary">MEDEL — {isAdhear ? "ADHEAR" : "SAMBA 2"} Troubleshooting Report</div>
              <div className="text-xs text-muted-foreground mt-0.5">Patient Case Record</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>Record #{rowNumber}</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <Section title="Patient & Device Information">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <InfoRow label="Patient Name" value={record.patientName} />
              <InfoRow label="Date of Birth" value={record.dob} />
              <InfoRow label="Contact Phone" value={record.phone} />
              <InfoRow label="Serial Number" value={record.serial} />
              {!isAdhear && <InfoRow label="Implant Type" value={record.implant} />}
            </div>
          </Section>

          <Section title="Issue Description">
            <div className="bg-muted/40 rounded border p-3 text-sm whitespace-pre-wrap min-h-[48px]">
              {record.issueDescription || "—"}
            </div>
          </Section>

          {record.conditions && (
            <Section title={isAdhear ? "User Feedback" : "Conditions"}>
              <div className="bg-muted/40 rounded border p-3 text-sm whitespace-pre-wrap min-h-[40px]">
                {record.conditions}
              </div>
            </Section>
          )}

          {isAdhear ? (
            <>
              <Section title="Troubleshooting Checklist">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Audio Quality Issues</p>
                    <div className="space-y-1.5">
                      {ADHEAR_AUDIO.map((o) => <CheckItem key={o} label={o} checked={has(record.audio, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Physical Device Issues</p>
                    <div className="space-y-1.5">
                      {ADHEAR_PHYSICAL.map((o) => <CheckItem key={o} label={o} checked={has(record.physical, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Connectivity Issues</p>
                    <div className="space-y-1.5">
                      {ADHEAR_CONNECTIVITY.map((o) => <CheckItem key={o} label={o} checked={has(record.connectivity, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Other Issues</p>
                    <div className="space-y-1.5">
                      {ADHEAR_OTHER.map((o) => <CheckItem key={o} label={o} checked={has(record.accessory, o)} />)}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Troubleshooting Steps Attempted">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Adhesive Adapter</p>
                    <div className="space-y-1.5">
                      {ADHEAR_ADAPTER.map((o) => <CheckItem key={o} label={o} checked={has(record.skin, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ADHEAR Audio Processor</p>
                    <div className="space-y-1.5">
                      {ADHEAR_PROCESSOR.map((o) => <CheckItem key={o} label={o} checked={has(record.steps, o)} />)}
                    </div>
                  </div>
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section title="Troubleshooting Checklist">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Skin Issues</p>
                    <div className="space-y-1.5">
                      {SAMBA2_SKIN.map((o) => <CheckItem key={o} label={o} checked={has(record.skin, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Visual Inspection</p>
                    <div className="space-y-1.5">
                      {SAMBA2_VISUAL.map((o) => <CheckItem key={o} label={o} checked={has(record.visual, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Audio Issues</p>
                    <div className="space-y-1.5">
                      {SAMBA2_AUDIO.map((o) => <CheckItem key={o} label={o} checked={has(record.audio, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Physical Issues</p>
                    <div className="space-y-1.5">
                      {SAMBA2_PHYSICAL.map((o) => <CheckItem key={o} label={o} checked={has(record.physical, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Accessory Issues</p>
                    <div className="space-y-1.5">
                      {SAMBA2_ACCESSORY.map((o) => <CheckItem key={o} label={o} checked={has(record.accessory, o)} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Connectivity Issues</p>
                    <div className="space-y-1.5">
                      {SAMBA2_CONNECTIVITY.map((o) => <CheckItem key={o} label={o} checked={has(record.connectivity, o)} />)}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Steps Taken">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                  {SAMBA2_STEPS.map((o) => <CheckItem key={o} label={o} checked={has(record.steps, o)} />)}
                </div>
              </Section>
            </>
          )}

          <Section title="Resolution">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${resolvedClass}`}>
                  {record.resolved || "Not set"}
                </span>
              </div>
              {record.resolved === "Yes" && record.resolvedHow && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Resolved How</p>
                  <p className="text-sm">{record.resolvedHow}</p>
                </div>
              )}
              {record.resolved === "No" && record.nextAction && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Next Action</p>
                  <p className="text-sm">{record.nextAction}</p>
                </div>
              )}
            </div>
          </Section>

          {(record.contactName || record.contactEmail) && (
            <Section title="Contact">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <InfoRow label="Contact Name" value={record.contactName} />
                <InfoRow label="Contact Email" value={record.contactEmail} />
              </div>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
