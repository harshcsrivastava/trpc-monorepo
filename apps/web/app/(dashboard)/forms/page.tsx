"use client";
import { useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useCreateForm } from "~/hooks/api/form";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateFormSubmit = (formData: { title: string; description: string }) => {
    void formData;
  };

  const { createFormWithTitleAndDescriptionAsync } = useCreateForm();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreateFormSubmit({
      title: title.trim(),
      description: description.trim(),
    });
    try {
      const { id } = await createFormWithTitleAndDescriptionAsync({ title, description });
      setOpen(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create form:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-foreground text-white hover:bg-[#14b84d]/90">
                  Create New Form
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-[#111214] border-[#626262] text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-[20px] font-black uppercase tracking-[0.08em]">
                    Create New Form
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-[12px] uppercase tracking-[0.12em]">
                    Add a title and description before handing off to your form handler.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Enter form title"
                      className="h-11 bg-[#0b0d0e] border-[#626262] text-foreground placeholder:text-muted-foreground uppercase tracking-[0.08em]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Enter form description"
                      className="min-h-28 bg-[#0b0d0e] border-[#626262] text-foreground placeholder:text-muted-foreground uppercase tracking-[0.08em]"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#14b84d] text-white hover:bg-[#14b84d]/90">
                      Create Form
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
