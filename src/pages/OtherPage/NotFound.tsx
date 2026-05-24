export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
      <img
        src="/images/logo/fundes.png"
        alt="FUNDES"
        className="w-48 h-auto object-contain mb-8 opacity-80"
      />
      <h1 className="text-8xl font-black text-gray-300 dark:text-gray-700 tracking-tighter">
        404
      </h1>
      <p className="mt-2 text-base text-gray-400 dark:text-gray-500 font-medium">
        Página no encontrada
      </p>
    </div>
  );
}
