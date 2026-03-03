import { useState, useRef, useEffect } from "react";
import { UploadCloud, X } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  currentImage?: string;
  onImageSelected: (file: File | null) => void;
}

export const ImageUploadField = ({
  label,
  currentImage,
  onImageSelected,
}: ImageUploadFieldProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImage || null);
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      onImageSelected(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group ${
          previewUrl
            ? "border-[#E8BC6E] bg-[#F9F1D8]/30"
            : "border-gray-300 hover:border-[#E8BC6E] hover:bg-gray-50"
        } h-48`}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
            />
            <button
              onClick={handleClear}
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center p-6">
            <UploadCloud
              className="mx-auto text-gray-400 group-hover:text-[#E8BC6E] transition-colors"
              size={40}
            />
            <p className="mt-2 text-sm font-medium text-gray-600">
              <span className="text-[#E8BC6E] font-bold px-1">
                Haz clic para subir
              </span>
              o arrastra y suelta
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, SVG hasta 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
