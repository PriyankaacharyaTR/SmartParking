import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, X, Plus, Calendar, Check } from "lucide-react";

/**
 * Email reports feature for scheduling analytics reports
 */
export function EmailReports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");
  const [emailRecipients, setEmailRecipients] = useState([
    { id: 1, email: "" }
  ]);

  const handleAddRecipient = () => {
    setEmailRecipients([
      ...emailRecipients,
      { id: Date.now(), email: "" }
    ]);
  };

  const handleRemoveRecipient = (id: number) => {
    if (emailRecipients.length > 1) {
      setEmailRecipients(emailRecipients.filter(recipient => recipient.id !== id));
    }
  };

  const handleEmailChange = (id: number, value: string) => {
    setEmailRecipients(
      emailRecipients.map(recipient => 
        recipient.id === id ? { ...recipient, email: value } : recipient
      )
    );
  };

  const handleScheduleSubmit = () => {
    // Here you would typically call an API to set up the schedule
    // For now, we'll just show a success message
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setIsDialogOpen(false);
    }, 2000);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
        onClick={() => setIsDialogOpen(true)}
      >
        <Mail className="h-4 w-4 mr-1" />
        Schedule Reports
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Email Reports</DialogTitle>
            <DialogDescription>
              Set up automatic email reports for your analytics dashboard.
            </DialogDescription>
          </DialogHeader>

          {scheduleSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-center">Report Schedule Created!</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Your reports will be delivered according to the schedule.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="report-type" className="text-right">
                    Report Type
                  </Label>
                  <Select defaultValue="full">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Analytics Report</SelectItem>
                      <SelectItem value="revenue">Revenue Report</SelectItem>
                      <SelectItem value="occupancy">Occupancy Trends</SelectItem>
                      <SelectItem value="vehicles">Vehicle Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">
                    Frequency
                  </Label>
                  <Select 
                    defaultValue={scheduleFrequency}
                    onValueChange={setScheduleFrequency}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleFrequency === "weekly" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="day" className="text-right">
                      Day
                    </Label>
                    <Select defaultValue="monday">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {scheduleFrequency === "monthly" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(28)].map((_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                        <SelectItem value="last">Last day of month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Recipients</Label>
                  <div className="col-span-3 space-y-2">
                    {emailRecipients.map((recipient) => (
                      <div key={recipient.id} className="flex gap-2">
                        <Input
                          type="email"
                          value={recipient.email}
                          onChange={(e) => handleEmailChange(recipient.id, e.target.value)}
                          placeholder="email@example.com"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRecipient(recipient.id)}
                          disabled={emailRecipients.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={handleAddRecipient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recipient
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleSubmit}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Reports
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
