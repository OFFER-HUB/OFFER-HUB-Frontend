"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import {
  uploadOrderAttachment,
  deleteOrderAttachment,
  addOrderProjectNote,
} from "@/lib/api/orders";
import type { Order, OrderStatus, OrderAttachment, OrderProjectNote } from "@/types/order.types";

interface OrderDeliverablesCardProps {
  orderId: string;
  orderStatus: OrderStatus;
  metadata?: {
    attachments?: OrderAttachment[];
    notes?: OrderProjectNote[];
    [key: string]: unknown;
  };
  isBuyer: boolean;
  isSeller: boolean;
  onOrderUpdated: (order: Order) => void;
}

type TabType = "files" | "notes";

export function OrderDeliverablesCard({
  orderId,
  orderStatus,
  metadata,
  isBuyer,
  isSeller,
  onOrderUpdated,
}: OrderDeliverablesCardProps): React.JSX.Element {
  const { token, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInProgress = [
    "IN_PROGRESS",
    "DELIVERED",
    "ESCROW_FUNDED",
    "RELEASE_REQUESTED",
    "RELEASED",
    "REFUND_REQUESTED",
    "REFUNDED",
    "DISPUTED",
    "CLOSED",
  ].includes(orderStatus);

  const [activeTab, setActiveTab] = useState<TabType>("files");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<string>(
    isBuyer ? "reference" : "deliverable"
  );
  const [fileNote, setFileNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [noteMessage, setNoteMessage] = useState("");
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Lightbox Image Preview Modal state
  const [previewImage, setPreviewImage] = useState<OrderAttachment | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewImage(null);
      }
    };
    if (previewImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  const attachments = metadata?.attachments || [];
  const notes = metadata?.notes || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setStatusMessage({
          type: "error",
          text: "File size exceeds 10MB limit. Please select a smaller file.",
        });
        return;
      }
      setSelectedFile(file);
      setStatusMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return;

    try {
      setIsUploading(true);
      setStatusMessage(null);

      const updated = await uploadOrderAttachment(
        token,
        orderId,
        selectedFile,
        fileCategory,
        fileNote
      );

      onOrderUpdated(updated);
      setSelectedFile(null);
      setFileNote("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setStatusMessage({
        type: "success",
        text: "File uploaded successfully to cloud storage.",
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to upload file. Please try again.";
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!token) return;
    try {
      setDeletingId(attachmentId);
      setStatusMessage(null);

      const updated = await deleteOrderAttachment(token, orderId, attachmentId);
      onOrderUpdated(updated);
      if (previewImage?.id === attachmentId) {
        setPreviewImage(null);
      }
      setStatusMessage({
        type: "success",
        text: "File removed from workspace.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete file.";
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim() || !token) return;

    try {
      setIsPostingNote(true);
      setStatusMessage(null);

      const updated = await addOrderProjectNote(token, orderId, noteMessage.trim());
      onOrderUpdated(updated);
      setNoteMessage("");
      setStatusMessage({
        type: "success",
        text: "Project update recorded.",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to post update.";
      setStatusMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setIsPostingNote(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      <div className={cn(NEUMORPHIC_CARD, "p-6 sm:p-7 border border-white/80 space-y-6")}>
        {/* Header & Neumorphic Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-primary flex items-center justify-center shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]">
                <Icon path={isInProgress ? ICON_PATHS.folder : ICON_PATHS.document} size="sm" />
              </div>
              <h2 className="text-base font-bold text-[#111827]">
                {isInProgress ? "Deliverables & Evidence Hub" : "Project References & Requirements"}
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 pl-0.5 leading-relaxed">
              {isInProgress
                ? "Exchange project references, work evidence, and final deliverables securely in the cloud."
                : "Upload wireframes, design references, or technical specs so the specialist understands your vision."}
            </p>
          </div>

          {/* Neumorphic Tab Switcher Track */}
          <div className="p-1.5 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/60 flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2",
                activeTab === "files"
                  ? "bg-white text-primary font-bold shadow-[3px_3px_7px_#d1d5db,-3px_-3px_7px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary font-medium hover:bg-white/40"
              )}
            >
              <Icon path={ICON_PATHS.document} size="sm" className="w-3.5 h-3.5" />
              <span>{isInProgress ? "Files & Deliverables" : "Files & Specs"}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
                  activeTab === "files"
                    ? "bg-primary text-white"
                    : "bg-black/5 text-text-secondary"
                )}
              >
                {attachments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2",
                activeTab === "notes"
                  ? "bg-white text-primary font-bold shadow-[3px_3px_7px_#d1d5db,-3px_-3px_7px_#ffffff]"
                  : "text-text-secondary hover:text-text-primary font-medium hover:bg-white/40"
              )}
            >
              <Icon
                path={isInProgress ? ICON_PATHS.chat : ICON_PATHS.lock}
                size="sm"
                className="w-3.5 h-3.5"
              />
              <span>Project Updates</span>
              {!isInProgress ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                  Locked
                </span>
              ) : (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
                    activeTab === "notes"
                      ? "bg-primary text-white"
                      : "bg-black/5 text-text-secondary"
                  )}
                >
                  {notes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Inline Feedback Banner (Soft Neumorphic Inset) */}
        {statusMessage && (
          <div
            className={cn(
              "p-4 rounded-2xl text-xs flex items-center justify-between border border-white/80",
              statusMessage.type === "success"
                ? "bg-emerald-50/80 text-emerald-800 shadow-[inset_2px_2px_4px_#a7f3d0,inset_-2px_-2px_4px_#ffffff]"
                : "bg-rose-50/80 text-rose-800 shadow-[inset_2px_2px_4px_#fecdd3,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                path={
                  statusMessage.type === "success"
                    ? ICON_PATHS.check
                    : ICON_PATHS.alertCircle
                }
                size="sm"
                className={
                  statusMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              />
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-text-secondary hover:text-text-primary cursor-pointer p-1"
            >
              <Icon path={ICON_PATHS.close} size="sm" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Files & Deliverables / Specifications */}
        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Neumorphic Sunken Upload Panel */}
            <form
              onSubmit={handleUpload}
              className="p-5 sm:p-6 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white text-primary flex items-center justify-center shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
                    <Icon path={ICON_PATHS.upload} size="sm" className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    {isInProgress
                      ? "Upload Deliverable or Evidence"
                      : "Attach References & Requirements"}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-text-secondary bg-white px-2.5 py-1 rounded-lg shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
                  Max 10MB • Cloud Storage
                </span>
              </div>

              {/* Category Selector with Raised Neumorphic Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Attachment Purpose
                </label>
                <div className="flex flex-wrap gap-2">
                  {(isBuyer
                    ? [
                        { id: "reference", label: "Design Reference / Wireframe" },
                        { id: "brief", label: "Requirements & Brief" },
                        { id: "evidence", label: "Assets & Brand Materials" },
                      ]
                    : [
                        { id: "deliverable", label: "Final Deliverable" },
                        { id: "evidence", label: "Work Evidence / WIP" },
                        { id: "reference", label: "Source Files" },
                      ]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFileCategory(cat.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer",
                        fileCategory === cat.id
                          ? "bg-primary text-white font-bold shadow-[3px_3px_8px_rgba(79,70,229,0.35)]"
                          : "bg-white text-text-secondary hover:text-text-primary font-medium shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] hover:shadow-[1px_1px_3px_#d1d5db,-1px_-1px_3px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunken Neumorphic File & Note Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                <div className="sm:col-span-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-text-secondary file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white file:text-primary file:shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:file:shadow-[1px_1px_3px_#d1d5db] file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-6">
                  <input
                    type="text"
                    placeholder="Optional brief description or note..."
                    value={fileNote}
                    onChange={(e) => setFileNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-white/60 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Selected File Review & Neumorphic Submit Button */}
              {selectedFile && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/5">
                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon path={ICON_PATHS.document} size="sm" className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-text-primary truncate max-w-[220px]">
                      {selectedFile.name}
                    </span>
                    <span className="font-mono text-text-secondary">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2",
                      "shadow-[3px_3px_8px_#cbd5e1] hover:shadow-[5px_5px_12px_#cbd5e1] active:scale-[0.99]",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {isUploading ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Uploading to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Icon path={ICON_PATHS.upload} size="sm" />
                        <span>Upload to Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Attached Files Section */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Attached Project Files ({attachments.length})
                </h3>
                <span className="text-[11px] text-text-secondary">
                  Click any image to enlarge and preview
                </span>
              </div>

              {attachments.length === 0 ? (
                <div className="p-8 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/60 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-white text-text-secondary/50 mx-auto flex items-center justify-center shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]">
                    <Icon path={ICON_PATHS.document} size="md" />
                  </div>
                  <p className="text-xs font-bold text-text-primary">
                    {isInProgress
                      ? "No deliverables or evidence attached yet"
                      : "No reference files or specs attached yet"}
                  </p>
                  <p className="text-[11px] text-text-secondary max-w-sm mx-auto leading-relaxed">
                    {isSeller
                      ? "Upload work previews, deliverable packages, or evidence to showcase progress to the client."
                      : "Upload project specifications, wireframes, mockups, or reference assets so the specialist understands the scope."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((file) => {
                    const isImage = file.mimeType?.startsWith("image/");
                    const isPdf = file.mimeType?.includes("pdf");
                    const isZip =
                      file.mimeType?.includes("zip") || file.name.endsWith(".zip");

                    return (
                      <div
                        key={file.id}
                        className="p-5 rounded-2xl bg-white shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_6px_#d1d5db,-2px_-2px_6px_#ffffff] transition-all border border-white flex flex-col justify-between space-y-3.5"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Visual Thumbnail for Images or Icon for Documents */}
                              {isImage ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(file)}
                                  className="relative group/thumb cursor-pointer overflow-hidden rounded-xl w-12 h-12 flex-shrink-0 bg-background shadow-[2px_2px_5px_#cbd5e1] border border-white focus:outline-none"
                                  title="Click to enlarge"
                                >
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Icon path={ICON_PATHS.eye} size="sm" />
                                  </div>
                                </button>
                              ) : (
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-[2px_2px_5px_#cbd5e1]",
                                    isPdf
                                      ? "bg-rose-600"
                                      : isZip
                                        ? "bg-amber-600"
                                        : "bg-slate-700"
                                  )}
                                >
                                  <Icon
                                    path={isZip ? ICON_PATHS.folder : ICON_PATHS.document}
                                    size="sm"
                                  />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p
                                  className="text-xs font-bold text-text-primary truncate"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-text-secondary mt-0.5">
                                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                                </p>
                              </div>
                            </div>

                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex-shrink-0",
                                file.category === "deliverable"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : file.category === "evidence"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                              )}
                            >
                              {file.category || "File"}
                            </span>
                          </div>

                          {file.note && (
                            <p className="text-[11px] text-text-secondary bg-background rounded-xl p-3 shadow-[inset_1px_1px_3px_#e2e8f0,inset_-1px_-1px_3px_#ffffff] leading-relaxed italic border border-white/60">
                              "{file.note}"
                            </p>
                          )}
                        </div>

                        {/* Footer: Neumorphic Actions & Role Pill */}
                        <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-text-secondary flex items-center gap-1.5">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                file.uploaderRole === "buyer"
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                              )}
                            />
                            <span className="font-bold text-text-primary">
                              {file.uploaderRole === "buyer" ? "Client" : "Specialist"}
                            </span>
                            {file.uploaderName && (
                              <span className="text-text-secondary/70 truncate max-w-[100px]">
                                ({file.uploaderName})
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            {isImage ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(file)}
                                className="px-3 py-1.5 rounded-xl bg-background text-primary font-bold text-xs shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Icon path={ICON_PATHS.eye} size="sm" className="w-3.5 h-3.5" />
                                <span>Enlarge</span>
                              </button>
                            ) : (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-background text-primary font-bold text-xs shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] transition-all flex items-center gap-1.5"
                              >
                                <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
                                <span>Open</span>
                              </a>
                            )}

                            {(file.uploadedBy === user?.id || isBuyer || isSeller) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(file.id)}
                                disabled={deletingId === file.id}
                                className="p-1.5 rounded-xl bg-background text-text-secondary hover:text-error shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] transition-all cursor-pointer disabled:opacity-50"
                                title="Delete file"
                              >
                                {deletingId === file.id ? (
                                  <LoadingSpinner size="sm" className="w-3.5 h-3.5" />
                                ) : (
                                  <Icon path={ICON_PATHS.trash} size="sm" className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Project Updates & Notes */}
        {activeTab === "notes" && (
          <div className="space-y-5">
            {!isInProgress ? (
              /* Locked State when payment is not yet confirmed and order is not in progress */
              <div className="p-8 sm:p-10 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/60 text-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white text-amber-600 mx-auto flex items-center justify-center shadow-[3px_3px_7px_#d1d5db,-3px_-3px_7px_#ffffff]">
                  <Icon path={ICON_PATHS.lock} size="md" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    Project Updates Unlock Once Payment is Confirmed
                  </h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed mt-1">
                    Work progress updates, deliverables delivery, and milestone notes will become active once the escrow funds are reserved and the order enters "In Progress".
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("files")}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-primary bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[1px_1px_3px_#d1d5db] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Icon path={ICON_PATHS.document} size="sm" className="w-3.5 h-3.5" />
                    <span>Go to Files & Specifications</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active State when in progress */
              <>
                {/* Neumorphic Note Composer Box */}
                <form
                  onSubmit={handlePostNote}
                  className="p-5 sm:p-6 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/80 space-y-3.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white text-primary flex items-center justify-center shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
                      <Icon path={ICON_PATHS.chat} size="sm" className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Add Project Note or Milestone Update
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Write a progress note, milestone update, or instruction for this order..."
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-white/60 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-y"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isPostingNote || !noteMessage.trim()}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-hover transition-all cursor-pointer flex items-center gap-2",
                        "shadow-[3px_3px_8px_#cbd5e1] hover:shadow-[5px_5px_12px_#cbd5e1] active:scale-[0.99]",
                        "disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      {isPostingNote ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Icon path={ICON_PATHS.send} size="sm" />
                          <span>Post Update</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Timeline of Notes with Raised Neumorphic Cards */}
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Update History ({notes.length})
                  </h3>

                  {notes.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] border border-white/60 text-center space-y-2">
                      <p className="text-xs font-bold text-text-primary">
                        No project notes recorded yet
                      </p>
                      <p className="text-[11px] text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Keep a public audit trail of project requirements, feedback, and milestones.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-5 rounded-2xl bg-white shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] border border-white space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  note.authorRole === "buyer" ? "bg-blue-500" : "bg-emerald-500"
                                )}
                              />
                              <span className="text-xs font-bold text-text-primary">
                                {note.authorName ||
                                  (note.authorRole === "buyer" ? "Client" : "Specialist")}
                              </span>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-bold",
                                  note.authorRole === "buyer"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-emerald-100 text-emerald-800"
                                )}
                              >
                                {note.authorRole === "buyer" ? "Buyer" : "Freelancer"}
                              </span>
                            </div>
                            <span className="text-[10px] text-text-secondary">
                              {formatDate(note.createdAt)}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-background shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] border border-white/60">
                            <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                              {note.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Enlarging and Inspecting Image Attachments */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {previewImage.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {previewImage.category || "Attachment"}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Uploaded by {previewImage.uploaderName || previewImage.uploaderRole} •{" "}
                  {formatFileSize(previewImage.size)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-background text-primary font-semibold text-xs shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d5db] transition-all flex items-center gap-1.5"
                >
                  <Icon path={ICON_PATHS.externalLink} size="sm" className="w-3.5 h-3.5" />
                  <span>Open Original</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-xl bg-background text-text-secondary hover:text-text-primary shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d5db] transition-all cursor-pointer"
                  title="Close preview"
                >
                  <Icon path={ICON_PATHS.close} size="sm" />
                </button>
              </div>
            </div>

            {/* Enlarged Image Display */}
            <div className="flex-1 min-h-0 flex items-center justify-center bg-background rounded-xl p-2 sm:p-4 shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[68vh] max-w-full rounded-lg object-contain"
              />
            </div>

            {previewImage.note && (
              <div className="p-3 rounded-xl bg-background text-xs text-text-secondary italic shadow-[inset_1px_1px_3px_#e2e8f0]">
                "{previewImage.note}"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
