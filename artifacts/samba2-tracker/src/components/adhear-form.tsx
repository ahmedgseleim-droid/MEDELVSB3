import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateRecord,
  useUpdateRecord,
  getListRecordsQueryKey,
  getGetRecordStatsQueryKey,
} from "@workspace/api-client-react";
import { Record } from "@workspace/api-client-react/src/generated/api.schemas";
import { recordSchema, RecordFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ADHEAR_AUDIO_OPTIONS = [
  "No sound from device",
  "Distorted or unclear sound",
  "Intermittent sound cutting out",
  "Volume too low even at maximum setting",
  "Feedback/whistling sounds",
];

const ADHEAR_PHYSICAL_OPTIONS = [
  "Device won't turn on",
  "Battery draining too quickly",
  "Visible damage to device",
  "Adhesive not sticking properly",
];

const ADHEAR_CONNECTIVITY_OPTIONS = [
  "Issues with connectivity accessories",
];

const ADHEAR_OTHER_OPTIONS = [
  "Skin irritation where device is worn",
  "Device feels uncomfortable",
  "Other",
];

const ADHEAR_STEPS_ADAPTER = [
  "Changed location of Adhesive Adapter",
  "Cleaning/Checking site of placement for obstructions",
  "Replaced Adhesive Adapter",
];

const ADHEAR_STEPS_PROCESSOR = [
  "Replaced battery",
  "Cleaned device components",
  "Restarted the device",
  "Checking coupling plate (Fixed or Loose)",
  "Other",
];

const defaultAdhearValues: RecordFormValues = {
  patientName: "",
  dob: "",
  phone: "",
  serial: "",
  implant: "ADHEAR",
  issueDescription: "",
  conditions: "",
  skin: [],
  visual: [],
  audio: [],
  physical: [],
  accessory: [],
  connectivity: [],
  steps: [],
  resolved: "",
  resolvedHow: "",
  nextAction: "",
  contactName: "",
  contactEmail: "",
};

export function AdhearForm({
  editingRecord,
  onCancelEdit,
  onSuccess,
}: {
  editingRecord: Record | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: defaultAdhearValues,
  });

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        patientName: editingRecord.patientName || "",
        dob: editingRecord.dob || "",
        phone: editingRecord.phone || "",
        serial: editingRecord.serial || "",
        implant: "ADHEAR",
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
      form.reset(defaultAdhearValues);
    }
  }, [editingRecord, form]);

  const createRecord = useCreateRecord({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordStatsQueryKey() });
        toast({ title: "ADHEAR record created successfully" });
        form.reset(defaultAdhearValues);
        onSuccess();
      },
      onError: () => {
        toast({ title: "Failed to create record", variant: "destructive" });
      },
    },
  });

  const updateRecord = useUpdateRecord({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecordStatsQueryKey() });
        toast({ title: "ADHEAR record updated successfully" });
        form.reset(defaultAdhearValues);
        onSuccess();
      },
      onError: () => {
        toast({ title: "Failed to update record", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: RecordFormValues) => {
    const payload = { ...data, implant: "ADHEAR" };
    if (editingRecord) {
      updateRecord.mutate({ id: editingRecord.id, data: payload });
    } else {
      createRecord.mutate({ data: payload });
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  function CheckboxGroup({
    name,
    label,
    options,
  }: {
    name: keyof RecordFormValues;
    label: string;
    options: string[];
  }) {
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
                    const values = (field.value as string[]) || [];
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={values.includes(item)}
                            onCheckedChange={(checked) =>
                              checked
                                ? field.onChange([...values, item])
                                : field.onChange(values.filter((v) => v !== item))
                            }
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{item}</FormLabel>
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
              Editing ADHEAR Record{" "}
              <Badge variant="secondary" className="ml-2">
                #{editingRecord.id}
              </Badge>
            </>
          ) : (
            "New ADHEAR Patient Record"
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
              <h3 className="text-lg font-medium border-b pb-2">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Device Issue Description</h3>
              <FormField
                control={form.control}
                name="issueDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please describe the problem the user is experiencing with the ADHEAR device
                    </FormLabel>
                    <FormControl>
                      <Textarea className="h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">User Feedback</h3>
              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      When did the problem first occur? Constant or intermittent? Any specific
                      conditions?
                    </FormLabel>
                    <FormControl>
                      <Textarea className="h-28" placeholder="e.g. Started 2 weeks ago, intermittent, happens mostly during outdoor use..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Troubleshooting Checklist
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <CheckboxGroup
                  name="audio"
                  label="Audio Quality Issues"
                  options={ADHEAR_AUDIO_OPTIONS}
                />
                <CheckboxGroup
                  name="physical"
                  label="Physical Device Issues"
                  options={ADHEAR_PHYSICAL_OPTIONS}
                />
                <CheckboxGroup
                  name="connectivity"
                  label="Connectivity Issues"
                  options={ADHEAR_CONNECTIVITY_OPTIONS}
                />
                <CheckboxGroup
                  name="accessory"
                  label="Other Issues"
                  options={ADHEAR_OTHER_OPTIONS}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Troubleshooting Steps Attempted</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <CheckboxGroup
                  name="skin"
                  label="Adhesive Adapter"
                  options={ADHEAR_STEPS_ADAPTER}
                />
                <CheckboxGroup
                  name="steps"
                  label="ADHEAR Audio Processor"
                  options={ADHEAR_STEPS_PROCESSOR}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Resolution & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="resolved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was the issue resolved?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="resolvedHow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>If YES — how was it resolved?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resolution method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="With guidance">With guidance</SelectItem>
                          <SelectItem value="Required service center repair">
                            Required service center repair
                          </SelectItem>
                          <SelectItem value="Referred to Audiologist/Changed fitting parameters">
                            Referred to Audiologist / Changed fitting parameters
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>If NO — next course of action</FormLabel>
                      <FormControl>
                        <Textarea className="h-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isPending} className="px-8">
                {isPending ? "Saving..." : "Save ADHEAR Record"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
