import { supabase } from "@/lib/supabaseClient";

export const useSanitizedUpload = () => {
  const sanitizeFileName = (name: string) => {
    return name
      .normalize("NFD") // Remove acentos
      .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
      .replace(/[^a-zA-Z0-9.]/g, "_"); // Substitui tudo que não for alfanumérico ou ponto por "_"
  };

  const uploadFile = async (file: File, folder: string = "uploads") => {
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${folder}/${Date.now()}-${sanitizedFileName}`;

    const { error } = await supabase.storage
      .from("documentos")
      .upload(filePath, file);

    if (error) throw error;

    return filePath;
  };

  const deleteFile = async (filePath: string) => {
    if (!filePath) return;

    const { error } = await supabase.storage
      .from("documentos")
      .remove([filePath]);

    if (error) throw error;
  };

  const replaceFile = async (
    newFile: File,
    oldFilePath?: string,
    folder: string = "uploads"
  ) => {
    if (oldFilePath) {
      await deleteFile(oldFilePath);
    }
    const newFilePath = await uploadFile(newFile, folder);
    return newFilePath;
  };

  return {
    uploadFile,
    deleteFile,
    replaceFile
  };
};
