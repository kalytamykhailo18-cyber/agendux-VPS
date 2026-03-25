const videos = [
  {
    id: 'AuWAyKmmt5Y',
    title: 'Cómo usar Agendux — Profesionales (Parte 1)',
  },
  {
    id: 'EBr_0FWzYDA',
    title: 'Cómo usar Agendux — Profesionales (Parte 2)',
  },
  {
    id: 'ZZnx5RduovA',
    title: 'Cómo reservar un turno — Pacientes',
  },
];

const VideosSection = () => {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 fade-down-fast">
            Cómo comenzar a usar Agendux en pocos minutos
          </h2>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videos.map((video) => (
            <div key={video.id} className="fade-up-normal">
              <div className="relative w-full overflow-hidden rounded-lg shadow-sm" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700 text-center">{video.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosSection;
