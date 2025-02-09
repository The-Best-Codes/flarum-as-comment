import { Info } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <div className="mb-8">
        <Info className="w-20 h-20 text-blue-500" />
      </div>

      <h1 className="text-3xl font-semibold mb-4">Internal Service</h1>
      <p className="text-lg text-center max-w-md leading-relaxed">
        This service is for internal use only. If you are attempting to
        configure Flarum-as-Comments, please contact your developer or team for
        assistance.
      </p>
    </div>
  );
}
