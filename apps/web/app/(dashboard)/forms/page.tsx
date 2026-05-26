import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Forms</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create and manage form templates
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              A shared dashboard layout keeps this route aligned with the rest of the admin shell
              while giving you a dedicated surface for structured input.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button>Save form</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] lg:px-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>New intake form</CardTitle>
            <CardDescription>
              Capture the fields your team needs before sending work into the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="form-name">Form name</FieldLabel>
                  <Input id="form-name" placeholder="Customer onboarding" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="form-owner">Owner</FieldLabel>
                  <Input id="form-owner" placeholder="Operations team" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="form-type">Submission type</FieldLabel>
                  <Select defaultValue="request">
                    <SelectTrigger id="form-type">
                      <SelectValue placeholder="Choose a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="request">Request</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Use this to route submissions into the correct workflow.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="form-description">Description</FieldLabel>
                  <Textarea
                    id="form-description"
                    placeholder="Describe what this form collects and who reviews it."
                    className="min-h-28"
                  />
                </Field>

                <Field className="items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <FieldLabel htmlFor="form-publish">Publish immediately</FieldLabel>
                    <FieldDescription>
                      Make the form available to the team as soon as it is saved.
                    </FieldDescription>
                  </div>
                  <Switch id="form-publish" />
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Publishing checklist</CardTitle>
              <CardDescription>Keep the form focused before rolling it out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Verify each field maps to a real workflow step.</p>
              <p>• Keep labels short so the form reads well on mobile.</p>
              <p>• Use the dashboard route to monitor completed submissions.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
              <CardDescription>Navigate back into the shared dashboard shell.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Create an account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
