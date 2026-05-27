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
import { useCreateForm, useGetForm } from "~/hooks/api/form";
import FormList from "~/components/FormList";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleCreateFormSubmit = (formData: { title: string; description: string }) => {
    void formData;
  };

  const { createFormWithTitleAndDescriptionAsync } = useCreateForm();
  const { formsDataById, isLoading, isFetching } = useGetForm({ pageSize, page });

  const totalCount = formsDataById?.metaData.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = formsDataById?.metaData.start ?? 0;
  const end = formsDataById?.metaData.end ?? 0;
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreateFormSubmit({
      title: title.trim(),
      description: description.trim(),
    });
    try {
      await createFormWithTitleAndDescriptionAsync({ title, description });
      setOpen(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create form:", error);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Header  Forms*/}
          <div className="px-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Forms</p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Create and manage form templates
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  A shared dashboard layout keeps this route aligned with the rest of the admin
                  shell while giving you a dedicated surface for structured input.
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
                        <Button
                          type="submit"
                          className="bg-[#14b84d] text-white hover:bg-[#14b84d]/90"
                        >
                          Create Form
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="px-0">
            <div className="px-6 py-3 text-[12px] font-black tracking-[0.12em] uppercase text-[#7d7d7d] grid grid-cols-24 gap-4 place-items-center border-b border-[#626262]">
              <div className="col-span-12">Form</div>
              <div className="col-span-3 text-center">Responses</div>
              <div className="col-span-3">Visibility</div>
              <div className="col-span-3">Updated</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>

          <div>
            {(isLoading || isFetching) && <p>Loading...</p>}
            {!isLoading && <FormList forms={formsDataById?.forms ?? []} />}
          </div>

          <div className="px-6 py-4 flex items-center justify-between text-[12px] text-[#9b9b9b]">
            <div>
              Showing {start} to {end} of {totalCount} forms
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e] disabled:opacity-50"
              >
                ‹
              </button>
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={pageNumber === page ? "page" : undefined}
                  className={`w-10 h-10 rounded-[6px] border ${
                    pageNumber === page
                      ? "border-[#2c6f25] bg-[#122312] text-white"
                      : "border-[#626262] bg-[#0b0d0e]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                className="w-10 h-10 rounded-[6px] border border-[#626262] bg-[#0b0d0e] disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
