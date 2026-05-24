import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateRecord, 
  useUpdateRecord,
  getListRecordsQueryKey,
  getGetRecordStatsQueryKey
} from "@workspace/api-client-react";
import { Record } from "@workspace/api-client-react/src/generated/api.schemas";
import { recordSchema, RecordFormValues, defaultRecordValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const SKIN_OPTIONS = ["Normal", "Redness", "Swelling", "Discomfort"];
const VISUAL_OPTIONS = ["Housing intact", "Cover damage", "Corrosion", "Moisture related issues"];
const AUDIO_OPTIONS = ["No sound/output", "Weak Sound", "Sound too Loud", "Distorted/Muffled Sound", "Intermittent Sound Cutting", "Feedback/Whistling"];
const PHYSICAL_OPTIONS = ["Processor Won't power on", "Battery draining too quickly", "Battery Compartment Issues", "Cover damage", "Processor falls off frequently", "Skin irritation at implant site"];
const ACCESSORY_OPTIONS = ["Attachment Clip malfunction", "WaterWear Problems", "Program switching failure", "Volume control Unresponsive"];
const CONNECTIVITY_OPTIONS = ["SAMBA 2 GO pairing failure", "Streaming audio problems", "SAMBA 2 remote app malfunction"];
const STEPS_OPTIONS = ["Replaced battery", "Cleaned device components", "Battery contacts cleaned", "Magnet strength verified", "SAMBA 2 GO re-paired", "Remote App reinstalled"];

export function TrackerForm({ 
  editingRecord, 
  onCancelEdit,
  onSuccess 
}: { 
  editingRecord: Record | null; 
  onCancelEdit: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: defaultRecordValues,
  });

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        patientName: editingRecord.patientName || "",
        dob: editingRecord.dob || "",
        phone: editingRecord.phone || "",
        serial: editingRecord.serial || "",
        implant: editingRecord.implant || "",
        issueDescription: editingRecord.issueDescription || "",
        conditions: editingRecord.conditions || "",
        skin: editingRecord.skin || [],
        visual: editingRecord.visual || [],
        audio: editingRecord.audio || [],
        physical: editingRecord.physical || [],
        accessory: editingRecord.accessory || [],
        connectivity: editingRecord.connectivity || [],
        steps: editingRecord.steps || [],
        resolved: editingRecord.resolved || "",
        resolvedHow: editingRecord.resolvedHow || "",
        nextAction: editingRecord.nextAction || "",
        contactName: editingRecord.contactName || "",
        contactEmail: editingRecord.contactEmail || "",
      });
    } else {
      form.reset(defaultRecordValues);
    }
  }, [editingRecord, form]);

  const createRecord = useCreateRecord({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordStatsQueryKey() });
        toast({ title: "Record created successfully" });
        form.reset(defaultRecordValues);
        onSuccess();
      },
      onError: () => {
        toast({ title: "Failed to create record", variant: "destructive" });
      }
    }
  });

  const updateRecord = useUpdateRecord({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordStatsQueryKey() });
        toast({ title: "Record updated successfully" });
        form.reset(defaultRecordValues);
        onSuccess();
      },
      onError: () => {
        toast({ title: "Failed to update record", variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: RecordFormValues) => {
    if (editingRecord) {
      updateRecord.mutate({ id: editingRecord.id, data });
    } else {
      createRecord.mutate({ data });
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  function CheckboxGroup({ name, label, options }: { name: keyof RecordFormValues, label: string, options: string[] }) {
    return (
      <FormField
        control={form.control}
        name={name as any}
        render={() => (
          <FormItem>
            <div className="mb-2">
              <FormLabel className="text-base">{label}</FormLabel>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {options.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name={name as any}
                  render={({ field }) => {
                    const values = field.value as string[] || [];
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={values?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...values, item])
                                : field.onChange(
                                    values?.filter(
                                      (value) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {item}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          {editingRecord ? (
            <>
              Editing Record <Badge variant="secondary" className="ml-2">#{editingRecord.id}</Badge>
            </>
          ) : (
            "New Patient Record"
          )}
        </CardTitle>
        {editingRecord && (
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            Cancel Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Patient & Device Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="patientName" render={({ field }) => (
                  <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dob" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="serial" render={({ field }) => (
                  <FormItem><FormLabel>Device Serial Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="implant" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Implant Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Bonebridge (BCI 601/602)">Bonebridge (BCI 601/602)</SelectItem>
                        <SelectItem value="Soundbridge (VORP 503)">Soundbridge (VORP 503)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Issue Description & Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="issueDescription" render={({ field }) => (
                  <FormItem><FormLabel>Issue Description</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="conditions" render={({ field }) => (
                  <FormItem><FormLabel>Conditions</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Troubleshooting Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <CheckboxGroup name="skin" label="Skin Issues" options={SKIN_OPTIONS} />
                <CheckboxGroup name="visual" label="Visual Inspection" options={VISUAL_OPTIONS} />
                <CheckboxGroup name="audio" label="Audio Issues" options={AUDIO_OPTIONS} />
                <CheckboxGroup name="physical" label="Physical Issues" options={PHYSICAL_OPTIONS} />
                <CheckboxGroup name="accessory" label="Accessory Issues" options={ACCESSORY_OPTIONS} />
                <CheckboxGroup name="connectivity" label="Connectivity Issues" options={CONNECTIVITY_OPTIONS} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Resolution & Next Steps</h3>
              <div className="mb-6">
                <CheckboxGroup name="steps" label="Steps Taken" options={STEPS_OPTIONS} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField control={form.control} name="resolved" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolved?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contactEmail" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="resolvedHow" render={({ field }) => (
                  <FormItem><FormLabel>Resolved How</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nextAction" render={({ field }) => (
                  <FormItem><FormLabel>Next Action</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isPending} className="px-8">
                {isPending ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
