export default function Reservation() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-2xl mx-auto">
        <a 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </a>

        <h1 className="text-3xl font-bold mb-8">Réservation de Terrain</h1>

        <form className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="time" className="block text-sm font-medium">
              Heure
            </label>
            <select
              id="time"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Sélectionnez une heure</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="court" className="block text-sm font-medium">
              Terrain
            </label>
            <select
              id="court"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Sélectionnez un terrain</option>
              <option value="1">Terrain 1</option>
              <option value="2">Terrain 2</option>
              <option value="3">Terrain 3</option>
              <option value="4">Terrain 4</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Réserver
          </button>
        </form>
      </div>
    </div>
  );
} 